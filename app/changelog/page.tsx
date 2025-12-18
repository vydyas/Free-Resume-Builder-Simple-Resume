import Link from "next/link";
import { ArrowLeft, Sparkles, Bug, Zap, Palette } from "lucide-react";

const changelogData = [
  {
    version: "1.5.0",
    date: "January 2025",
    title: "Mobile Experience & User Profiles",
    changes: [
      {
        type: "feature",
        title: "Mobile-First Resume Builder",
        description: "Completely redesigned resume builder for mobile and tablet devices with scrollable section tabs and dynamic preview zoom.",
      },
      {
        type: "feature",
        title: "User Profile Management",
        description: "Added first name and last name fields with profile completion prompts for personalized experience.",
      },
      {
        type: "feature",
        title: "Email Preferences",
        description: "Users can now manage email subscriptions and opt-out of communications directly from settings.",
      },
      {
        type: "improvement",
        title: "Responsive Admin Panel",
        description: "Admin dashboard, users, and emails pages are now fully responsive with mobile-friendly card layouts.",
      },
      {
        type: "improvement",
        title: "Settings Page Redesign",
        description: "Beautiful two-column layout with sidebar navigation and mobile-responsive tabs.",
      },
    ],
  },
  {
    version: "1.4.0",
    date: "December 2024",
    title: "Admin Panel & Email System",
    changes: [
      {
        type: "feature",
        title: "Admin Dashboard",
        description: "Comprehensive admin panel to manage users, view statistics, and send bulk emails.",
      },
      {
        type: "feature",
        title: "Email Templates",
        description: "Pre-built email templates for updates, job offers, blog posts, and weekly summaries.",
      },
      {
        type: "feature",
        title: "WYSIWYG Email Editor",
        description: "Rich text editor with formatting options for composing custom emails.",
      },
      {
        type: "improvement",
        title: "API Caching",
        description: "Implemented caching for admin APIs to improve performance and reduce database calls.",
      },
    ],
  },
  {
    version: "1.3.0",
    date: "November 2024",
    title: "Blog & Custom Sections",
    changes: [
      {
        type: "feature",
        title: "JAMStack Blog",
        description: "SEO-optimized blog with markdown support for sharing career tips and updates.",
      },
      {
        type: "feature",
        title: "Blog Editor",
        description: "Internal markdown editor with live preview for creating blog posts.",
      },
      {
        type: "feature",
        title: "Custom Resume Sections",
        description: "Add unlimited custom sections to your resume with flexible content options.",
      },
      {
        type: "fix",
        title: "Print Functionality",
        description: "Fixed resume printing on various browsers and devices.",
      },
    ],
  },
  {
    version: "1.2.0",
    date: "October 2024",
    title: "Templates & Themes",
    changes: [
      {
        type: "feature",
        title: "Multiple Resume Templates",
        description: "Choose from various professional templates including modern, classic, and minimal designs.",
      },
      {
        type: "feature",
        title: "Custom Styling Options",
        description: "Personalize fonts, colors, and spacing to match your style.",
      },
      {
        type: "improvement",
        title: "Real-time Preview",
        description: "See changes instantly as you edit your resume content.",
      },
    ],
  },
  {
    version: "1.1.0",
    date: "September 2024",
    title: "User Authentication",
    changes: [
      {
        type: "feature",
        title: "User Accounts",
        description: "Create an account to save and access your resumes across devices.",
      },
      {
        type: "feature",
        title: "Welcome Emails",
        description: "New users receive a personalized welcome email with getting started tips.",
      },
      {
        type: "improvement",
        title: "Local Storage Sync",
        description: "Resume data automatically saves locally for quick access.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "August 2024",
    title: "Initial Release",
    changes: [
      {
        type: "feature",
        title: "Free Resume Builder",
        description: "Create professional, ATS-friendly resumes completely free.",
      },
      {
        type: "feature",
        title: "PDF Export",
        description: "Download your resume as a high-quality PDF document.",
      },
      {
        type: "feature",
        title: "Core Sections",
        description: "Personal info, summary, experience, education, skills, projects, and certifications.",
      },
    ],
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "feature":
      return <Sparkles className="w-4 h-4" />;
    case "improvement":
      return <Zap className="w-4 h-4" />;
    case "fix":
      return <Bug className="w-4 h-4" />;
    default:
      return <Palette className="w-4 h-4" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "feature":
      return "bg-emerald-100 text-emerald-700";
    case "improvement":
      return "bg-blue-100 text-blue-700";
    case "fix":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const metadata = {
  title: "Changelog | SimpleResu.me",
  description: "See what's new in SimpleResu.me - the free online resume builder. Latest updates, features, and improvements.",
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Changelog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            All the latest updates, improvements, and fixes to SimpleResu.me.
            We&apos;re constantly working to make your resume building experience better.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-200" />

          {/* Entries */}
          <div className="space-y-12">
            {changelogData.map((release, index) => (
              <div key={release.version} className="relative pl-8 sm:pl-20">
                {/* Timeline dot */}
                <div className="absolute left-0 sm:left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />

                {/* Version badge */}
                <div className="absolute left-6 sm:left-14 top-0 hidden sm:block">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    v{release.version}
                  </span>
                </div>

                {/* Content card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Card header */}
                  <div className="px-6 py-5 border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="sm:hidden inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        v{release.version}
                      </span>
                      <span className="text-sm text-gray-500">{release.date}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {release.title}
                    </h2>
                  </div>

                  {/* Changes list */}
                  <div className="px-6 py-5">
                    <ul className="space-y-4">
                      {release.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getTypeBadge(change.type)}`}>
                            {getTypeIcon(change.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {change.title}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getTypeBadge(change.type)}`}>
                                {change.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {change.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Connector for visual continuity */}
                {index < changelogData.length - 1 && (
                  <div className="absolute left-0 sm:left-8 -translate-x-1/2 top-4 h-full w-px bg-gradient-to-b from-emerald-300 to-transparent opacity-50" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Have a feature request?
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">
              We&apos;d love to hear your ideas! Reach out to us on GitHub or LinkedIn.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/vydyas/Free-Resume-Builder-Simple-Resume/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                Open an Issue
              </a>
              <Link
                href="/"
                className="px-5 py-2.5 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Try Resume Builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

