"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { ResumeShimmer } from "@/components/resume-shimmer";
import { initialUserData } from "@/data/initial-user-data";
import { ClientRightSidebar } from "@/components/client-right-sidebar";
import { defaultConfig, ResumeConfig } from "@/lib/resume-config";
import { ResumeRef } from "@/components/resume";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { UserData } from '@/types/resume';
import { ErrorBoundary } from '@/components/error-boundary';
import { SharedHeader } from '@/components/shared-header';
import { Eye, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { NamePromptModal } from "@/components/name-prompt-modal";

const Resume = dynamic(
  () => import("@/components/resume").then((mod) => mod.Resume),
  {
    ssr: false,
    loading: () => <ResumeShimmer />
  }
);

type ConfigKey = keyof ResumeConfig;

const isValidConfigKey = (key: string): key is ConfigKey => {
  return Object.keys(defaultConfig).includes(key);
};

export default function LandingPage() {
  const [activeTemplate, setActiveTemplate] = useState("default");
  const [githubId, setGithubId] = useState("vydyas");
  const [zoom, setZoom] = useState(() => {
    if (typeof window !== "undefined") {
      const savedZoom = localStorage.getItem("resumeZoom");
      return savedZoom ? Math.min(parseInt(savedZoom), 110) : 100;
    }
    return 100;
  });
  const [config, setConfig] = useState<ResumeConfig>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeConfig");
      return saved ? JSON.parse(saved) : defaultConfig;
    }
    return defaultConfig;
  });

  const [userData, setUserData] = useState<UserData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeData");
      return saved ? JSON.parse(saved) : initialUserData;
    }
    return initialUserData;
  });

  const resumeRef = useRef<ResumeRef>(null);
  const [template, ] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("resumeTemplate") || "default";
    }
    return "default";
  });
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobileZoom, setMobileZoom] = useState(100);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const { user, isSignedIn } = useUser();

  // Check if user needs to fill in their name
  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isSignedIn) return;
      
      try {
        const response = await fetch("/api/users/preferences");
        if (response.ok) {
          const data = await response.json();
          // Show prompt if both firstName and lastName are empty
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

  // Listen for print event to open mobile preview
  useEffect(() => {
    const handleOpenPreview = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setShowMobilePreview(true);
      }
    };

    window.addEventListener('openMobilePreview', handleOpenPreview);
    return () => {
      window.removeEventListener('openMobilePreview', handleOpenPreview);
    };
  }, []);

  // Calculate mobile zoom based on viewport
  useEffect(() => {
    if (!showMobilePreview || typeof window === "undefined") return;

    const calculateMobileZoom = () => {
      // A4 width in mm: 210mm, but resume uses 220mm
      // Convert to pixels: 220mm ≈ 829px at 96dpi (1mm ≈ 3.779px)
      const resumeWidthPx = 220 * 3.779; // ~831px
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 32; // 16px on each side
      const headerHeight = 73; // Header + padding
      
      // Available width and height
      const availableWidth = viewportWidth - padding;
      const availableHeight = viewportHeight - headerHeight - padding;
      
      // Calculate zoom based on width (how much to scale down to fit)
      const widthZoom = (availableWidth / resumeWidthPx) * 100;
      
      // Calculate zoom based on height (A4 height ≈ 297mm = 1122px)
      const resumeHeightPx = 297 * 3.779; // ~1122px
      const heightZoom = (availableHeight / resumeHeightPx) * 100;
      
      // Use the smaller zoom to fit both dimensions, but don't exceed 100%
      const calculatedZoom = Math.min(widthZoom, heightZoom, 100);
      
      // Set zoom with a minimum of 25% and maximum of 100%
      setMobileZoom(Math.max(Math.min(calculatedZoom, 100), 25));
    };

    // Calculate immediately and on resize
    calculateMobileZoom();
    
    const handleResize = () => {
      calculateMobileZoom();
    };

    window.addEventListener("resize", handleResize);
    // Also recalculate after a short delay to ensure layout is settled
    const timeoutId = setTimeout(calculateMobileZoom, 100);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [showMobilePreview]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeData", JSON.stringify(userData));
      localStorage.setItem("resumeConfig", JSON.stringify(config));
      localStorage.setItem("resumeTemplate", activeTemplate);
      localStorage.setItem("resumeGithubId", githubId);
      localStorage.setItem("resumeZoom", zoom.toString());
    }
  }, [userData, config, activeTemplate, githubId, zoom]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTemplate = localStorage.getItem("resumeTemplate");
      const savedGithubId = localStorage.getItem("resumeGithubId");
      const savedZoom = localStorage.getItem("resumeZoom");

      if (savedTemplate) setActiveTemplate(savedTemplate);
      if (savedGithubId) setGithubId(savedGithubId);
      if (savedZoom) setZoom(parseInt(savedZoom));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeTemplate", template);
    }
  }, [template]);

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
        <div className="hidden lg:flex flex-1 overflow-hidden print:!flex">
          <PanelGroup direction="horizontal">
            <Panel defaultSize={60} minSize={50} className="print:!w-full print:!flex-none">
              <div className="flex justify-center flex-col items-center h-full print-resume-wrapper">
                <Resume
                  ref={resumeRef}
                  template={template}
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
            <Panel defaultSize={40} minSize={30} className="print:hidden">
              <ClientRightSidebar
                config={config}
                onConfigChange={handleConfigChange}
                userData={userData}
                onUserDataChange={handleUserDataChange}
                zoom={zoom}
                onZoomChange={setZoom}
              />
            </Panel>
          </PanelGroup>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden flex flex-col flex-1 overflow-hidden">
          {/* Mobile Preview Button */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Resume Builder</h2>
            <button
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              {showMobilePreview ? "Hide Preview" : "Preview Resume"}
            </button>
          </div>

          {/* Mobile Preview Modal */}
          {showMobilePreview && (
            <div className="fixed inset-0 z-50 bg-white flex flex-col print:static print:block">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0 print:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close preview"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-gray-50 flex items-start justify-center p-2 sm:p-4 print:overflow-visible print:p-0 print:bg-white">
                <div className="w-full flex items-center justify-center min-h-full py-4 print:py-0">
                  <div className="bg-white shadow-lg w-full print:shadow-none print:w-full" style={{ maxWidth: '100%' }}>
                    <Resume
                      key={JSON.stringify(userData)}
                      ref={resumeRef}
                      template={template}
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
            <div className="flex-1 overflow-hidden">
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
