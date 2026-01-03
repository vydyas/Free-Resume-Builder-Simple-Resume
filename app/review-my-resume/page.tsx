"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SharedHeader } from "@/components/shared-header";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, MessageSquare, Share2, Users, ArrowRight } from "lucide-react";

export default function ReviewMyResumePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect=/review-resume");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    // Redirect to the authenticated review-resume page
    router.push("/review-resume");
  }, [isSignedIn, router]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in?redirect=/review-resume");
      return;
    }

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    }
  }, [isLoaded, isSignedIn, handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleGetStarted = () => {
    if (!isLoaded) return;
    
    if (isSignedIn) {
      router.push("/review-resume");
    } else {
      router.push("/sign-in?redirect=/review-resume");
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Review My Resume - SimpleResu.me",
    "description": "Upload your resume and get actionable feedback from reviewers. Share secure links and receive collaborative comments to improve your resume.",
    "url": "https://simpleresu.me/review-my-resume",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Upload PDF resumes",
      "Share secure review links",
      "Receive collaborative feedback",
      "Rich text comments",
      "Threaded discussions"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-col bg-white min-h-screen">
        <SharedHeader variant="landing" />

        {/* Hero Section */}
        <section className="mt-16 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-gradient-to-br from-emerald-50/30 via-cyan-50/20 to-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Share Your Resume & Get
                <span className="block bg-gradient-to-r from-emerald-500/80 via-emerald-400/70 to-cyan-500/80 bg-clip-text text-transparent">
                  Actionable Feedback
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Upload your resume and share a secure link with reviewers. Get detailed, 
                collaborative feedback with threaded comments to improve your resume.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/30 text-lg px-8 py-6"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => {
                    const element = document.getElementById("how-it-works");
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                ${isDragging 
                  ? "border-emerald-500 bg-emerald-50 scale-105" 
                  : "border-gray-300 hover:border-emerald-400 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  isDragging ? "bg-emerald-100" : "bg-gray-100"
                }`}>
                  <Upload className={`w-10 h-10 ${isDragging ? "text-emerald-600" : "text-gray-400"}`} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {isDragging ? "Drop your PDF here" : "Upload Your Resume"}
                </h3>
                <p className="text-gray-600 mb-6">
                  Drag and drop your PDF resume, or click to browse
                </p>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Choose PDF File
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Maximum file size: 10MB • PDF format only
                </p>
                {!isSignedIn && (
                  <p className="text-sm text-emerald-600 mt-2">
                    You&apos;ll be asked to sign in to upload your resume
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get professional feedback on your resume in three simple steps
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <Upload className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  1. Upload Your Resume
                </h3>
                <p className="text-gray-600">
                  Upload your PDF resume. We support any PDF format, whether created on our platform or elsewhere.
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mb-6">
                  <Share2 className="w-7 h-7 text-cyan-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2. Share Secure Link
                </h3>
                <p className="text-gray-600">
                  Get a unique, shareable link. Send it to recruiters, mentors, or colleagues for feedback.
                </p>
              </div>
              <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  3. Get Feedback
                </h3>
                <p className="text-gray-600">
                  Reviewers add comments with rich text formatting. Track all feedback in one place.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Why Use Resume Review?
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">No Platform Lock-in</h3>
                  <p className="text-gray-600 text-sm">
                    Upload any PDF resume, regardless of where it was created.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Collaborative Feedback</h3>
                  <p className="text-gray-600 text-sm">
                    Multiple reviewers can comment and provide structured feedback.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Rich Text Comments</h3>
                  <p className="text-gray-600 text-sm">
                    Reviewers can format comments with bold, italic, lists, and more.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Sharing</h3>
                  <p className="text-gray-600 text-sm">
                    Unique, secure links that you control. Share only with trusted reviewers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Threaded Comments</h3>
                  <p className="text-gray-600 text-sm">
                    Organize feedback with reply threads for better discussion flow.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Management</h3>
                  <p className="text-gray-600 text-sm">
                    View all your resume reviews in one dashboard. Edit or delete anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-emerald-500 to-cyan-500">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Get Feedback on Your Resume?
            </h2>
            <p className="text-xl text-emerald-50 mb-8">
              Start receiving professional feedback today. It&apos;s free and takes less than a minute.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

