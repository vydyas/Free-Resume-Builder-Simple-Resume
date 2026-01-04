"use client";

import React, { useState, useEffect } from "react";
import { Loader2, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { ResumeConfig } from "@/lib/resume-config";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  certifications?: Certification[];
}

interface SectionModalProps {
  open: boolean;
  onClose: () => void;
  sectionId: string;
  sectionLabel: string;
  userData: UserData;
  onUserDataChange: (data: Partial<UserData>) => Promise<void>;
  config?: ResumeConfig;
  onConfigChange?: (key: keyof ResumeConfig, value: boolean) => void;
}

export function SectionModal({
  open,
  onClose,
  sectionId,
  sectionLabel,
  userData,
  onUserDataChange,
}: SectionModalProps) {
  const [localUserData, setLocalUserData] = useState(userData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalUserData(userData);
  }, [userData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUserDataChange(localUserData);
      onClose();
    } catch (error) {
      console.error("Error saving section:", error);
      // Keep modal open on error so user can retry
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePositionChange = (index: number, field: string, value: string) => {
    const newPositions = [...localUserData.positions];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setLocalUserData({ ...localUserData, positions: newPositions });
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const newEducations = [...localUserData.educations];
    newEducations[index] = { ...newEducations[index], [field]: value };
    setLocalUserData({ ...localUserData, educations: newEducations });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...localUserData.skills];
    newSkills[index] = { name: value };
    setLocalUserData({ ...localUserData, skills: newSkills });
  };

  const handleProjectChange = (index: number, field: string, value: string) => {
    const newProjects = [...(localUserData.projects || [])];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setLocalUserData({ ...localUserData, projects: newProjects });
  };

  const handleCertificationChange = (
    index: number,
    field: keyof Certification,
    value: string
  ) => {
    const updatedCertifications = localUserData.certifications ? [...localUserData.certifications] : [];
    updatedCertifications[index] = {
      ...updatedCertifications[index],
      [field]: value,
    };
    setLocalUserData({
      ...localUserData,
      certifications: updatedCertifications,
    });
  };

  const handleDeletePosition = (index: number) => {
    const newPositions = localUserData.positions.filter((_, i) => i !== index);
    setLocalUserData({ ...localUserData, positions: newPositions });
  };

  const handleDeleteEducation = (index: number) => {
    const newEducations = localUserData.educations.filter((_, i) => i !== index);
    setLocalUserData({ ...localUserData, educations: newEducations });
  };

  const handleDeleteSkill = (index: number) => {
    const newSkills = localUserData.skills.filter((_, i) => i !== index);
    setLocalUserData({ ...localUserData, skills: newSkills });
  };

  const handleDeleteProject = (index: number) => {
    const newProjects = localUserData?.projects?.filter((_, i) => i !== index);
    setLocalUserData({ ...localUserData, projects: newProjects });
  };

  const handleDeleteCertification = (index: number) => {
    if (!localUserData.certifications) return;
    const updatedCertifications = localUserData.certifications.filter((_, i) => i !== index);
    setLocalUserData({
      ...localUserData,
      certifications: updatedCertifications,
    });
  };

  const handleCustomSectionChange = (sectionId: string, field: "title" | "content", value: string) => {
    const updatedSections = (localUserData.customSections || []).map((section) =>
      section.id === sectionId ? { ...section, [field]: value } : section
    );
    setLocalUserData({
      ...localUserData,
      customSections: updatedSections,
    });
  };

  // Drag and drop handlers
  const handleDragEndPositions = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = localUserData.positions.findIndex((_, i) => `position-${i}` === active.id);
      const newIndex = localUserData.positions.findIndex((_, i) => `position-${i}` === over?.id);
      const newPositions = arrayMove(localUserData.positions, oldIndex, newIndex);
      setLocalUserData({ ...localUserData, positions: newPositions });
    }
  };

  const handleDragEndEducations = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = localUserData.educations.findIndex((_, i) => `education-${i}` === active.id);
      const newIndex = localUserData.educations.findIndex((_, i) => `education-${i}` === over?.id);
      const newEducations = arrayMove(localUserData.educations, oldIndex, newIndex);
      setLocalUserData({ ...localUserData, educations: newEducations });
    }
  };

  const handleDragEndCertifications = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!localUserData.certifications) return;
    if (active.id !== over?.id) {
      const oldIndex = localUserData.certifications.findIndex((_, i) => `cert-${i}` === active.id);
      const newIndex = localUserData.certifications.findIndex((_, i) => `cert-${i}` === over?.id);
      const newCertifications = arrayMove(localUserData.certifications, oldIndex, newIndex);
      setLocalUserData({ ...localUserData, certifications: newCertifications });
    }
  };

  // Sortable Accordion Item Component
  const SortableAccordionItem = ({ 
    id, 
    children, 
    triggerContent 
  }: { 
    id: string; 
    children: React.ReactNode; 
    triggerContent: React.ReactNode;
  }) => {
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
      <div ref={setNodeRef} style={style}>
        <AccordionItem value={id} className="border rounded-lg mb-2">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              <GripVertical className="h-4 w-4 text-gray-400" />
            </div>
            <AccordionTrigger className="flex-1 px-4 min-w-0">
              <div className="flex-1 min-w-0 text-left">
                {triggerContent}
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="px-4 pb-4">
            {children}
          </AccordionContent>
        </AccordionItem>
      </div>
    );
  };

  const renderSectionContent = () => {
    switch (sectionId) {
      case "personal-info":
        return (
          <div className="space-y-4 px-1">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={localUserData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={localUserData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={localUserData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={localUserData?.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={localUserData?.phoneNumber || ""}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                type="tel"
                className="mt-1"
              />
            </div>
            <div>
              <Label>LinkedIn Username</Label>
              <Input
                value={localUserData?.linkedinId || ""}
                onChange={(e) => handleInputChange("linkedinId", e.target.value)}
                placeholder="Enter your LinkedIn username"
                className="mt-1"
              />
            </div>
            <div>
              <Label>GitHub Username</Label>
              <Input
                value={localUserData?.githubId || ""}
                onChange={(e) => handleInputChange("githubId", e.target.value)}
                placeholder="Enter your GitHub username"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={localUserData?.headline}
                onChange={(e) => handleInputChange("headline", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-4 px-1">
            <RichTextEditor
              content={localUserData.summary}
              onChange={(content) => handleInputChange("summary", content)}
            />
          </div>
        );

      case "experience":
        return (
          <div className="space-y-4 px-1">
            {localUserData.positions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No data. Click &quot;Add Position&quot; to add your first experience.
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndPositions}>
                <SortableContext
                  items={localUserData.positions.map((_, i) => `position-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <Accordion type="multiple" defaultValue={[]} className="w-full">
                    {localUserData.positions.map((position, index) => (
                      <SortableAccordionItem
                        key={index}
                        id={`position-${index}`}
                        triggerContent={
                          <div className="text-left flex-1">
                            <div className="font-medium">
                              {position.title || "Untitled Position"}
                            </div>
                            {position.company && (
                              <div className="text-sm text-gray-500">{position.company}</div>
                            )}
                          </div>
                        }
                      >
                        <div className="space-y-2">
                          <Input
                            value={position.title}
                            onChange={(e) =>
                              handlePositionChange(index, "title", e.target.value)
                            }
                            placeholder="Job Title"
                            className="mb-2"
                          />
                          <Input
                            value={position.company}
                            onChange={(e) =>
                              handlePositionChange(index, "company", e.target.value)
                            }
                            placeholder="Company"
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={position.startDate}
                              onChange={(e) =>
                                handlePositionChange(index, "startDate", e.target.value)
                              }
                              placeholder="Start Date"
                            />
                            <Input
                              value={position.endDate}
                              onChange={(e) =>
                                handlePositionChange(index, "endDate", e.target.value)
                              }
                              placeholder="End Date"
                            />
                          </div>
                          <RichTextEditor
                            content={position.description}
                            onChange={(content) =>
                              handlePositionChange(index, "description", content)
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
                      </SortableAccordionItem>
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            )}
          </div>
        );

      case "education":
        return (
          <div className="space-y-4 px-1">
            {localUserData.educations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No data. Click &quot;Add Education&quot; to add your first education.
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndEducations}>
                <SortableContext
                  items={localUserData.educations.map((_, i) => `education-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <Accordion type="multiple" defaultValue={[]} className="w-full">
                    {localUserData.educations.map((education, index) => (
                      <SortableAccordionItem
                        key={index}
                        id={`education-${index}`}
                        triggerContent={
                          <div className="text-left flex-1">
                            <div className="font-medium">
                              {education.degree || "Untitled Degree"}
                            </div>
                            {education.schoolName && (
                              <div className="text-sm text-gray-500">{education.schoolName}</div>
                            )}
                          </div>
                        }
                      >
                        <div className="space-y-2">
                          <Input
                            value={education.schoolName}
                            onChange={(e) =>
                              handleEducationChange(index, "schoolName", e.target.value)
                            }
                            placeholder="School Name"
                            className="mb-2"
                          />
                          <Input
                            value={education.degree}
                            onChange={(e) =>
                              handleEducationChange(index, "degree", e.target.value)
                            }
                            placeholder="Degree"
                            className="mb-2"
                          />
                          <Input
                            value={education.fieldOfStudy}
                            onChange={(e) =>
                              handleEducationChange(index, "fieldOfStudy", e.target.value)
                            }
                            placeholder="Field of Study"
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={education.startDate}
                              onChange={(e) =>
                                handleEducationChange(index, "startDate", e.target.value)
                              }
                              placeholder="Start Date"
                            />
                            <Input
                              value={education.endDate}
                              onChange={(e) =>
                                handleEducationChange(index, "endDate", e.target.value)
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
                      </SortableAccordionItem>
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            )}
          </div>
        );

      case "skills":
        return (
          <div className="space-y-4 px-1">
            <div className="space-y-2">
              {localUserData.skills.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No data. Click &quot;Add Skill&quot; to add your first skill.
                </div>
              ) : (
                localUserData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={skill.name}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      placeholder="Skill"
                      className="flex-grow"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSkill(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-4 px-1">
            <div className="space-y-4">
              {(!localUserData.projects || localUserData.projects.length === 0) ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No data. Click &quot;Add Project&quot; to add your first project.
                </div>
              ) : (
                localUserData.projects.map((project, index) => (
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
                ))
              )}
            </div>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-4 px-1">
            {(!localUserData.certifications || localUserData.certifications.length === 0) ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No data. Click &quot;Add Certification&quot; to add your first certification.
              </div>
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEndCertifications}>
                <SortableContext
                  items={(localUserData.certifications || []).map((_, i) => `cert-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <Accordion type="multiple" defaultValue={[]} className="w-full">
                    {localUserData.certifications.map((cert, index) => (
                      <SortableAccordionItem
                        key={index}
                        id={`cert-${index}`}
                        triggerContent={
                          <div className="text-left flex-1">
                            <div className="font-medium">
                              {cert.title || "Untitled Certification"}
                            </div>
                            {cert.organization && (
                              <div className="text-sm text-gray-500">{cert.organization}</div>
                            )}
                          </div>
                        }
                      >
                        <div className="space-y-2">
                          <Input
                            value={cert.title}
                            onChange={(e) =>
                              handleCertificationChange(index, "title", e.target.value)
                            }
                            placeholder="Certification Title"
                            className="mb-2"
                          />
                          <Input
                            value={cert.organization}
                            onChange={(e) =>
                              handleCertificationChange(index, "organization", e.target.value)
                            }
                            placeholder="Issuing Organization"
                            className="mb-2"
                          />
                          <Input
                            value={cert.completionDate}
                            onChange={(e) =>
                              handleCertificationChange(index, "completionDate", e.target.value)
                            }
                            placeholder="Completion Date (e.g., Jan 2021)"
                            className="mb-2"
                          />
                          <Input
                            value={cert.credentialUrl}
                            onChange={(e) =>
                              handleCertificationChange(index, "credentialUrl", e.target.value)
                            }
                            placeholder="Credential URL (optional)"
                            className="mb-2"
                          />
                          <div>
                            <Label>Description (optional)</Label>
                            <RichTextEditor
                              content={cert.description || ''}
                              onChange={(content) =>
                                handleCertificationChange(index, "description", content)
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
                      </SortableAccordionItem>
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            )}
          </div>
        );

      default:
        // Custom sections
        const customSection = localUserData.customSections?.find((s) => s.id === sectionId);
        if (customSection) {
          return (
            <div className="space-y-4 px-1">
              <div>
                <Label>Section Title</Label>
                <Input
                  value={customSection.title}
                  onChange={(e) =>
                    handleCustomSectionChange(sectionId, "title", e.target.value)
                  }
                  className="mt-1 mb-4"
                />
              </div>
              <RichTextEditor
                content={customSection.content}
                onChange={(content) =>
                  handleCustomSectionChange(sectionId, "content", content)
                }
              />
            </div>
          );
        }
        return null;
    }
  };

  const renderAddButton = () => {
    switch (sectionId) {
      case "experience":
        return (
          <Button
            onClick={() =>
              setLocalUserData({
                ...localUserData,
                positions: [
                  ...localUserData.positions,
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
            className="px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Position
          </Button>
        );
      case "education":
        return (
          <Button
            onClick={() =>
              setLocalUserData({
                ...localUserData,
                educations: [
                  ...localUserData.educations,
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
            className="px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        );
      case "skills":
        return (
          <Button
            onClick={() =>
              setLocalUserData({
                ...localUserData,
                skills: [...localUserData.skills, { name: "" }],
              })
            }
            className="px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        );
      case "projects":
        return (
          <Button
            onClick={() =>
              setLocalUserData({
                ...localUserData,
                projects: [
                  ...(localUserData.projects || []),
                  { title: "", link: "", description: "" },
                ],
              })
            }
            className="px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        );
      case "certifications":
        return (
          <Button
            onClick={() =>
              setLocalUserData({
                ...localUserData,
                certifications: [
                  ...(localUserData.certifications || []),
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
            className="px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Prevent closing during save
      if (!isSaving && !isOpen) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{sectionLabel}</DialogTitle>
        </DialogHeader>
        <div className="py-4 px-1 flex-1 overflow-y-auto">{renderSectionContent()}</div>
        <DialogFooter className="flex justify-between items-center w-full">
          <div className="flex-1">{renderAddButton()}</div>
          <div className="flex gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

