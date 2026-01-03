"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { ResumeBuilderShimmer } from "@/components/resume-builder-shimmer";
import { ResumeShimmer } from "@/components/resume-shimmer";
import { initialUserData } from "@/data/initial-user-data";
import { ClientRightSidebar } from "@/components/client-right-sidebar";
import { defaultConfig, ResumeConfig } from "@/lib/resume-config";
import { ResumeRef } from "@/components/resume";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { UserData } from "@/types/resume";
import { ErrorBoundary } from "@/components/error-boundary";
import { SharedHeader } from "@/components/shared-header";
import { Eye, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { NamePromptModal } from "@/components/name-prompt-modal";
import { useStyling, FONT_FAMILIES } from "@/lib/styling-context";
import { applyColorScheme } from "@/lib/color-scheme-utils";

const Resume = dynamic(
  () => import("@/components/resume").then((mod) => mod.Resume),
  {
    ssr: false,
    loading: () => <ResumeShimmer />,
  }
);

type ConfigKey = keyof ResumeConfig;

const isValidConfigKey = (key: string): key is ConfigKey => {
  return Object.keys(defaultConfig).includes(key);
};

function mapStateToApiPayload(
  userData: UserData,
  config: ResumeConfig,
  template: string,
  zoom: number,
  styling: ReturnType<typeof useStyling>
) {
  return {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    headline: userData.headline,
    summary: userData.summary,
    location: userData.location,
    phoneNumber: userData.phoneNumber,
    linkedinId: userData.linkedinId,
    githubId: userData.githubId,
    positions: userData.positions,
    educations: userData.educations,
    skills: userData.skills,
    projects: userData.projects,
    certifications: userData.certifications,
    customSections: userData.customSections,
    config,
    template,
    zoom,
    styling: {
      headingFont: styling.headingFont,
      headingColor: styling.headingColor,
      nameFont: styling.nameFont,
      nameColor: styling.nameColor,
      borderColor: styling.borderColor,
      skillsStyle: styling.skillsStyle,
      headingStyle: styling.headingStyle,
      resumeBackgroundColor: styling.resumeBackgroundColor,
      companyColor: styling.companyColor,
    },
  };
}

export default function ResumeBuilderPage() {
  const params = useParams();
  const resumeId = (params?.id as string) || "default";
  const [loading, setLoading] = useState(true);

  const [activeTemplate, setActiveTemplate] = useState("default");
  const [githubId, setGithubId] = useState("vydyas");
  const [zoom, setZoom] = useState(100);
  const [config, setConfig] = useState<ResumeConfig>(defaultConfig);
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const resumeRef = useRef<ResumeRef>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobileZoom, setMobileZoom] = useState(100);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const { user, isSignedIn } = useUser();
  const styling = useStyling();

  // Check if user needs to fill in their name
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isSignedIn) return;

      try {
        const response = await fetch("/api/users/preferences");
        if (response.ok) {
          const data = await response.json();
          if (!data.firstName && !data.lastName) {
            setShowNamePrompt(true);
          }
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
      }
    };

    checkUserProfile();
  }, [isSignedIn]);

  // Load resume from Supabase on mount
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!resumeId || resumeId === "default") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/resumes/${resumeId}`, {
          method: "GET",
          cache: "no-store",
        });
        
        if (!response.ok) {
          console.error("Failed to load resume");
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        const resume = data.resume;
        
        if (!resume) {
          setLoading(false);
          return;
        }

        // Load user data
        setUserData({
          firstName: resume.first_name || initialUserData.firstName,
          lastName: resume.last_name || initialUserData.lastName,
          email: resume.email || initialUserData.email,
          headline: resume.headline || initialUserData.headline,
          summary: resume.summary || initialUserData.summary,
          location: resume.location || initialUserData.location,
          phoneNumber: resume.phone_number || initialUserData.phoneNumber,
          linkedinId: resume.linkedin_id || initialUserData.linkedinId,
          githubId: resume.github_id || initialUserData.githubId,
          positions: resume.positions || initialUserData.positions,
          educations: resume.educations || initialUserData.educations,
          skills: resume.skills || initialUserData.skills,
          projects: resume.projects || initialUserData.projects,
          certifications: resume.certifications || initialUserData.certifications,
          customSections: resume.custom_sections || initialUserData.customSections,
        });

        // Load config
        if (resume.config) {
          setConfig({
            ...defaultConfig,
            ...resume.config,
          });
        }

        // Load template
        if (resume.template) {
          setActiveTemplate(resume.template);
        }

        // Load zoom
        if (typeof resume.zoom === "number") {
          setZoom(Math.min(resume.zoom, 110));
        }

        // Load github ID
        if (resume.github_id) {
          setGithubId(resume.github_id);
        }

        // Load styling settings
        if (resume.styling && typeof resume.styling === 'object') {
          interface StylingData {
            headingColor?: string;
            nameColor?: string;
            borderColor?: string;
            companyColor?: string;
            resumeBackgroundColor?: string;
            skillsStyle?: 'chips' | 'list';
            headingStyle?: 'background' | 'border-bottom' | 'border-top';
            headingFont?: keyof typeof FONT_FAMILIES;
            nameFont?: keyof typeof FONT_FAMILIES;
          }
          const stylingData = resume.styling as StylingData;
          if (stylingData.headingColor) styling.updateHeadingColor(stylingData.headingColor);
          if (stylingData.nameColor) styling.updateNameColor(stylingData.nameColor);
          if (stylingData.borderColor) styling.setBorderColor(stylingData.borderColor);
          if (stylingData.companyColor) styling.updateCompanyColor(stylingData.companyColor);
          if (stylingData.resumeBackgroundColor) styling.setResumeBackgroundColor(stylingData.resumeBackgroundColor);
          if (stylingData.skillsStyle) styling.setSkillsStyle(stylingData.skillsStyle);
          if (stylingData.headingStyle) styling.setHeadingStyle(stylingData.headingStyle);
          if (stylingData.headingFont) styling.updateHeadingFont(stylingData.headingFont);
          if (stylingData.nameFont) styling.updateNameFont(stylingData.nameFont);
        } else {
          // Fallback: Apply color scheme theme colors if no styling data
          if (typeof window !== "undefined") {
            const colorScheme = localStorage.getItem(`resume:${resumeId}:colorScheme`) || "emerald";
            applyColorScheme(colorScheme, styling);
          }
        }
      } catch (error) {
        console.error("Error loading resume from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

      loadFromSupabase();
  }, [resumeId, styling]);

  // Listen for print event to open mobile preview
  useEffect(() => {
    const handleOpenPreview = () => {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setShowMobilePreview(true);
      }
    };

    window.addEventListener("openMobilePreview", handleOpenPreview);
    return () => {
      window.removeEventListener("openMobilePreview", handleOpenPreview);
    };
  }, []);

  // Calculate mobile zoom based on viewport
  useEffect(() => {
    if (!showMobilePreview || typeof window === "undefined") return;

    const calculateMobileZoom = () => {
      const resumeWidthPx = 220 * 3.779;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 32;
      const headerHeight = 73;

      const availableWidth = viewportWidth - padding;
      const availableHeight = viewportHeight - headerHeight - padding;

      const widthZoom = (availableWidth / resumeWidthPx) * 100;

      const resumeHeightPx = 297 * 3.779;
      const heightZoom = (availableHeight / resumeHeightPx) * 100;

      const calculatedZoom = Math.min(widthZoom, heightZoom, 100);

      setMobileZoom(Math.max(Math.min(calculatedZoom, 100), 25));
    };

    calculateMobileZoom();

    const handleResize = () => {
      calculateMobileZoom();
    };

    window.addEventListener("resize", handleResize);
    const timeoutId = setTimeout(calculateMobileZoom, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [showMobilePreview]);


  // Persist to Supabase when data changes (debounced)
  useEffect(() => {
    if (!resumeId || resumeId === "default" || loading) return;

    const timeout = setTimeout(async () => {
      try {
        const payload = mapStateToApiPayload(userData, config, activeTemplate, zoom, styling);
        await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Error saving resume to Supabase:", error);
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [
    resumeId,
    userData,
    config,
    activeTemplate,
    zoom,
    loading,
    styling,
    styling.skillsStyle,
    styling.headingStyle,
    styling.headingFont,
    styling.nameFont,
  ]);

  const handleConfigChange = (key: unknown, value: boolean) => {
    const stringKey = String(key);
    if (!isValidConfigKey(stringKey)) {
      console.error(`Invalid config key: ${stringKey}`);
      return;
    }
    setConfig((prevConfig) => ({
      ...prevConfig,
      [stringKey]: value,
    }));
  };

  const handleUserDataChange = (newData: Partial<UserData>) => {
    setUserData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col bg-white h-screen">
          <SharedHeader variant="builder" />
          <ResumeBuilderShimmer />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col bg-white h-screen">
        {/* Name Prompt Modal */}
        <NamePromptModal
          open={showNamePrompt}
          onClose={() => setShowNamePrompt(false)}
          email={user?.primaryEmailAddress?.emailAddress || ""}
        />

        {/* Navigation */}
        <SharedHeader variant="builder" />

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1 overflow-hidden print:!flex transition-all duration-500 mt-16 h-[calc(100vh-4rem)]">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={40} className="print:!w-full print:!flex-none">
              <div className="flex justify-center flex-col items-center h-full print-resume-wrapper transition-all duration-500">
                <Resume
                  key={JSON.stringify(userData)}
                  ref={resumeRef}
                  template={activeTemplate}
                  githubId={githubId}
                  config={config}
                  userData={userData}
                  zoom={zoom}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="w-2 hover:bg-gray-300 transition-colors resize-handle print:hidden">
              <div className="w-1 h-full mx-auto bg-gray-200" />
            </PanelResizeHandle>
            <Panel defaultSize={50} minSize={30} className="print:hidden">
              <div className="h-full transition-all duration-500">
                <ClientRightSidebar
                  config={config}
                  onConfigChange={handleConfigChange}
                  userData={userData}
                  onUserDataChange={handleUserDataChange}
                  zoom={zoom}
                  onZoomChange={setZoom}
                />
              </div>
            </Panel>
          </PanelGroup>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden flex flex-col flex-1 overflow-hidden transition-all duration-500 mt-16 h-[calc(100vh-4rem)]">
          {/* Mobile/Tablet Preview Button */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-gray-200 bg-white">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Resume Builder</h2>
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">{showMobilePreview ? "Hide Preview" : "Preview Resume"}</span>
              <span className="sm:hidden">{showMobilePreview ? "Hide" : "Preview"}</span>
            </button>
          </div>

          {/* Mobile/Tablet Preview Modal */}
          {showMobilePreview && (
            <div className="fixed inset-0 z-50 bg-white flex flex-col print:static print:block">
              <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-gray-200 bg-white flex-shrink-0 print:hidden">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Resume Preview</h2>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="p-2 sm:p-2.5 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors touch-manipulation"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50 flex items-start justify-center p-2 sm:p-4 md:p-6 print:overflow-visible print:p-0 print:bg-white">
                <div className="w-full max-w-4xl flex items-center justify-center min-h-full py-3 sm:py-4 md:py-6 print:py-0">
                  <div className="bg-white shadow-lg w-full print:shadow-none print:w-full" style={{ maxWidth: "100%" }}>
                    <Resume
                      key={JSON.stringify(userData)}
                      ref={resumeRef}
                      template={activeTemplate}
                      githubId={githubId}
                      config={config}
                      userData={userData}
                      zoom={mobileZoom}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Form Section */}
          {!showMobilePreview && (
            <div className="flex-1 overflow-hidden transition-all duration-500">
              <ClientRightSidebar
                config={config}
                onConfigChange={handleConfigChange}
                userData={userData}
                onUserDataChange={handleUserDataChange}
                zoom={zoom}
                onZoomChange={setZoom}
                isMobile={true}
              />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}






