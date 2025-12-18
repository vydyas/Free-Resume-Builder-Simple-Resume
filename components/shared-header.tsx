'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateResumeModal } from './create-resume-modal';
import { UserMenu } from './user-menu';
import { FeedbackModal } from './feedback-modal';
import { ReportBugModal } from './report-bug-modal';

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
      <nav className="w-full bg-gradient-to-r from-white via-emerald-50/30 to-white border-b border-emerald-100/50 z-50 print:hidden">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <span className={`text-2xl sm:text-3xl font-normal`} style={{ fontFamily: 'var(--font-great-vibes), cursive' }}>
                <span className="text-black">SimpleResu</span>
                <span className="text-zinc-400">.me</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Primary actions */}
              <div className="hidden sm:flex items-center space-x-3 text-sm text-zinc-600">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(true)}
                  className="hover:text-black transition-colors"
                >
                  Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setShowBugModal(true)}
                  className="hover:text-black transition-colors"
                >
                  Report a bug
                </button>
              </div>

              {/* Auth / user menu */}
              <div className="flex items-center space-x-2 sm:space-x-3">
              {isLoaded && (
                <>
                  {!isSignedIn ? (
                    <button
                      onClick={handleSignIn}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-black text-white rounded-lg hover:bg-zinc-800 transition-all duration-200 font-medium"
                    >
                      Sign In
                    </button>
                  ) : (
                    <UserMenu />
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
