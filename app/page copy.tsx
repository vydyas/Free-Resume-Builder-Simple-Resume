"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SharedHeader } from "@/components/shared-header";

const FEATURES = [
  "Professional Templates",
  "ATS Optimized",
  "Export to PDF",
  "Real-time Preview",
  "Custom Sections",
  "Easy to Use",
];

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [bounceOffset, setBounceOffset] = useState(0);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Bounce animation
    let startTime: number;
    const animateBounce = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const bounce = Math.sin(elapsed / 500) * 8; // 8px bounce
      setBounceOffset(bounce);
      requestAnimationFrame(animateBounce);
    };

    const bounceFrame = requestAnimationFrame(animateBounce);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(bounceFrame);
    };
  }, []);

  return (
    <div className="bg-white">
      <SharedHeader variant="landing" />

      <main className="relative pt-16">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16 sm:py-20">
          <div
            className={`text-center transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight px-2 leading-tight">
              <span className="block text-gray-900">Be (part of)</span>
              <span className="block bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent leading-tight">
                something new
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-xl text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed">
              Build resumes that get you noticed and land interviews
            </p>

            <div className="mt-8 sm:mt-12">
              <button
                onClick={() => router.push("/resume-builder")}
                className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-base sm:text-lg font-semibold rounded-full hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <span>Start Building</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Resume Images */}
          <div className="mt-12 sm:mt-16 md:mt-20 w-full max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="relative h-[400px] sm:h-[450px] md:h-[600px] flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
              {/* Image 1 - Left - Hidden on mobile */}
              <div
                className={`hidden sm:block w-[220px] h-[300px] sm:w-[260px] sm:h-[350px] md:w-[350px] md:h-[470px] rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-1000 delay-700 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: isVisible
                    ? `perspective(1000px) rotateY(15deg) rotateX(-5deg) translateY(${
                        scrollY * -0.15 + bounceOffset
                      }px)`
                    : "perspective(1000px) rotateY(45deg) rotateX(-15deg)",
                }}
              >
                <Image
                  src="/resume1.png"
                  alt="Resume template 1"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Image 2 - Center - Always visible */}
              <div
                className={`w-[280px] h-[380px] sm:w-[280px] sm:h-[380px] md:w-[380px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl z-10 transition-opacity duration-1000 delay-900 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: isVisible
                    ? `perspective(1000px) rotateY(-5deg) rotateX(-3deg) translateY(${
                        scrollY * -0.2 + bounceOffset * 1.2
                      }px)`
                    : "perspective(1000px) rotateY(-25deg) rotateX(-10deg)",
                }}
              >
                <Image
                  src="/resume2.png"
                  alt="Resume template 2"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Image 3 - Right - Hidden on mobile */}
              <div
                className={`hidden sm:block w-[220px] h-[300px] sm:w-[260px] sm:h-[350px] md:w-[350px] md:h-[470px] rounded-2xl overflow-hidden shadow-2xl transition-opacity duration-1000 delay-1100 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: isVisible
                    ? `perspective(1000px) rotateY(-15deg) rotateX(-5deg) translateY(${
                        scrollY * -0.18 + bounceOffset * 0.8
                      }px)`
                    : "perspective(1000px) rotateY(-45deg) rotateX(-15deg)",
                }}
              >
                <Image
                  src="/resume3.png"
                  alt="Resume template 3"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Ticker Tape */}
        <section className="sticky top-16 bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-200 py-4 overflow-hidden z-40">
          <div className="flex animate-scroll whitespace-nowrap">
            {[...FEATURES, ...FEATURES, ...FEATURES, ...FEATURES].map(
              (feature, i) => (
                <div
                  key={i}
                  className="inline-flex items-center px-6 text-gray-700 font-medium"
                >
                  <span>{feature}</span>
                  <span className="mx-6 text-emerald-500">•</span>
                </div>
              )
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-center mb-20">
              <span className="text-gray-900">Everything you need</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                to land your dream job
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "✓",
                  title: "ATS-Optimized",
                  desc: "Pass applicant tracking systems",
                },
                {
                  icon: "📄",
                  title: "Professional Templates",
                  desc: "10+ expertly designed templates",
                },
                {
                  icon: "👁",
                  title: "Real-time Preview",
                  desc: "See changes instantly",
                },
                {
                  icon: "⬇",
                  title: "PDF Export",
                  desc: "Download print-ready PDFs",
                },
                {
                  icon: "⚙",
                  title: "Custom Sections",
                  desc: "Add and reorder any section",
                },
                {
                  icon: "📱",
                  title: "Mobile Friendly",
                  desc: "Build on any device",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {[
                { value: "5K+", label: "Resumes Created" },
                { value: "10+", label: "Templates" },
                { value: "4.9", label: "User Rating" },
                { value: "100%", label: "Free Forever" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-5xl md:text-6xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base opacity-90">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-gray-900">Ready to build your</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                perfect resume?
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Join thousands of job seekers who landed their dream roles
            </p>
            <button
              onClick={() => router.push("/resume-builder")}
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xl font-bold rounded-full hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 bg-white overflow-hidden">
        {/* Top Section with Links */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
            {/* Left Side - Brand and Description */}
            <div className="max-w-md">
              <h3
                className="text-3xl font-normal mb-3"
                style={{ fontFamily: "var(--font-great-vibes), cursive" }}
              >
                <span className="text-black">SimpleResu</span>
                <span className="text-emerald-500">.me</span>
              </h3>
              <p className="text-gray-600 mb-4">
                Build professional resumes that get you noticed and land
                interviews. Free forever.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.linkedin.com/in/siddhucse/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/vydyas/Free-Resume-Builder-Simple-Resume"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-emerald-500 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            {/* Right Side - Quick Links */}
            <div className="flex flex-wrap gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
                <div className="flex flex-col gap-2 text-gray-600">
                  <Link
                    href="/blog"
                    className="hover:text-emerald-500 transition-colors"
                  >
                    Blog
                  </Link>
                  <Link
                    href="/changelog"
                    className="hover:text-emerald-500 transition-colors"
                  >
                    Changelog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling Text Section */}
        <div className="relative pb-10 bg-gradient-to-b from-white to-gray-50 footer-scroll-container overflow-hidden">
          <div className="flex animate-scroll-footer whitespace-nowrap footer-scroll-content">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="inline-flex items-center">
                <span className="text-[140px] sm:text-[200px] md:text-[280px] lg:text-[320px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400/20 via-teal-500/20 to-cyan-600/20 hover:from-emerald-400 hover:via-teal-500 hover:to-cyan-600 transition-all duration-500 px-12 cursor-default select-none footer-text leading-none">
                  SimpleResu.me
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="relative border-t border-gray-200 py-6 bg-white z-10">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
            <p>
              © 2025 SimpleResu.me • Made with ❤️ in India • All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }

        @keyframes scroll-footer {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll-footer {
          animation: scroll-footer 15s linear infinite;
        }

        .footer-text {
          transition: all 0.5s ease;
        }

        .footer-text:hover {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.8),
            0 0 40px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.4),
            0 0 80px rgba(16, 185, 129, 0.3);
        }

        .footer-scroll-container:hover .footer-scroll-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
