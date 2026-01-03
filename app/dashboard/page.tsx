"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SharedHeader } from "@/components/shared-header";
import { Plus, FileText, Trash2, Edit, Grid3x3, List, ArrowUpDown, MoreVertical, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { CreateResumeNameModal } from "@/components/create-resume-name-modal";
import { EditResumeNameModal } from "@/components/edit-resume-name-modal";

interface Resume {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboardViewMode");
      return (saved === "list" || saved === "grid") ? saved : "grid";
    }
    return "grid";
  });
  type SortByType = "newest" | "oldest" | "updated-newest" | "updated-oldest" | "name-asc" | "name-desc";
  const [sortBy, setSortBy] = useState<SortByType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboardSortBy");
      const validSorts: SortByType[] = ["newest", "oldest", "updated-newest", "updated-oldest", "name-asc", "name-desc"];
      return (saved && validSorts.includes(saved as SortByType))
        ? (saved as SortByType)
        : "newest";
    }
    return "newest";
  });

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    loadResumes();
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardViewMode", viewMode);
    }
  }, [viewMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboardSortBy", sortBy);
    }
  }, [sortBy]);

  // Sort resumes based on selected sort option
  const sortedResumes = useMemo(() => {
    const sorted = [...resumes];
    
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return sorted.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "updated-newest":
        return sorted.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      case "updated-oldest":
        return sorted.sort((a, b) => 
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  }, [resumes, sortBy]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/resumes", {
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Failed to load resumes");
        return;
      }

      const data = await response.json();
      setResumes(data.resumes || []);
    } catch (error) {
      console.error("Error loading resumes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async (name: string) => {
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (!response.ok) {
        console.error("Failed to create resume");
        throw new Error("Failed to create resume");
      }

      const data = await response.json();
      const newResume = data.resume;

      // Navigate to the resume builder with the new resume ID
      router.push(`/resume-builder/${newResume.id}`);
    } catch (error) {
      console.error("Error creating resume:", error);
      throw error;
    }
  };

  const handleEditResumeName = async (name: string) => {
    if (!editingResume) return;

    try {
      const response = await fetch(`/api/resumes/${editingResume.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update resume name");
        throw new Error("Failed to update resume name");
      }

      // Update local state
      setResumes(
        resumes.map((r) => (r.id === editingResume.id ? { ...r, name } : r))
      );
      setEditingResume(null);
    } catch (error) {
      console.error("Error updating resume name:", error);
      throw error;
    }
  };

  const handleDeleteResume = async (resumeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this resume?")) {
      return;
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.error("Failed to delete resume");
        return;
      }

      // Remove from local state
      setResumes(resumes.filter((r) => r.id !== resumeId));
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  };

  const handleEditClick = (resume: Resume, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingResume(resume);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col bg-white h-screen">
        <SharedHeader variant="builder" />
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-screen">
      <SharedHeader variant="builder" />
      
      <main className="flex-1 mt-16 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
              <p className="mt-2 text-gray-600">
                Create and manage your resumes
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push("/review-resume")}
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Review Resume
              </Button>
              {/* Sort Filter */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                <SelectTrigger className="w-[180px] h-9 border-gray-300 bg-white">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="updated-newest">Recently Updated</SelectItem>
                  <SelectItem value="updated-oldest">Least Recently Updated</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-white text-emerald-600 shadow-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      : "text-gray-600 hover:text-emerald-600 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-white text-emerald-600 shadow-sm drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                      : "text-gray-600 hover:text-emerald-600 hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Resume
              </Button>
            </div>
          </div>

          {/* Resumes Grid */}
          {resumes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No resumes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first resume
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Resume
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ gridAutoRows: '1fr' }}>
              {sortedResumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => router.push(`/resume-builder/${resume.id}`)}
                  className="group relative bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-emerald-500 hover:shadow-lg hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {resume.name}
                      </h3>
                      {(resume.first_name || resume.last_name) && (
                        <p className="text-sm text-gray-600 truncate">
                          {[resume.first_name, resume.last_name]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-900"
                            aria-label="Resume options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(resume, e);
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Name
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResume(resume.id, e);
                            }}
                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                    <span>Updated {formatDate(resume.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedResumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => router.push(`/resume-builder/${resume.id}`)}
                  className="group relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-emerald-500 hover:shadow-md hover:drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <FileText className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                            {resume.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {(resume.first_name || resume.last_name) && (
                              <span className="truncate">
                                {[resume.first_name, resume.last_name]
                                  .filter(Boolean)
                                  .join(" ")}
                              </span>
                            )}
                            <span className="text-gray-400">•</span>
                            <span>Updated {formatDate(resume.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-600 hover:text-gray-900"
                            aria-label="Resume options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(resume, e);
                            }}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                            Edit Name
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResume(resume.id, e);
                            }}
                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Resume Modal */}
      <CreateResumeNameModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreate={handleCreateResume}
      />

      {/* Edit Resume Name Modal */}
      {editingResume && (
        <EditResumeNameModal
          open={!!editingResume}
          onOpenChange={(open) => !open && setEditingResume(null)}
          currentName={editingResume.name}
          onSave={handleEditResumeName}
        />
      )}
    </div>
  );
}
