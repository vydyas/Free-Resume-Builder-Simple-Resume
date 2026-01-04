"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import "../app/custom-styles.css";
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

export const Resume = forwardRef<ResumeRef, ResumeProps>(
  function Resume(
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
    const hasLoadedRef = useRef(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const { nameFont, nameColor, borderColor, skillsStyle, resumeBackgroundColor, headingColor, companyColor } = useStyling();

    useImperativeHandle(ref, () => ({
      downloadPDF: async () => {
        console.log('PDF download requested');
      }
    }), []);

    const generateLines = useCallback(() => {
      console.log("Generating lines for:", userData, config);

      // Get section order from localStorage
      let sectionOrder: string[] = [];
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("resumeSectionOrder");
        if (stored) {
          try {
            sectionOrder = JSON.parse(stored);
          } catch (e) {
            console.error("Failed to parse resumeSectionOrder", e);
          }
        }
      }

      // Default order if not found
      if (sectionOrder.length === 0) {
        sectionOrder = [
          "personal-info",
          "summary",
          "experience",
          "education",
          "skills",
          "projects",
          "certifications",
        ];
        // Add custom sections
        userData.customSections?.forEach((section) => {
          sectionOrder.push(section.id);
        });
      }

      // Build section data map
      const sectionDataMap: Record<string, LineItem> = {};

      // Header section (Personal Info) - only show if config.showPhoto is true
      if (config.showPhoto) {
        sectionDataMap["personal-info"] = {
          id: "line-header",
          content: (
            <Header 
              userData={userData}
              nameFont={nameFont}
              nameColor={nameColor}
            />
          ),
          type: "header",
          section: "header",
        };
      }

      // Summary section
      if (config.showSummary && userData.summary) {
        sectionDataMap["summary"] = {
          id: "line-summary",
          content: <Summary summary={userData.summary} />,
          type: "summary",
          section: "summary",
        };
      }

      // Experience section
      if (config.showExperience && userData.positions?.length > 0) {
        sectionDataMap["experience"] = {
          id: "line-positions",
          content: <Experience positions={userData.positions} />,
          type: "positions",
          section: "positions",
        };
      }

      // Education section
      if (config.showEducation && userData.educations?.length > 0) {
        sectionDataMap["education"] = {
          id: "line-education",
          content: <Education educations={userData.educations} />,
          type: "education",
          section: "education",
        };
      }

      // Skills section
      if (config.showSkills && userData.skills?.length > 0) {
        sectionDataMap["skills"] = {
          id: "line-skills",
          content: <Skills skills={userData.skills} style={skillsStyle} />,
          type: "skills",
          section: "skills",
        };
      }

      // Projects section
      if (config.showProjects && userData.projects?.length > 0) {
        sectionDataMap["projects"] = {
          id: "line-projects",
          content: <Projects projects={userData.projects} />,
          type: "projects",
          section: "projects",
        };
      }

      // Certifications section
      if (config.showCertifications && (userData.certifications?.length ?? 0) > 0) {
        sectionDataMap["certifications"] = {
          id: "line-certifications",
          content: <Certifications certifications={userData.certifications} />,
          type: "certifications",
          section: "certifications",
        };
      }

      // Custom sections
      userData.customSections?.forEach((section) => {
        if (section.isVisible) {
          sectionDataMap[section.id] = {
            id: `line-${section.id}`,
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
          };
        }
      });

      // Build ordered lines array based on sectionOrder
      const newLines: LineItem[] = [];
      sectionOrder.forEach((sectionId) => {
        const sectionData = sectionDataMap[sectionId];
        if (sectionData) {
          newLines.push(sectionData);
        }
      });

      // Add any sections that weren't in the order (shouldn't happen, but safety check)
      Object.keys(sectionDataMap).forEach((sectionId) => {
        if (!sectionOrder.includes(sectionId)) {
          newLines.push(sectionDataMap[sectionId]);
        }
      });

      return newLines;
    }, [userData, config, nameColor, nameFont, skillsStyle]);


    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (isClient) {
        const lines = generateLines();
        setLines(lines);
        // Mark as loaded once we have lines (only once, even if component remounts)
        if (!hasLoadedRef.current && lines.length > 0) {
          hasLoadedRef.current = true;
          setIsFirstLoad(false);
        } else if (hasLoadedRef.current) {
          // If we've already loaded before, don't show shimmer on remount
          setIsFirstLoad(false);
        }
      }
    }, [isClient, generateLines]);

    useEffect(() => {
      // Update lines when data changes, but don't reset isFirstLoad
      const lines = generateLines();
      setLines(lines);
    }, [userData, config, githubId, generateLines, nameColor, headingColor, borderColor, companyColor, resumeBackgroundColor]);

    // Listen for changes to section order in localStorage
    useEffect(() => {
      if (!isClient) return;

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "resumeSectionOrder") {
          const lines = generateLines();
          setLines(lines);
        }
      };

      // Listen for storage events (from other tabs/windows)
      window.addEventListener("storage", handleStorageChange);

      // Also listen for custom events (from same tab)
      const handleCustomStorageChange = () => {
        const lines = generateLines();
        setLines(lines);
      };

      window.addEventListener("resumeSectionOrderChanged", handleCustomStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("resumeSectionOrderChanged", handleCustomStorageChange);
      };
    }, [isClient, generateLines]);

    // Show shimmer only on true first load (when we haven't loaded yet and lines are empty)
    if (isFirstLoad && !hasLoadedRef.current && lines.length === 0) {
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
          resumeRef={resumeContainerRef}
          wrapperClass={wrapperClass}
          borderColor={borderColor}
          zoomStyle={zoomStyle}
          resumeBackgroundColor={resumeBackgroundColor}
        />
      </div>
    );
  }
);

Resume.displayName = 'Resume';
