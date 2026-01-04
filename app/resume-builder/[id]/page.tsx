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
import { UserData } from "@/types/resume";
import { ErrorBoundary } from "@/components/error-boundary";
import { SharedHeader } from "@/components/shared-header";
import { Eye, X, Minus, Plus, Download } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";
import { NamePromptModal } from "@/components/name-prompt-modal";
import { useStyling, FONT_FAMILIES } from "@/lib/styling-context";
import { applyColorScheme } from "@/lib/color-scheme-utils";
import { GlobalSettings } from "@/components/global-settings";
import { Button } from "@/components/ui/button";
import { RippleButton } from "@/components/ui/ripple-button";
import { useRouter } from "next/navigation";
import { fireConfetti } from "@/lib/confetti";
import { trackEvents } from "@/lib/analytics";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [previewLoading, setPreviewLoading] = useState(false);

  const [activeTemplate, setActiveTemplate] = useState("default");
  const [githubId, setGithubId] = useState("vydyas");
  const [zoom, setZoom] = useState(100);
  const [config, setConfig] = useState<ResumeConfig>(defaultConfig);
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [resumeName, setResumeName] = useState("My Resume");

  const resumeRef = useRef<ResumeRef>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobileZoom, setMobileZoom] = useState(100);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const { user, isSignedIn } = useUser();
  const { isSignedIn: isAuthSignedIn } = useAuth();
  const router = useRouter();
  const styling = useStyling();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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

        // Load resume name
        if (resume.name) {
          setResumeName(resume.name);
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

  // Show preview shimmer when styling changes (not initial load)
  useEffect(() => {
    if (loading) return; // Don't show preview shimmer during initial load
    
    // Set preview loading when styling changes
    setPreviewLoading(true);
    
    // Clear preview loading after a brief delay
    const timeout = setTimeout(() => {
      setPreviewLoading(false);
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [
    styling.nameColor,
    styling.headingColor,
    styling.borderColor,
    styling.companyColor,
    styling.resumeBackgroundColor,
    styling.skillsStyle,
    styling.headingStyle,
    styling.headingFont,
    styling.nameFont,
  ]);

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

  const handleResumeNameChange = async (name: string) => {
    if (!resumeId || resumeId === "default") {
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update resume name");
      }

      setResumeName(name);
    } catch (error) {
      console.error("Error updating resume name:", error);
      throw error;
    }
  };

  const handleUserDataChange = async (newData: Partial<UserData>) => {
    setUserData((prevData) => ({
      ...prevData,
      ...newData,
    }));
    
    // Save to database immediately (not debounced for modal saves)
    if (resumeId && resumeId !== "default") {
      try {
        const updatedUserData = { ...userData, ...newData };
        const payload = mapStateToApiPayload(updatedUserData, config, activeTemplate, zoom, styling);
        await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Error saving resume to Supabase:", error);
        throw error; // Re-throw so modal can handle it
      }
    }
  };

  const handleZoomIn = () => {
    if (zoom < 110) {
      setZoom(zoom + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 10);
    }
  };

  const handlePrint = async () => {
    if (!isAuthSignedIn) {
      setShowAuthDialog(true);
      return;
    }

    try {
      trackEvents.resumePrinted();
      
      // Only open mobile preview on actual mobile devices (not desktop)
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        const mobilePreviewModal = document.querySelector('.fixed.inset-0.z-50');
        if (!mobilePreviewModal) {
          const openPreviewEvent = new CustomEvent('openMobilePreview');
          window.dispatchEvent(openPreviewEvent);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Small delay to ensure DOM is ready for printing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Print - will use desktop format on desktop, mobile format on mobile
      window.print();
      
      setTimeout(() => {
        fireConfetti();
      }, 500);
    } catch (error) {
      console.error('Print failed:', error);
    }
  };


  if (loading) {
    return (
      <ErrorBoundary>
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50" suppressHydrationWarning>
          <SharedHeader variant="builder" />
          <ResumeBuilderShimmer />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50" suppressHydrationWarning>
        {/* Name Prompt Modal */}
        <NamePromptModal
          open={showNamePrompt}
          onClose={() => setShowNamePrompt(false)}
          email={user?.primaryEmailAddress?.emailAddress || ""}
        />

        {/* Navigation */}
        <SharedHeader variant="builder" />

        {/* Desktop Layout */}
        <div className="hidden lg:flex flex-1 overflow-hidden print:!flex transition-all duration-500 mt-16 h-[calc(100vh-4rem)] p-2 gap-4" style={{ backgroundColor: '#f2f2f2' }}>
          {/* Sidebar - 20% (Left) */}
          <div className="w-[20%] print:hidden no-print-sidebar">
            <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-500">
              <ClientRightSidebar
                config={config}
                onConfigChange={handleConfigChange}
                userData={userData}
                onUserDataChange={handleUserDataChange}
                resumeName={resumeName}
                resumeId={resumeId}
                onResumeNameChange={handleResumeNameChange}
              />
            </div>
          </div>
          {/* Preview - 60% (Middle) */}
          <div className="flex-1 print:!w-full print:!flex-none">
            <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 print:!border-0 print:!shadow-none overflow-hidden flex flex-col">
              {/* Controls Bar */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white print:hidden flex-shrink-0 no-print-controls">
                {/* Zoom Controls - Left */}
                <div className="bg-white dark:bg-gray-900 backdrop-blur-xl rounded-[24px] shadow-lg px-2 sm:px-4 py-1 flex items-center gap-2 sm:gap-4">
                  <Button
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                    size="icon"
                    variant="outline"
                    className="w-7 h-7 sm:w-8 sm:h-8"
                    aria-label={`Zoom out (current zoom: ${zoom}%)`}
                  >
                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <span className="text-xs sm:text-sm text-gray-500 min-w-[40px] sm:min-w-[48px] text-center">
                    {zoom}%
                  </span>
                  <Button
                    onClick={handleZoomIn}
                    disabled={zoom >= 110}
                    size="icon"
                    variant="outline"
                    className="w-7 h-7 sm:w-8 sm:h-8"
                    aria-label={`Zoom in (current zoom: ${zoom}%)`}
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                {/* Download Button - Right */}
                <RippleButton
                  onClick={handlePrint}
                  className="relative overflow-hidden px-5 py-2 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium group"
                  title="Download Resume (requires sign in)"
                >
                  <Download className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-105" />
                  <span className="text-sm font-medium">Download Resume</span>
                </RippleButton>
              </div>

              {/* Resume Preview - Below Controls */}
              <div className="flex-1 flex justify-center flex-col items-center overflow-auto print-resume-wrapper transition-all duration-500">
                {previewLoading ? (
                  <ResumeShimmer />
                ) : (
                  <Resume
                    key={`${JSON.stringify(userData)}-${styling.nameColor}-${styling.headingColor}-${styling.borderColor}-${styling.companyColor}`}
                    ref={resumeRef}
                    template={activeTemplate}
                    githubId={githubId}
                    config={config}
                    userData={userData}
                    zoom={zoom}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Settings Panel - 20% (Right Side) */}
          <div className="w-[20%] print:hidden flex-shrink-0 no-print-settings">
            <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Settings</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <GlobalSettings onClose={() => {}} userData={userData} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden print:hidden flex flex-col flex-1 overflow-hidden transition-all duration-500 mt-16 h-[calc(100vh-4rem)]">
          {/* Mobile/Tablet Preview Button */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-gray-200 bg-white print:hidden">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 print:hidden">Resume Builder</h2>
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
                    {previewLoading ? (
                      <ResumeShimmer />
                    ) : (
                      <Resume
                        key={JSON.stringify(userData)}
                        ref={resumeRef}
                        template={activeTemplate}
                        githubId={githubId}
                        config={config}
                        userData={userData}
                        zoom={mobileZoom}
                      />
                    )}
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
                isMobile={true}
                resumeName={resumeName}
                resumeId={resumeId}
                onResumeNameChange={handleResumeNameChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Authentication Required Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-black">
              Sign in to Download
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 text-base">
              Please sign in to download your resume. You can create and edit your resume without signing in, but downloading requires an account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAuthDialog(false)}
              className="border-zinc-300"
            >
              Continue Editing
            </Button>
            <Button
              onClick={() => {
                setShowAuthDialog(false);
                router.push('/sign-in');
              }}
              className="bg-black text-white hover:bg-zinc-800"
            >
              Sign In to Download
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ErrorBoundary>
  );
}






