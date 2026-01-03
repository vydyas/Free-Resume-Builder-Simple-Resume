'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

interface CreateResumeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateResumeModal({ open, onOpenChange }: CreateResumeModalProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleManualCreate = async () => {
    try {
      setIsCreating(true);
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My Resume",
        }),
      });

      if (!response.ok) {
        console.error("Failed to create resume");
        return;
      }

      const data = await response.json();
      const newResume = data.resume;

      // Navigate to the resume builder with the new resume ID
      router.push(`/resume-builder/${newResume.id}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating resume:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpload = async () => {
    // TODO: Implement resume upload functionality
    setIsUploading(true);
    // For now, create a new resume and navigate to builder
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My Resume",
        }),
      });

      if (!response.ok) {
        console.error("Failed to create resume");
        return;
      }

      const data = await response.json();
      const newResume = data.resume;

      // Navigate to the resume builder with the new resume ID
      router.push(`/resume-builder/${newResume.id}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating resume:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Create Your Resume
          </DialogTitle>
          <DialogDescription className="text-zinc-600 text-base">
            Choose how you&apos;d like to start building your professional resume
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Upload Resume Option */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="group relative w-full flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-zinc-200 hover:border-black hover:bg-zinc-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors duration-200 flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-xl text-black mb-2">
                Upload Your Resume
              </h3>
              <p className="text-sm text-zinc-600">
                Upload an existing resume and we&apos;ll help you format and enhance it
              </p>
            </div>
          </button>

          {/* OR Divider */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm font-medium text-zinc-500">
                OR
              </span>
            </div>
          </div>

          {/* Manual Create Option */}
          <button
            onClick={handleManualCreate}
            disabled={isCreating}
            className="group relative w-full flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-zinc-200 hover:border-black hover:bg-zinc-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors duration-200 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-xl text-black mb-2">
                {isCreating ? "Creating..." : "Create Manually"}
              </h3>
              <p className="text-sm text-zinc-600">
                {isCreating 
                  ? "Setting up your resume..." 
                  : "Start from scratch with our intuitive resume builder"}
              </p>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-300 mt-4"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
