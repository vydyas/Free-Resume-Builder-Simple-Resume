"use client";

import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Trash2, Plus, Pencil, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { ResumeConfig, isValidConfigKey } from "@/lib/resume-config";
import debounce from "lodash/debounce";
import { FloatingControls } from './floating-controls';
import { ResumeScore } from './resume-score';
import { UserData as UserDataType } from "@/types/resume";

interface CustomSection {
  id: string;
  title: string;
  content: string;
  isVisible: boolean;
}

interface Certification {
  title: string;
  organization: string;
  completionDate: string;
  description?: string;
  credentialUrl?: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  summary: string;
  location: string;
  phoneNumber: string;
  linkedinId: string;
  githubId: string;
  positions: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  educations: Array<{
    schoolName: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  skills: Array<{
    name: string;
  }>;
  projects?: Array<{
    title: string;
    link: string;
    description: string;
  }>;
  customSections?: CustomSection[];
  certifications?: UserDataType['certifications'];
}

interface RightSidebarProps {
  config: ResumeConfig;
  onConfigChange: (key: keyof ResumeConfig, value: boolean) => void;
  userData: UserData;
  onUserDataChange: (data: Partial<UserData>) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isMobile?: boolean;
}

const SECTION_ITEMS = [
  { id: "personal-info", label: "Personal Info" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
];

export function RightSidebar({
  config,
  onConfigChange,
  userData,
  onUserDataChange,
  zoom,
  onZoomChange,
  isMobile = false,
}: RightSidebarProps) {
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("personal-info");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Create dynamic section items including custom sections
  const allSectionItems = useMemo(() => {
    const baseItems = [...SECTION_ITEMS];
    const customItems = (userData.customSections || []).map((section) => ({
      id: section.id,
      label: section.title || `Custom Section ${section.id}`,
    }));
    return [...baseItems, ...customItems];
  }, [userData.customSections]);

  // Create a memoized version of the debounce function
  const debouncedUpdate = useMemo(
    () => debounce((data: Partial<UserData>) => onUserDataChange(data), 300),
    [onUserDataChange]
  );

  // Use the memoized debounce function in handleInputChange
  const handleInputChange = useCallback(
    (field: string, value: string) => {
      const newData = {
        ...userData,
        [field]: value,
      };
      // Update local state immediately
      onUserDataChange(newData);
      // Use the memoized debounced function
      debouncedUpdate(newData);
    },
    [userData, onUserDataChange, debouncedUpdate]
  );

  // Clean up on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  const handlePositionChange = useCallback(
    (index: number, field: string, value: string) => {
      const newPositions = [...userData.positions];
      newPositions[index] = { ...newPositions[index], [field]: value };
      onUserDataChange({ ...userData, positions: newPositions });
    },
    [userData, onUserDataChange]
  );

  const handleEducationChange = useCallback(
    (index: number, field: string, value: string) => {
      const newEducations = [...userData.educations];
      newEducations[index] = { ...newEducations[index], [field]: value };
      onUserDataChange({ ...userData, educations: newEducations });
    },
    [userData, onUserDataChange]
  );

  const handleSkillChange = useCallback(
    (index: number, value: string) => {
      const newSkills = [...userData.skills];
      newSkills[index] = { name: value };
      onUserDataChange({ ...userData, skills: newSkills });
    },
    [userData, onUserDataChange]
  );

  const handleDeletePosition = useCallback(
    (index: number) => {
      const newPositions = userData.positions.filter((_, i) => i !== index);
      onUserDataChange({ ...userData, positions: newPositions });
    },
    [userData, onUserDataChange]
  );

  const handleDeleteEducation = useCallback(
    (index: number) => {
      const newEducations = userData.educations.filter((_, i) => i !== index);
      onUserDataChange({ ...userData, educations: newEducations });
    },
    [userData, onUserDataChange]
  );

  const handleDeleteSkill = useCallback(
    (index: number) => {
      const newSkills = userData.skills.filter((_, i) => i !== index);
      onUserDataChange({ ...userData, skills: newSkills });
    },
    [userData, onUserDataChange]
  );

  const handleAddCustomSection = useCallback(() => {
    const newSection: CustomSection = {
      id: `custom-${userData.customSections?.length || 0}`,
      title: "New Section",
      content: "",
      isVisible: true,
    };

    onUserDataChange({
      ...userData,
      customSections: [...(userData.customSections || []), newSection],
    });

    // Add scroll functionality
    setTimeout(() => {
      const newSectionElement = document.getElementById(`custom-section-${userData.customSections?.length || 0}`);
      if (newSectionElement) {
        newSectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100); // Small delay to ensure the DOM has updated
  }, [userData, onUserDataChange]);

  const handleCustomSectionChange = useCallback(
    (sectionId: string, field: "title" | "content", value: string) => {
      const updatedSections = (userData.customSections || []).map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      );
      onUserDataChange({
        ...userData,
        customSections: updatedSections,
      });
    },
    [userData, onUserDataChange]
  );

  const handleDeleteCustomSection = useCallback(
    (sectionId: string) => {
      const updatedSections = (userData.customSections || []).filter(
        (section) => section.id !== sectionId
      );
      onUserDataChange({
        ...userData,
        customSections: updatedSections,
      });
    },
    [userData, onUserDataChange]
  );

  const renderSectionTitle = (title: string, sectionId: string) => {
    if (editingTitle === sectionId) {
      return (
        <Input
          value={title}
          onChange={(e) =>
            handleCustomSectionChange(sectionId, "title", e.target.value)
          }
          onBlur={() => setEditingTitle(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setEditingTitle(null);
            }
          }}
          autoFocus
          className="text-sm font-bold w-full"
        />
      );
    }
    return (
      <div className="flex items-center gap-2">
        <span>{title}</span>
        <div
          onClick={(e) => {
            e.stopPropagation();
            setEditingTitle(sectionId);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Pencil className="h-3 w-3" />
        </div>
      </div>
    );
  };

  const handleProjectChange = useCallback(
    (index: number, field: string, value: string) => {
      const newProjects = [...(userData.projects || [])];
      newProjects[index] = { ...newProjects[index], [field]: value };
      onUserDataChange({ ...userData, projects: newProjects });
    },
    [userData, onUserDataChange]
  );

  const handleDeleteProject = useCallback(
    (index: number) => {
      const newProjects = userData?.projects?.filter((_, i) => i !== index);
      onUserDataChange({ ...userData, projects: newProjects });
    },
    [userData, onUserDataChange]
  );

  // Add scroll listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    
    const handleScroll = () => {
      if (scrollContainer) {
        setShowScrollTop(scrollContainer.scrollTop > 300);
      }
    };

    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Calculate resume score
  const calculateResumeScore = () => {
    let score = 0;
    let totalPossibleScore = 0;

    // Basic info checks (10 points)
    totalPossibleScore += 10;
    if (userData.firstName && userData.lastName) score += 4;
    if (userData.email) score += 2;
    if (userData.phoneNumber) score += 2;
    if (userData.location) score += 2;

    // Professional summary (25 points)
    if (userData.summary) {
      totalPossibleScore += 25;
      if (config.showSummary && userData.summary.trim()) { // Only award points if section is visible and has content
        score += 25;
      }
    }

    // Experience section (35 points)
    if (userData.positions.length > 0) {
      totalPossibleScore += 35;
      if (config.showExperience) {
        // Points for having positions
        score += 20;
        // Additional points for descriptions
        userData.positions.forEach(position => {
          if (position.description?.trim()) {
            score += 5;
          }
        });
      }
    }

    // Skills section (15 points)
    if (userData.skills.length > 0) {
      totalPossibleScore += 15;
      if (config.showSkills) {
        score += 15; // Full points for having any skills
      }
    }

    // Projects section (15 points)
    if (userData.projects && userData.projects.length > 0) {
      totalPossibleScore += 15;
      if (config.showProjects) {
        score += 10; // Points for having projects
        // Additional points for descriptions
        if (userData.projects.some(project => project.description?.trim())) {
          score += 5;
        }
      }
    }

    // Education section (5 points)
    if (userData.educations.length > 0) {
      totalPossibleScore += 5;
      if (config.showEducation) {
        score += 5;
      }
    }

    // Custom sections (5 points each)
    if (userData.customSections) {
      userData.customSections.forEach(section => {
        if (section.content.trim()) {
          totalPossibleScore += 5;
          if (section.isVisible) {
            score += 5;
          }
        }
      });
    }

    // Prevent division by zero
    if (totalPossibleScore === 0) return 0;
    
    return Math.round((score / totalPossibleScore) * 100);
  };

  const resumeScore = calculateResumeScore();

  // Add handler functions for certifications
  const handleCertificationChange = (
    index: number,
    field: keyof Certification,
    value: string
  ) => {
    const updatedCertifications = userData.certifications ? [...userData.certifications] : [];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value,
    };
    onUserDataChange({
      ...userData,
      certifications: updatedCertifications,
    });
  };

  const handleDeleteCertification = (index: number) => {
    if (!userData.certifications) return;
    const updatedCertifications = userData.certifications.filter((_, i) => i !== index);
    onUserDataChange({
      ...userData,
      certifications: updatedCertifications,
    });
  };

  return (
    <div className={`bg-background ${isMobile ? '' : 'shadow-md'} h-full flex flex-col right-sidebar`}>
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Mobile Scrollable Tabs */}
        {isMobile && (
          <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 px-4 py-3 min-w-max">
                {allSectionItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMobileTab(item.id);
                      // Scroll to the section
                      // Try data-section first (works for both standard and custom sections)
                      const element = document.querySelector(`[data-section="${item.id}"]`) || 
                                     document.querySelector(`[value="${item.id}"]`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeMobileTab === item.id
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 px-4 mb-4 relative"
        >
          {isMobile ? (
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-2 pt-4 mb-16"
              value={activeMobileTab}
              onValueChange={(value) => value && setActiveMobileTab(value)}
            >
            <AccordionItem
              value="personal-info"
              className="border rounded-lg"
              key="personal-info"
              data-section="personal-info"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Personal Information
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showPhoto")) {
                      onConfigChange("showPhoto", !config.showPhoto);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={config.showPhoto ? "Hide photo" : "Show photo"}
                >
                  {config.showPhoto ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName" className="text-lg font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={userData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-lg font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={userData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-lg font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">Location</Label>
                    <Input
                      value={userData?.location || ""}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">Phone Number</Label>
                    <Input
                      value={userData?.phoneNumber || ""}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter your phone number"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">LinkedIn Username</Label>
                    <Input
                      value={userData?.linkedinId || ""}
                      onChange={(e) =>
                        handleInputChange("linkedinId", e.target.value)
                      }
                      placeholder="Enter your LinkedIn username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">GitHub Username</Label>
                    <Input
                      value={userData?.githubId || ""}
                      onChange={(e) =>
                        handleInputChange("githubId", e.target.value)
                      }
                      placeholder="Enter your GitHub username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headline" className="text-lg font-medium">
                      Headline
                    </Label>
                    <Input
                      id="headline"
                      name="headline"
                      value={userData?.headline}
                      onChange={(e) =>
                        handleInputChange("headline", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputChange("headline", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="summary"
              className="border rounded-lg"
              key="summary"
              data-section="summary"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Summary
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showSummary")) {
                      onConfigChange("showSummary", !config.showSummary);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showSummary ? "Hide summary" : "Show summary"
                  }
                >
                  {config.showSummary ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <RichTextEditor
                  content={userData.summary}
                  onChange={(content) => handleInputChange("summary", content)}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="experience"
              className="border rounded-lg"
              key="experience"
              data-section="experience"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Experience
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showExperience")) {
                      onConfigChange("showExperience", !config.showExperience);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showExperience
                      ? "Hide experience section"
                      : "Show experience section"
                  }
                >
                  {config.showExperience ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="positions-accordion"
                >
                  {userData.positions.map((position, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <Accordion
                          type="single"
                          collapsible
                          key={`position-accordion-${index}`}
                        >
                          <AccordionItem
                            value={`position-${index}`}
                            key={`position-item-${index}`}
                          >
                            <AccordionTrigger className="text-lg font-bold">
                              {position.title || `Position ${index + 1}`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 mt-2">
                                <Input
                                  value={position.title}
                                  onChange={(e) =>
                                    handlePositionChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) =>
                                    handlePositionChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Job Title"
                                  className="mb-2"
                                />
                                <Input
                                  value={position.company}
                                  onChange={(e) =>
                                    handlePositionChange(
                                      index,
                                      "company",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) =>
                                    handlePositionChange(
                                      index,
                                      "company",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Company"
                                  className="mb-2"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    value={position.startDate}
                                    onChange={(e) =>
                                      handlePositionChange(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) =>
                                      handlePositionChange(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Start Date"
                                  />
                                  <Input
                                    value={position.endDate}
                                    onChange={(e) =>
                                      handlePositionChange(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) =>
                                      handlePositionChange(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    placeholder="End Date"
                                  />
                                </div>
                                <RichTextEditor
                                  content={position.description}
                                  onChange={(content) =>
                                    handlePositionChange(
                                      index,
                                      "description",
                                      content
                                    )
                                  }
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeletePosition(index)}
                                  className="mt-2"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Position
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      positions: [
                        ...userData.positions,
                        {
                          title: "",
                          company: "",
                          startDate: "",
                          endDate: "",
                          description: "",
                        },
                      ],
                    })
                  }
                  className="mt-2 w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="education"
              className="border rounded-lg"
              key="education"
              data-section="education"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Education
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showEducation")) {
                      onConfigChange("showEducation", !config.showEducation);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showEducation
                      ? "Hide education section"
                      : "Show education section"
                  }
                >
                  {config.showEducation ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="education-accordion"
                >
                  {userData.educations.map((education, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Input
                            value={education.schoolName}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "schoolName",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleEducationChange(
                                index,
                                "schoolName",
                                e.target.value
                              )
                            }
                            placeholder="School Name"
                            className="mb-2"
                          />
                          <Input
                            value={education.degree}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "degree",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleEducationChange(
                                index,
                                "degree",
                                e.target.value
                              )
                            }
                            placeholder="Degree"
                            className="mb-2"
                          />
                          <Input
                            value={education.fieldOfStudy}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "fieldOfStudy",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleEducationChange(
                                index,
                                "fieldOfStudy",
                                e.target.value
                              )
                            }
                            placeholder="Field of Study"
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={education.startDate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              onBlur={(e) =>
                                handleEducationChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              placeholder="Start Date"
                            />
                            <Input
                              value={education.endDate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              onBlur={(e) =>
                                handleEducationChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              placeholder="End Date"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEducation(index)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Education
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      educations: [
                        ...userData.educations,
                        {
                          schoolName: "",
                          degree: "",
                          fieldOfStudy: "",
                          startDate: "",
                          endDate: "",
                        },
                      ],
                    })
                  }
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="skills"
              className="border rounded-lg"
              key="skills"
              data-section="skills"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Skills
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showSkills")) {
                      onConfigChange("showSkills", !config.showSkills);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showSkills
                      ? "Hide skills section"
                      : "Show skills section"
                  }
                >
                  {config.showSkills ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="skills-accordion"
                >
                  {userData.skills.map((skill, index) => (
                    <div key={index} className="mb-2 flex items-center">
                      <Input
                        value={skill.name}
                        onChange={(e) =>
                          handleSkillChange(index, e.target.value)
                        }
                        onBlur={(e) => handleSkillChange(index, e.target.value)}
                        placeholder="Skill"
                        className="flex-grow"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleDeleteSkill(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      skills: [...userData.skills, { name: "" }],
                    })
                  }
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="projects"
              className="border rounded-lg"
              key="projects"
              data-section="projects"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Projects
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showProjects")) {
                      onConfigChange("showProjects", !config.showProjects);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showProjects
                      ? "Hide projects section"
                      : "Show projects section"
                  }
                >
                  {config.showProjects ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion type="multiple" className="w-full space-y-2" key="projects-accordion">
                  {(userData.projects || []).map((project, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label>Project Title</Label>
                            <Input
                              value={project.title}
                              onChange={(e) => handleProjectChange(index, "title", e.target.value)}
                              placeholder="Project Title"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Project Link</Label>
                            <Input
                              value={project.link}
                              onChange={(e) => handleProjectChange(index, "link", e.target.value)}
                              placeholder="https://..."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <RichTextEditor
                              content={project.description}
                              onChange={(content) => handleProjectChange(index, "description", content)}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProject(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      projects: [
                        ...(userData.projects || []),
                        { title: "", link: "", description: "" },
                      ],
                    })
                  }
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </AccordionContent>
            </AccordionItem>
            {(userData.customSections || []).map((section, index) => (
              <AccordionItem
                key={`custom-section-${index}`}
                id={`custom-section-${index}`}
                value={section.id}
                data-section={section.id}
                className="border rounded-lg group"
              >
                <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <AccordionTrigger className="text-sm font-bold hover:no-underline">
                    {renderSectionTitle(section.title, section.id)}
                  </AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomSection(section.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedSections = userData.customSections?.map(
                          (s) =>
                            s.id === section.id
                              ? { ...s, isVisible: !s.isVisible }
                              : s
                        );
                        onUserDataChange({
                          ...userData,
                          customSections: updatedSections,
                        });
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {section.isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <AccordionContent className="p-4">
                  <RichTextEditor
                    content={section.content}
                    onChange={(content) =>
                      handleCustomSectionChange(section.id, "content", content)
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem
              value="certifications"
              className="border rounded-lg"
              key="certifications"
              data-section="certifications"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Certifications
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showCertifications")) {
                      onConfigChange("showCertifications", !config.showCertifications);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showCertifications
                      ? "Hide certifications section"
                      : "Show certifications section"
                  }
                >
                  {config.showCertifications ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="certifications-accordion"
                >
                  {userData.certifications?.map((cert, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Input
                            value={cert.title}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Certification Title"
                            className="mb-2"
                          />
                          <Input
                            value={cert.organization}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "organization",
                                e.target.value
                              )
                            }
                            placeholder="Issuing Organization"
                            className="mb-2"
                          />
                          <Input
                            value={cert.completionDate}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "completionDate",
                                e.target.value
                              )
                            }
                            placeholder="Completion Date (e.g., Jan 2021)"
                            className="mb-2"
                          />
                          <Input
                            value={cert.credentialUrl}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "credentialUrl",
                                e.target.value
                              )
                            }
                            placeholder="Credential URL (optional)"
                            className="mb-2"
                          />
                          <div>
                            <Label>Description (optional)</Label>
                            <RichTextEditor
                              content={cert.description || ''}
                              onChange={(content) =>
                                handleCertificationChange(
                                  index,
                                  "description",
                                  content
                                )
                              }
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCertification(index)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Certification
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      certifications: [
                        ...(userData.certifications || []),
                        {
                          title: "",
                          organization: "",
                          completionDate: "",
                          description: "",
                          credentialUrl: "",
                        },
                      ],
                    })
                  }
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </AccordionContent>
            </AccordionItem>
            </Accordion>
          ) : (
            <Accordion
              type="multiple"
              className="w-full space-y-4 pt-4 mb-16"
              defaultValue={["summary"]}
            >
            <AccordionItem
              value="personal-info"
              className="border rounded-lg"
              key="personal-info"
              data-section="personal-info"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Personal Information
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showPhoto")) {
                      onConfigChange("showPhoto", !config.showPhoto);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={config.showPhoto ? "Hide photo" : "Show photo"}
                >
                  {config.showPhoto ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName" className="text-lg font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={userData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-lg font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={userData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-lg font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">Location</Label>
                    <Input
                      value={userData?.location || ""}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">Phone Number</Label>
                    <Input
                      value={userData?.phoneNumber || ""}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter your phone number"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">LinkedIn Username</Label>
                    <Input
                      value={userData?.linkedinId || ""}
                      onChange={(e) =>
                        handleInputChange("linkedinId", e.target.value)
                      }
                      placeholder="Enter your LinkedIn username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-lg">GitHub Username</Label>
                    <Input
                      value={userData?.githubId || ""}
                      onChange={(e) =>
                        handleInputChange("githubId", e.target.value)
                      }
                      placeholder="Enter your GitHub username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="headline" className="text-lg font-medium">
                      Headline
                    </Label>
                    <Input
                      id="headline"
                      name="headline"
                      value={userData?.headline}
                      onChange={(e) =>
                        handleInputChange("headline", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputChange("headline", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="summary"
              className="border rounded-lg"
              key="summary"
              data-section="summary"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Summary
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showSummary")) {
                      onConfigChange("showSummary", !config.showSummary);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showSummary ? "Hide summary" : "Show summary"
                  }
                >
                  {config.showSummary ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <RichTextEditor
                  content={userData.summary}
                  onChange={(content) => handleInputChange("summary", content)}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="experience"
              className="border rounded-lg"
              key="experience"
              data-section="experience"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Experience
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showExperience")) {
                      onConfigChange("showExperience", !config.showExperience);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showExperience
                      ? "Hide experience section"
                      : "Show experience section"
                  }
                >
                  {config.showExperience ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="positions-accordion"
                >
                  {userData.positions.map((position, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <Accordion
                          type="single"
                          collapsible
                          key={`position-accordion-${index}`}
                        >
                          <AccordionItem
                            value={`position-${index}`}
                            key={`position-item-${index}`}
                          >
                            <AccordionTrigger className="text-lg font-bold">
                              {position.title || `Position ${index + 1}`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 mt-2">
                                <Input
                                  value={position.title}
                                  onChange={(e) =>
                                    handlePositionChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) =>
                                    handlePositionChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Job Title"
                                  className="mb-2"
                                />
                                <Input
                                  value={position.company}
                                  onChange={(e) =>
                                    handlePositionChange(
                                      index,
                                      "company",
                                      e.target.value
                                    )
                                  }
                                  onBlur={(e) =>
                                    handlePositionChange(
                                      index,
                                      "company",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Company"
                                  className="mb-2"
                                />
                                <div className="flex gap-2">
                                  <Input
                                    value={position.startDate}
                                    onChange={(e) =>
                                      handlePositionChange(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) =>
                                      handlePositionChange(
                                        index,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Start Date"
                                  />
                                  <Input
                                    value={position.endDate}
                                    onChange={(e) =>
                                      handlePositionChange(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    onBlur={(e) =>
                                      handlePositionChange(
                                        index,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    placeholder="End Date"
                                  />
                                </div>
                                <RichTextEditor
                                  content={position.description}
                                  onChange={(content) =>
                                    handlePositionChange(
                                      index,
                                      "description",
                                      content
                                    )
                                  }
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeletePosition(index)}
                                  className="mt-2"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Position
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      positions: [
                        ...userData.positions,
                        {
                          title: "",
                          company: "",
                          startDate: "",
                          endDate: "",
                          description: "",
                        },
                      ],
                    })
                  }
                  className="mt-2 w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="education"
              className="border rounded-lg"
              key="education"
              data-section="education"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Education
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showEducation")) {
                      onConfigChange("showEducation", !config.showEducation);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showEducation
                      ? "Hide education section"
                      : "Show education section"
                  }
                >
                  {config.showEducation ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="education-accordion"
                >
                  {userData.educations.map((education, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Input
                            value={education.schoolName}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "schoolName",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleEducationChange(
                                index,
                                "schoolName",
                                e.target.value
                              )
                            }
                            placeholder="School Name"
                            className="mb-2"
                          />
                          <Input
                            value={education.degree}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "degree",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleEducationChange(
                                index,
                                "degree",
                                e.target.value
                              )
                            }
                            placeholder="Degree"
                            className="mb-2"
                          />
                          <Input
                            value={education.fieldOfStudy}
                            onChange={(e) =>
                              handleEducationChange(
                                index,
                                "fieldOfStudy",
                                e.target.value
                              )
                            }
                            onBlur={(e) =>
                              handleEducationChange(
                                index,
                                "fieldOfStudy",
                                e.target.value
                              )
                            }
                            placeholder="Field of Study"
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={education.startDate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              onBlur={(e) =>
                                handleEducationChange(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              placeholder="Start Date"
                            />
                            <Input
                              value={education.endDate}
                              onChange={(e) =>
                                handleEducationChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              onBlur={(e) =>
                                handleEducationChange(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              placeholder="End Date"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteEducation(index)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Education
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      educations: [
                        ...userData.educations,
                        {
                          schoolName: "",
                          degree: "",
                          fieldOfStudy: "",
                          startDate: "",
                          endDate: "",
                        },
                      ],
                    })
                  }
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="skills"
              className="border rounded-lg"
              key="skills"
              data-section="skills"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Skills
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showSkills")) {
                      onConfigChange("showSkills", !config.showSkills);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showSkills
                      ? "Hide skills section"
                      : "Show skills section"
                  }
                >
                  {config.showSkills ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="skills-accordion"
                >
                  {userData.skills.map((skill, index) => (
                    <div key={index} className="mb-2 flex items-center">
                      <Input
                        value={skill.name}
                        onChange={(e) =>
                          handleSkillChange(index, e.target.value)
                        }
                        onBlur={(e) => handleSkillChange(index, e.target.value)}
                        placeholder="Skill"
                        className="flex-grow"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => handleDeleteSkill(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      skills: [...userData.skills, { name: "" }],
                    })
                  }
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value="projects"
              className="border rounded-lg"
              key="projects"
              data-section="projects"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Projects
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showProjects")) {
                      onConfigChange("showProjects", !config.showProjects);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showProjects
                      ? "Hide projects section"
                      : "Show projects section"
                  }
                >
                  {config.showProjects ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion type="multiple" className="w-full space-y-2" key="projects-accordion">
                  {(userData.projects || []).map((project, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <Label>Project Title</Label>
                            <Input
                              value={project.title}
                              onChange={(e) => handleProjectChange(index, "title", e.target.value)}
                              placeholder="Project Title"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Project Link</Label>
                            <Input
                              value={project.link}
                              onChange={(e) => handleProjectChange(index, "link", e.target.value)}
                              placeholder="https://..."
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <RichTextEditor
                              content={project.description}
                              onChange={(content) => handleProjectChange(index, "description", content)}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteProject(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      projects: [
                        ...(userData.projects || []),
                        { title: "", link: "", description: "" },
                      ],
                    })
                  }
                  className="w-full mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </AccordionContent>
            </AccordionItem>
            {(userData.customSections || []).map((section, index) => (
              <AccordionItem
                key={`custom-section-${index}`}
                id={`custom-section-${index}`}
                value={section.id}
                data-section={section.id}
                className="border rounded-lg group"
              >
                <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <AccordionTrigger className="text-sm font-bold hover:no-underline">
                    {renderSectionTitle(section.title, section.id)}
                  </AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomSection(section.id);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedSections = userData.customSections?.map(
                          (s) =>
                            s.id === section.id
                              ? { ...s, isVisible: !s.isVisible }
                              : s
                        );
                        onUserDataChange({
                          ...userData,
                          customSections: updatedSections,
                        });
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {section.isVisible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <AccordionContent className="p-4">
                  <RichTextEditor
                    content={section.content}
                    onChange={(content) =>
                      handleCustomSectionChange(section.id, "content", content)
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
            <AccordionItem
              value="certifications"
              className="border rounded-lg"
              key="certifications"
              data-section="certifications"
            >
              <div className="flex items-center justify-between bg-muted px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <AccordionTrigger className="text-sm font-bold hover:no-underline">
                  Certifications
                </AccordionTrigger>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isValidConfigKey("showCertifications")) {
                      onConfigChange("showCertifications", !config.showCertifications);
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={
                    config.showCertifications
                      ? "Hide certifications section"
                      : "Show certifications section"
                  }
                >
                  {config.showCertifications ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
              <AccordionContent className="p-4 text-lg">
                <Accordion
                  type="multiple"
                  className="w-full space-y-2"
                  key="certifications-accordion"
                >
                  {userData.certifications?.map((cert, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Input
                            value={cert.title}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Certification Title"
                            className="mb-2"
                          />
                          <Input
                            value={cert.organization}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "organization",
                                e.target.value
                              )
                            }
                            placeholder="Issuing Organization"
                            className="mb-2"
                          />
                          <Input
                            value={cert.completionDate}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "completionDate",
                                e.target.value
                              )
                            }
                            placeholder="Completion Date (e.g., Jan 2021)"
                            className="mb-2"
                          />
                          <Input
                            value={cert.credentialUrl}
                            onChange={(e) =>
                              handleCertificationChange(
                                index,
                                "credentialUrl",
                                e.target.value
                              )
                            }
                            placeholder="Credential URL (optional)"
                            className="mb-2"
                          />
                          <div>
                            <Label>Description (optional)</Label>
                            <RichTextEditor
                              content={cert.description || ''}
                              onChange={(content) =>
                                handleCertificationChange(
                                  index,
                                  "description",
                                  content
                                )
                              }
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCertification(index)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Certification
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </Accordion>
                <Button
                  onClick={() =>
                    onUserDataChange({
                      ...userData,
                      certifications: [
                        ...(userData.certifications || []),
                        {
                          title: "",
                          organization: "",
                          completionDate: "",
                          description: "",
                          credentialUrl: "",
                        },
                      ],
                    })
                  }
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </AccordionContent>
            </AccordionItem>
            </Accordion>
          )}

          {/* Scroll to Top Button */}
          {showScrollTop && (
            <Button
              onClick={scrollToTop}
              className="fixed bottom-24 right-8 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200"
              size="icon"
              variant="ghost"
            >
              <div className="flex items-center justify-center w-full h-full">
                <ArrowUp className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
              </div>
            </Button>
          )}
        </div>
        {isMobile ? (
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-20 shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <FloatingControls
                  zoom={zoom}
                  onZoomChange={onZoomChange}
                />
                <Button 
                  onClick={handleAddCustomSection} 
                  className="flex-1 bg-gradient-to-r from-purple-600/80 to-blue-500/80 text-white hover:text-white hover:from-purple-600 hover:to-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
                  variant="ghost"
                  size="sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
                      <Plus className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium">Add Section</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between p-4 border-t bg-background">
            <FloatingControls
              zoom={zoom}
              onZoomChange={onZoomChange}
            />
            <Button 
              onClick={handleAddCustomSection} 
              className="w-[180px] bg-gradient-to-r from-purple-600/80 to-blue-500/80 text-white hover:text-white hover:from-purple-600 hover:to-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
              variant="ghost"
            >
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium">Add Custom Section</span>
              </div>
            </Button>
          </div>
        )}
        {!isMobile && <ResumeScore score={resumeScore} />}
      </div>
    </div>
  );
}
