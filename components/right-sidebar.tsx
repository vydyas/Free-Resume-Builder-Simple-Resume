"use client";

import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye, EyeOff, GripVertical, Pencil } from "lucide-react";
import { EditResumeNameModal } from "@/components/edit-resume-name-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResumeConfig, isValidConfigKey } from "@/lib/resume-config";
import { UserData as UserDataType } from "@/types/resume";
import { SectionModal } from "@/components/section-modal";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";

interface CustomSection {
  id: string;
  title: string;
  content: string;
  isVisible: boolean;
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
  onUserDataChange: (data: Partial<UserData>) => Promise<void>;
  isMobile?: boolean;
  resumeName?: string;
  resumeId?: string;
  onResumeNameChange?: (name: string) => Promise<void>;
}

const SECTION_ITEMS = [
  { id: "personal-info", label: "Personal Info", configKey: "showPhoto" as keyof ResumeConfig },
  { id: "summary", label: "Summary", configKey: "showSummary" as keyof ResumeConfig },
  { id: "experience", label: "Experience", configKey: "showExperience" as keyof ResumeConfig },
  { id: "education", label: "Education", configKey: "showEducation" as keyof ResumeConfig },
  { id: "skills", label: "Skills", configKey: "showSkills" as keyof ResumeConfig },
  { id: "projects", label: "Projects", configKey: "showProjects" as keyof ResumeConfig },
  { id: "certifications", label: "Certifications", configKey: "showCertifications" as keyof ResumeConfig },
];

interface SortableSectionItemProps {
  id: string;
  label: string;
  isCustom: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onDelete?: () => void;
  onClick: () => void;
}

function SortableSectionItem({
  id,
  label,
  isCustom,
  isVisible,
  onToggleVisibility,
  onDelete,
  onClick,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <Button
        variant="outline"
        className="flex-1 justify-start"
        onClick={onClick}
      >
        {label}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="opacity-70 hover:opacity-100"
        aria-label={isVisible ? "Hide section" : "Show section"}
      >
        {isVisible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </Button>
      {isCustom && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function RightSidebar({
  config,
  onConfigChange,
  userData,
  onUserDataChange,
  resumeName = "My Resume",
  resumeId,
  onResumeNameChange,
}: RightSidebarProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const resumeNameRef = useRef<HTMLHeadingElement>(null);
  const [isNameTruncated, setIsNameTruncated] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    // Initialize order from localStorage or default
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("resumeSectionOrder");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall through to default
        }
      }
    }
    // Default order: base sections first, then custom sections
    const baseIds = SECTION_ITEMS.map((item) => item.id);
    const customIds = (userData.customSections || []).map((s) => s.id);
    return [...baseIds, ...customIds];
  });

  // Create dynamic section items including custom sections
  const allSectionItems = useMemo(() => {
    const baseItems = SECTION_ITEMS.map((item) => ({
      id: item.id,
      label: item.label,
      configKey: item.configKey,
    }));
    const customItems = (userData.customSections || []).map((section) => ({
      id: section.id,
      label: section.title || `Custom Section ${section.id}`,
      configKey: null as null,
    }));
    
    // Combine and sort by sectionOrder
    const all = [...baseItems, ...customItems];
    const ordered = sectionOrder
      .map((id) => all.find((item) => item.id === id))
      .filter((item): item is typeof all[0] => item !== undefined);
    
    // Add any new items that aren't in the order yet
    const existingIds = new Set(ordered.map((item) => item.id));
    const newItems = all.filter((item) => !existingIds.has(item.id));
    
    return [...ordered, ...newItems];
  }, [userData.customSections, sectionOrder]);

  // Check if resume name is truncated
  useEffect(() => {
    const checkTruncation = () => {
      if (resumeNameRef.current) {
        const isTruncated = resumeNameRef.current.scrollWidth > resumeNameRef.current.clientWidth;
        setIsNameTruncated(isTruncated);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [resumeName]);

  // Update section order when custom sections change
  useEffect(() => {
    const baseIds = SECTION_ITEMS.map((item) => item.id);
    const customIds = (userData.customSections || []).map((s) => s.id);
    const allIds = [...baseIds, ...customIds];
    
    // Update order to include new sections
    setSectionOrder((prev) => {
      const existing = prev.filter((id) => allIds.includes(id));
      const newIds = allIds.filter((id) => !prev.includes(id));
      const updated = [...existing, ...newIds];
      
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("resumeSectionOrder", JSON.stringify(updated));
      }
      
      return updated;
    });
  }, [userData.customSections]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("resumeSectionOrder", JSON.stringify(newOrder));
        }
        
        return newOrder;
      });
    }
  };

  // Dispatch event after section order changes (using useEffect to avoid render-time updates)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Use setTimeout to ensure this runs after the state update
      const timeoutId = setTimeout(() => {
        window.dispatchEvent(new Event("resumeSectionOrderChanged"));
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [sectionOrder]);

  const getSectionVisibility = (item: typeof allSectionItems[0]) => {
    if (item.configKey && isValidConfigKey(item.configKey)) {
      return config[item.configKey];
    }
    // For custom sections
    if (item.id.startsWith("custom-")) {
      const customSection = userData.customSections?.find((s) => s.id === item.id);
      return customSection?.isVisible ?? true;
    }
    return true;
  };

  const handleToggleVisibility = (item: typeof allSectionItems[0]) => {
    if (item.configKey && isValidConfigKey(item.configKey)) {
      onConfigChange(item.configKey, !config[item.configKey]);
    } else if (item.id.startsWith("custom-")) {
      const updatedSections = (userData.customSections || []).map((s) =>
        s.id === item.id ? { ...s, isVisible: !s.isVisible } : s
      );
      onUserDataChange({
        ...userData,
        customSections: updatedSections,
      });
    }
  };

  const handleAddCustomSection = useCallback(() => {
    const newSection: CustomSection = {
      id: `custom-${Date.now()}`,
      title: "New Section",
      content: "",
      isVisible: true,
    };

    onUserDataChange({
      ...userData,
      customSections: [...(userData.customSections || []), newSection],
    });

    // Open the modal for the new section
    setOpenSection(newSection.id);
  }, [userData, onUserDataChange]);

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

      return (
    <>
    <div className={`bg-background h-full flex flex-col right-sidebar`}>
      {/* Resume Name Header */}
      {resumeId && resumeId !== "default" && (
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h2 
                    ref={resumeNameRef}
                    className="text-base font-semibold text-gray-900 flex-1 truncate"
                  >
                    {resumeName}
                  </h2>
                </TooltipTrigger>
                {isNameTruncated && (
                  <TooltipContent side="bottom">
                    <p>{resumeName}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            {onResumeNameChange && (
                <button
                onClick={() => setShowEditNameModal(true)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
                aria-label="Edit resume name"
              >
                <Pencil className="w-4 h-4" />
                </button>
            )}
              </div>
              </div>
      )}
      <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-600 px-4 py-4 relative">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={allSectionItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                  {allSectionItems.map((item) => {
                    const isCustom = item.id.startsWith('custom-');
                    const isVisible = getSectionVisibility(item);
                    return (
                      <SortableSectionItem
                    key={item.id}
                        id={item.id}
                        label={item.label}
                        isCustom={isCustom}
                        isVisible={isVisible}
                        onToggleVisibility={() => handleToggleVisibility(item)}
                        onDelete={isCustom ? () => handleDeleteCustomSection(item.id) : undefined}
                        onClick={() => setOpenSection(item.id)}
                      />
                    );
                  })}
                          </div>
              </SortableContext>
            </DndContext>
                        </div>
          <div className="flex justify-end p-4 border-t bg-background">
                <Button
                  onClick={handleAddCustomSection} 
              className="w-full"
              variant="outline"
                >
                  <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add Custom Section</span>
                  </div>
                          </Button>
                        </div>
              </div>
                  </div>
      
      {/* Section Modals */}
      {allSectionItems.map((item) => (
        <SectionModal
          key={item.id}
          open={openSection === item.id}
          onClose={() => setOpenSection(null)}
          sectionId={item.id}
          sectionLabel={item.label}
          userData={userData}
          config={config}
          onUserDataChange={onUserDataChange}
          onConfigChange={onConfigChange}
        />
      ))}

      {/* Edit Resume Name Modal */}
      {onResumeNameChange && (
        <EditResumeNameModal
          open={showEditNameModal}
          onOpenChange={setShowEditNameModal}
          currentName={resumeName}
          onSave={async (name: string) => {
            await onResumeNameChange(name);
            setShowEditNameModal(false);
          }}
        />
      )}
    </>
  );
}
