"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import "../app/custom-styles.css";
import { Check } from "lucide-react";
import FancyHeading from "./fancy-heading";
import { useStyling } from "@/lib/styling-context";
import { ResumeShimmer } from "./resume-shimmer";
import { Header, Summary, Experience, Education, Skills, Projects, Certifications } from './resume-sections';
import { DefaultTemplate } from './resume-templates/default';
import { ModernTemplate } from './resume-templates/modern';
// import Image from 'next/image';
import { ResumeConfig, UserData } from '@/types/resume';

interface ResumeProps {
  userData: UserData & {
    certifications?: Array<{
      title: string;
      organization: string;
      completionDate: string;
      description?: string;
      credentialUrl?: string;
    }>;
  };
  config: ResumeConfig;
  onUserDataChange?: (newData: UserData) => void;
  githubId?: string;
  template?: string;
  zoom: number;
}

interface LineItem {
  id: string;
  content: React.ReactNode;
  type: string;
  section: string;
}

export interface ResumeRef {
  downloadPDF: () => Promise<void>;
}

export const Resume = React.memo(
  forwardRef<ResumeRef, ResumeProps>(function Resume(
    {
      userData,
      config,
      githubId,
      template = "default",
      zoom,
    }: ResumeProps,
    ref: React.ForwardedRef<ResumeRef>
  ) {
    const resumeContainerRef = useRef<HTMLDivElement>(null);
    const [isClient, setIsClient] = useState(false);
    const [lines, setLines] = useState<LineItem[]>([]);
    const [showSaveIndicator, setShowSaveIndicator] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const { nameFont, nameColor, borderColor, skillsStyle, resumeBackgroundColor } = useStyling();

    useImperativeHandle(ref, () => ({
      downloadPDF: async () => {
        console.log('PDF download requested');
      }
    }), []);

    const generateLines = useCallback(() => {
      console.log("Generating lines for:", userData, config);
      const newLines: LineItem[] = [];

      // Header section
      newLines.push({
        id: `line-${newLines.length}`,
        content: (
          <Header 
            userData={userData}
            nameFont={nameFont}
            nameColor={nameColor}
          />
        ),
        type: "header",
        section: "header",
      });

      // Summary section
      if (config.showSummary && userData.summary) {
        newLines.push({
          id: `line-${newLines.length}`,
          content: <Summary summary={userData.summary} />,
          type: "summary",
          section: "summary",
        });
      }

      // Experience section
      if (config.showExperience && userData.positions?.length > 0) {
        newLines.push({
          id: `line-${newLines.length}`,
          content: <Experience positions={userData.positions} />,
          type: "positions",
          section: "positions",
        });
      }

      // Education section
      if (config.showEducation && userData.educations?.length > 0) {
        newLines.push({
          id: `line-${newLines.length}`,
          content: <Education educations={userData.educations} />,
          type: "education",
          section: "education",
        });
      }

      // Skills section
      if (config.showSkills && userData.skills?.length > 0) {
        newLines.push({
          id: `line-${newLines.length}`,
          content: <Skills skills={userData.skills} style={skillsStyle} />,
          type: "skills",
          section: "skills",
        });
      }

      // Projects section
      if (config.showProjects && userData.projects?.length > 0) {
        newLines.push({
          id: `line-${newLines.length}`,
          content: <Projects projects={userData.projects} />,
          type: "projects",
          section: "projects",
        });
      }

      // Add Certifications section
      if (config.showCertifications) {
        newLines.push({
          id: `line-${newLines.length}`,
          content: <Certifications certifications={userData.certifications} />,
          type: "certifications",
          section: "certifications",
        });
      }

      // Custom sections
      userData.customSections?.forEach((section) => {
        if (section.isVisible) {
          newLines.push({
            id: `line-${newLines.length}`,
            content: (
              <div>
                <FancyHeading>{section.title}</FancyHeading>
                <div
                  className="text-base ml-2 rich-text-content"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ),
            type: "custom",
            section: section.id,
          });
        }
      });

      return newLines;
    }, [userData, config, nameColor, nameFont, skillsStyle]);

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
          setLines((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over?.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            // Save the new order to localStorage
            const lineOrder = newItems.map((item) => item.id);
            localStorage.setItem("resumeLineOrder", JSON.stringify(lineOrder));
            setShowSaveIndicator(true); // Show save indicator
            setTimeout(() => setShowSaveIndicator(false), 2000); // Hide after 2 seconds
            return newItems;
          });
        }
      },
      [setShowSaveIndicator]
    );

    const applyStoredLineOrder = useCallback((generatedLines: LineItem[]) => {
      try {
        const savedOrder = localStorage.getItem("resumeLineOrder");
        if (savedOrder) {
          const orderArray = JSON.parse(savedOrder);
          // Create a map of id to line item for efficient lookup
          const lineMap = new Map(
            generatedLines.map((line: LineItem) => [line.id, line])
          );
          // Reconstruct lines array based on saved order
          const orderedLines = orderArray
            .map((id: string) => lineMap.get(id))
            .filter(
              (line: LineItem | undefined): line is LineItem =>
                line !== undefined
            );
          // Add any new lines that weren't in the saved order
          const newLines = generatedLines.filter(
            (line: LineItem) => !orderArray.includes(line.id)
          );
          return [...orderedLines, ...newLines];
        }
      } catch (error) {
        console.error("Error loading line order:", error);
      }
      return generatedLines;
    }, []);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (isClient) {
        const lines = generateLines();
        const orderedLines = applyStoredLineOrder(lines);
        setLines(orderedLines);
      }
    }, [isClient, generateLines, applyStoredLineOrder]);

    useEffect(() => {
      const lines = generateLines();
      const orderedLines = applyStoredLineOrder(lines);
      setLines(orderedLines);
    }, [userData, config, githubId, generateLines, applyStoredLineOrder, nameColor]);

    useEffect(() => {
      if (isFirstLoad) {
        setIsFirstLoad(false);
      }
    }, [isFirstLoad]);

    if (isFirstLoad) {
      return <ResumeShimmer />;
    }

    const wrapperClass =
      "mx-auto bg-white overflow-hidden shadow-lg mt-8 mb-8";
    const zoomStyle = {
      transform: `scale(${zoom / 100})`,
      transformOrigin: "top center",
      width: zoom > 100 ? `${(100 * 100) / zoom}%` : "100%",
      margin: "0 auto",
    };

    const TemplateComponent = template === 'modern' ? ModernTemplate : DefaultTemplate;

    return (
      <div className="min-h-full resume-container w-[220mm]">
        {/* <div className="flex justify-center gap-2 my-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Image
              src="https://www.google.com/favicon.ico"
              width={16}
              height={16}
              alt="Google"
              className="w-4 h-4"
            />
            Google
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-gray-800">
            <Image
              src="https://www.microsoft.com/favicon.ico"
              width={16}
              height={16}
              alt="Microsoft"
              className="w-4 h-4"
            />
            Microsoft
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-900">
            <Image
              src="https://www.facebook.com/favicon.ico"
              width={16}
              height={16}
              alt="Meta"
              className="w-4 h-4"
            />
            Meta
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-900">
            <Image
              src="https://www.netflix.com/favicon.ico"
              width={16}
              height={16}
              alt="Netflix"
              className="w-4 h-4"
            />
            Netflix
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yelow-100 text-gray-900">
            <Image
              src="https://www.apple.com/favicon.ico"
              width={16}
              height={16}
              alt="Apple"
              className="w-4 h-4"
            />
            Apple
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-gray-900">
            <Image
              src="https://www.salesforce.com/favicon.ico"
              width={16}
              height={16}
              alt="Salesforce"
              className="w-4 h-4"
            />
            Salesforce
          </div>
        </div> */}
        <TemplateComponent
          lines={lines}
          onDragEnd={handleDragEnd}
          resumeRef={resumeContainerRef}
          wrapperClass={wrapperClass}
          borderColor={borderColor}
          zoomStyle={zoomStyle}
          resumeBackgroundColor={resumeBackgroundColor}
        />
        {showSaveIndicator && (
          <div className="fixed top-0 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-md transition-opacity shadow-sm z-50">
            <Check className="w-4 h-4" />
            <span className="text-sm">Saved</span>
          </div>
        )}
      </div>
    );
  }),
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render), false to re-render
    return (
      prevProps.userData === nextProps.userData &&
      prevProps.config === nextProps.config &&
      prevProps.githubId === nextProps.githubId &&
      prevProps.template === nextProps.template &&
      prevProps.zoom === nextProps.zoom
    );
  }
);

Resume.displayName = 'Resume';
