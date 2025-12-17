"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SharedHeader } from "@/components/shared-header";

const KEYWORDS = ["Builders", "Thinkers", "Developers", "Hackers", "Tinkerers"];

export default function LandingPage() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typingText, setTypingText] = useState("");
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  const resumeTemplates = [
    {
      title: "Modern Professional",
      image: "/resume1.png",
    },
    {
      title: "Minimalist Tech",
      image: "/resume2.png",
    },
    {
      title: "Executive Elite",
      image: "/resume3.png",
    },
  ];

  useEffect(() => {
    // Only auto-rotate if not dragging
    if (!isDragging) {
      autoRotateRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % resumeTemplates.length);
      }, 4000);
    } else {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    }
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [resumeTemplates.length, isDragging]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    setDragOffset(0);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    // Determine if we should change slides based on drag distance
    const threshold = 50; // Minimum pixels to trigger slide change
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Dragged right, go to previous slide
        setCurrentSlide(
          (prev) => (prev - 1 + resumeTemplates.length) % resumeTemplates.length
        );
      } else {
        // Dragged left, go to next slide
        setCurrentSlide((prev) => (prev + 1) % resumeTemplates.length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Touch handlers for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const offset = e.touches[0].clientX - dragStart;
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    // Determine if we should change slides based on drag distance
    const threshold = 50; // Minimum pixels to trigger slide change
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Dragged right, go to previous slide
        setCurrentSlide(
          (prev) => (prev - 1 + resumeTemplates.length) % resumeTemplates.length
        );
      } else {
        // Dragged left, go to next slide
        setCurrentSlide((prev) => (prev + 1) % resumeTemplates.length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Global mouse up handler to handle drag outside carousel
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (!isDragging) return;

      // Determine if we should change slides based on drag distance
      const threshold = 50; // Minimum pixels to trigger slide change
      if (Math.abs(dragOffset) > threshold) {
        if (dragOffset > 0) {
          // Dragged right, go to previous slide
          setCurrentSlide(
            (prev) =>
              (prev - 1 + resumeTemplates.length) % resumeTemplates.length
          );
        } else {
          // Dragged left, go to next slide
          setCurrentSlide((prev) => (prev + 1) % resumeTemplates.length);
        }
      }

      setIsDragging(false);
      setDragOffset(0);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const offset = e.clientX - dragStart;
        setDragOffset(offset);
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, dragStart, dragOffset, resumeTemplates.length]);

  // Typing effect for keywords
  useEffect(() => {
    const currentKeyword = KEYWORDS[currentKeywordIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing
      if (typingText.length < currentKeyword.length) {
        timeout = setTimeout(() => {
          setTypingText(currentKeyword.slice(0, typingText.length + 1));
        }, 100);
      } else {
        // Finished typing, wait then start deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      // Deleting
      if (typingText.length > 0) {
        timeout = setTimeout(() => {
          setTypingText(typingText.slice(0, -1));
        }, 50);
      } else {
        // Finished deleting, move to next keyword
        setIsDeleting(false);
        setCurrentKeywordIndex((prev) => (prev + 1) % KEYWORDS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [typingText, currentKeywordIndex, isDeleting]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 relative overflow-hidden">
      {/* Unified background gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-200/20 to-teal-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <SharedHeader variant="landing" />

      {/* Hero Section - Split Layout */}
      <main className="min-h-[calc(100vh-4rem)] flex items-center py-8 lg:py-0 relative z-10">
        <div className="w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-0 min-h-[calc(100vh-4rem)]">
            {/* Left Side - Tagline */}
            <div className="flex items-center justify-center px-4 sm:px-8 lg:px-16 order-2 lg:order-1 relative">
              <div className="max-w-xl space-y-6 lg:space-y-8 w-full relative z-10">
                <div className="space-y-4 lg:space-y-6">
                  <div className="inline-block">
                    <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 text-zinc-700 text-xs sm:text-sm font-medium shadow-sm">
                      Built for :{" "}
                      <span className="inline-block min-w-[140px] text-left">
                        <span className="text-emerald-600 font-semibold">
                          {typingText}
                        </span>
                      </span>
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                    <span className="block text-gray-900 mb-1 sm:mb-2">
                      Craft Your
                    </span>
                    <span className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                      Perfect Resume
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
                    Stand out from the crowd with professionally designed
                    resumes. Built for developers, designers, and tech
                    professionals.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 lg:pt-4">
                  <button
                    onClick={() => router.push("/resume-builder")}
                    className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-lg hover:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 flex items-center justify-center space-x-2 text-sm sm:text-base font-semibold w-full sm:w-auto overflow-hidden transform hover:scale-[1.02] active:scale-100"
                  >
                    <span className="relative z-10">Create Your Resume</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                  </button>

                  {/* <button
                    onClick={() => router.push('/resume-score')}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 rounded-lg border-2 border-gray-200 hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center text-sm sm:text-base font-semibold w-full sm:w-auto"
                  >
                    Get Your Resume Score
                  </button> */}
                </div>

                {/* Social Proof */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-emerald-500 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      4.9/5
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg
                      className="w-5 h-5 text-emerald-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      5K+ Resumes Printed
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 lg:pt-8 border-t border-emerald-100">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      10+
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Templates
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      5K+
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Users
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      ATS
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      Optimized
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Resume Carousel */}
            <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden order-1 lg:order-2 py-8 lg:py-0">
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgb(16 185 129 / 0.1) 1px, transparent 0)",
                    backgroundSize: "40px 40px",
                  }}
                ></div>
              </div>

              {/* 3D Resume Carousel */}
              <div
                ref={carouselRef}
                className="relative w-full max-w-[400px] sm:max-w-md md:max-w-lg lg:max-w-xl z-10 cursor-grab active:cursor-grabbing select-none"
                style={{ perspective: "1200px" }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative h-[500px] sm:h-[600px] md:h-[700px]">
                  {resumeTemplates.map((template, index) => {
                    // Calculate the relative position from current slide
                    let position = index - currentSlide;

                    // Handle circular wrapping
                    if (position > resumeTemplates.length / 2) {
                      position -= resumeTemplates.length;
                    } else if (position < -resumeTemplates.length / 2) {
                      position += resumeTemplates.length;
                    }

                    // Apply drag offset for smooth dragging
                    const dragOffsetX = isDragging ? dragOffset * 0.3 : 0;

                    // Calculate rotation angle (60 degrees per position)
                    const rotateY = position * 60;
                    // Calculate Z translation (depth)
                    const translateZ = -Math.abs(position) * 150;
                    // Calculate X translation (horizontal position) with drag offset
                    const translateX = position * 120 + dragOffsetX;
                    // Opacity based on position (center = 1, sides = 0.3 for better visibility of reduced opacity)
                    const opacity = position === 0 ? 1 : 0.3;
                    // Scale based on position (center = 1, sides = 0.85)
                    const scale = position === 0 ? 1 : 0.85;
                    // Z-index to ensure center is on top
                    const zIndex = position === 0 ? 10 : 5 - Math.abs(position);

                    return (
                      <div
                        key={index}
                        className="absolute inset-0 transition-all duration-700 ease-in-out"
                        style={{
                          transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                          opacity: opacity,
                          zIndex: zIndex,
                          transformStyle: "preserve-3d",
                          pointerEvents: position === 0 ? "auto" : "none",
                          transition: isDragging
                            ? "none"
                            : "all 0.7s ease-in-out",
                        }}
                      >
                        {/* Resume Image */}
                        <div
                          className="relative w-full h-full"
                          style={{ borderRadius: "5%" }}
                        >
                          <Image
                            src={template.image}
                            alt={template.title}
                            fill
                            className="object-contain"
                            style={{ borderRadius: "5%" }}
                            priority={index === 0}
                            sizes="(max-width: 640px) 400px, (max-width: 768px) 448px, (max-width: 1024px) 512px, 640px"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Carousel Indicators */}
                <div className="flex justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-10">
                  {resumeTemplates.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                        index === currentSlide
                          ? "w-8 sm:w-10 bg-gradient-to-r from-emerald-500 to-teal-500"
                          : "w-2 sm:w-2.5 bg-emerald-200 hover:bg-emerald-300"
                      }`}
                      aria-label={`View resume ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 sm:py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-zinc-500">
            <Link
              href="/blog"
              className="hover:text-black transition-colors"
            >
              Blog
            </Link>
            <span>|</span>
            <Link
              href="/changelog"
              className="hover:text-black transition-colors"
            >
              Changelog
            </Link>
            <span>|</span>
            <Link
              href="/settings"
              className="hover:text-black transition-colors"
            >
              Settings
            </Link>
            <span>|</span>
            <a
              href="https://www.linkedin.com/in/siddhucse/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              LinkedIn
            </a>
            <span>|</span>
            <a
              href="https://github.com/vydyas/Free-Resume-Builder-Simple-Resume"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              GitHub
            </a>
            <span>|</span>
            <span>Made with ❤️ in India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
