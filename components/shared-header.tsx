'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, Bug, LayoutDashboard, FileText } from 'lucide-react';
import { CreateResumeModal } from './create-resume-modal';
import { UserMenu } from './user-menu';
import { FeedbackModal } from './feedback-modal';
import { ReportBugModal } from './report-bug-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SharedHeaderProps {
  variant?: 'landing' | 'builder';
}

export function SharedHeader({}: SharedHeaderProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 print:hidden bg-transparent">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-90 transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]"
            >
              <span className={`text-2xl sm:text-3xl font-normal`} style={{ fontFamily: 'var(--font-great-vibes), cursive' }}>
                <span className="text-black">SimpleResu</span>
                <span className="text-emerald-500">.me</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              {isLoaded && !isSignedIn && (
                <Link
                  href="/review-my-resume"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50/50 hover:font-semibold transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                >
                  <FileText className="w-4 h-4" />
                  Review My Resume
                </Link>
              )}
              {isLoaded && isSignedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50/50 hover:font-semibold transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/review-resume"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50/50 hover:font-semibold transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                  >
                    <FileText className="w-4 h-4" />
                    Review Resume
                  </Link>
                </>
              )}
              
              {/* Auth / user menu */}
              <div className="flex items-center space-x-2 sm:space-x-3">
              {isLoaded && (
                <>
                  {!isSignedIn ? (
                    <button
                      onClick={handleSignIn}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full hover:shadow-lg hover:shadow-emerald-500/30 hover:drop-shadow-[0_0_6px_rgba(16,185,129,0.5)] transition-all duration-300 font-semibold transform hover:scale-105"
                    >
                      Sign In
                    </button>
                  ) : (
                    <>
                      {/* Primary actions - only show when signed in */}
                      <div className="hidden sm:flex items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex items-center justify-center w-9 h-9 rounded-lg hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(16,185,129,0.4)] text-zinc-600"
                              aria-label="Feedback and bug report menu"
                            >
                              <Bug className="w-5 h-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setShowBugModal(true)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Bug className="w-4 h-4" />
                              <span>Report a bug</span>
                            </DropdownMenuItem>
                            <div className="h-px bg-gray-200 my-1" />
                            <DropdownMenuItem
                              onClick={() => setShowFeedbackModal(true)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Feedback</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <UserMenu />
                    </>
                  )}
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <CreateResumeModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <FeedbackModal open={showFeedbackModal} onOpenChange={setShowFeedbackModal} />
      <ReportBugModal open={showBugModal} onOpenChange={setShowBugModal} />
    </>
  );
}
