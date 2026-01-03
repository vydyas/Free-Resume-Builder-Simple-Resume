"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded) {
      // Redirect to dashboard where users can create or select a resume
      router.replace("/dashboard");
    }
  }, [isLoaded, router]);

  // Show loading state while redirecting
  return (
    <div className="flex flex-col bg-white h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
