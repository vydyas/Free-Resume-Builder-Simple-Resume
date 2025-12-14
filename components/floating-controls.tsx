import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Minus from 'lucide-react/dist/esm/icons/minus';
import Plus from 'lucide-react/dist/esm/icons/plus';
import { GlobalSettings } from './global-settings';
import { RippleButton } from './ui/ripple-button';
import { fireConfetti } from '@/lib/confetti';
import { trackEvents } from '@/lib/analytics';
import Download from 'lucide-react/dist/esm/icons/download';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FloatingControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function FloatingControls({
  zoom,
  onZoomChange,
}: FloatingControlsProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dropdown position
  useEffect(() => {
    if (isSettingsOpen && settingsButtonRef.current && settingsDropdownRef.current) {
      const buttonRect = settingsButtonRef.current.getBoundingClientRect();
      const dropdownHeight = settingsDropdownRef.current.offsetHeight;
      setDropdownPosition(
        window.innerHeight - buttonRect.bottom < dropdownHeight ? 'top' : 'bottom'
      );
    }
  }, [isSettingsOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSettingsOpen &&
        !settingsButtonRef.current?.contains(event.target as Node) &&
        !settingsDropdownRef.current?.contains(event.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSettingsOpen]);

  const handleZoomIn = () => {
    if (zoom < 110) {
      onZoomChange(zoom + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      onZoomChange(zoom - 10);
    }
  };

  const handlePrint = async () => {
    // Check if user is signed in
    if (!isSignedIn) {
      setShowAuthDialog(true);
      return;
    }

    try {
      trackEvents.resumePrinted();
      
      // On mobile, ensure resume is visible for printing
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        // Check if we're in mobile preview mode
        const mobilePreviewModal = document.querySelector('.fixed.inset-0.z-50');
        if (!mobilePreviewModal) {
          // Dispatch custom event to open mobile preview
          const openPreviewEvent = new CustomEvent('openMobilePreview');
          window.dispatchEvent(openPreviewEvent);
          
          // Wait for preview to open
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.print();
      
      // Fire confetti after a short delay
      setTimeout(() => {
        fireConfetti();
      }, 500);
    } catch (error) {
      console.error('Print failed:', error);
    }
  };

  const handleSettingsClick = () => {
    trackEvents.settingsOpened();
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <>
      <nav className="floating-controls" aria-label="Resume controls">
        <div className={`
          bg-white dark:bg-gray-900
          backdrop-blur-xl
          ${isScrolled ? 'bg-white/70 dark:bg-gray-900/70' : ''}
          rounded-[24px]
          shadow-lg
          border border-[#7a3eea]
          px-2 sm:px-4 py-1
          flex items-center gap-2 sm:gap-4
          transition-all duration-300
        `}>
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 sm:gap-2" role="group" aria-label="Zoom controls">
            <Button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              size="icon"
              variant="outline"
              className="w-7 h-7 sm:w-8 sm:h-8"
              aria-label={`Zoom out (current zoom: ${zoom}%)`}
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>
            <span className="text-xs sm:text-sm text-gray-500 min-w-[40px] sm:min-w-[48px] text-center" aria-live="polite">
              {zoom}%
            </span>
            <Button
              onClick={handleZoomIn}
              disabled={zoom >= 110}
              size="icon"
              variant="outline"
              className="w-7 h-7 sm:w-8 sm:h-8"
              aria-label={`Zoom in (current zoom: ${zoom}%)`}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-5 sm:h-6" />

          {/* Print/Download Button */}
          <RippleButton
            variant="ghost"
            size="icon"
            onClick={handlePrint}
            className="relative overflow-hidden w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Download Resume (requires sign in)"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
          </RippleButton>

          <Separator orientation="vertical" className="h-5 sm:h-6" />

          {/* Settings Button */}
          <div className="relative">
            <Button
              ref={settingsButtonRef}
              variant="ghost"
              size="icon"
              onClick={handleSettingsClick}
              aria-label="Open Settings Menu"
              aria-expanded={isSettingsOpen}
              aria-haspopup="dialog"
              className="w-7 h-7 sm:w-8 sm:h-8"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>

            {isSettingsOpen && (
              <div
                ref={settingsDropdownRef}
                className={`absolute z-50 right-0 bg-white dark:bg-gray-900 rounded-lg shadow-xl border
                  ${dropdownPosition === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label="Settings Panel"
              >
                <GlobalSettings
                  onClose={() => setIsSettingsOpen(false)}
                  key={isSettingsOpen ? 'open' : 'closed'}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Authentication Required Dialog */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-black">
              Sign in to Download
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-600 text-base">
              Please sign in to download your resume. You can create and edit your resume without signing in, but downloading requires an account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAuthDialog(false)}
              className="border-zinc-300"
            >
              Continue Editing
            </Button>
            <Button
              onClick={() => {
                setShowAuthDialog(false);
                router.push('/sign-in');
              }}
              className="bg-black text-white hover:bg-zinc-800"
            >
              Sign In to Download
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
