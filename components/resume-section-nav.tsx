'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Star, 
  Code, 
  Award, 
  Trophy
} from 'lucide-react';
import { ResumeConfig, UserData } from '@/types/resume';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ResumeSectionNavProps {
  config: ResumeConfig;
  userData: UserData;
}

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
  visible: boolean;
}

export function ResumeSectionNav({ config, userData }: ResumeSectionNavProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: 'header',
      label: 'Personal Information',
      icon: <User className="w-5 h-5" />,
      visible: true,
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: <FileText className="w-5 h-5" />,
      visible: config.showSummary && !!userData.summary,
    },
    {
      id: 'positions',
      label: 'Experience',
      icon: <Briefcase className="w-5 h-5" />,
      visible: config.showExperience && (userData.positions?.length || 0) > 0,
    },
    {
      id: 'education',
      label: 'Education',
      icon: <GraduationCap className="w-5 h-5" />,
      visible: config.showEducation && (userData.educations?.length || 0) > 0,
    },
    {
      id: 'skills',
      label: 'Skills',
      icon: <Star className="w-5 h-5" />,
      visible: config.showSkills && (userData.skills?.length || 0) > 0,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <Code className="w-5 h-5" />,
      visible: config.showProjects && (userData.projects?.length || 0) > 0,
    },
    {
      id: 'certifications',
      label: 'Certifications',
      icon: <Award className="w-5 h-5" />,
      visible: config.showCertifications && (userData.certifications?.length || 0) > 0,
    },
  ];

  // Add custom sections
  userData.customSections?.forEach((section) => {
    if (section.isVisible) {
      sections.push({
        id: section.id,
        label: section.title || 'Custom',
        icon: <Trophy className="w-5 h-5" />,
        visible: true,
      });
    }
  });

  const visibleSections = sections.filter(s => s.visible);

  const scrollToSection = (sectionId: string) => {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (!element) {
        console.warn(`Section element not found: section-${sectionId}`);
        return;
      }

      // Find the scrollable container - the resume content area
      const scrollableContainer = document.querySelector('.resume-content [class*="overflow"]') as HTMLElement ||
                                   document.querySelector('.resume-content')?.querySelector('[class*="overflow-y"]') as HTMLElement ||
                                   element.closest('[class*="overflow"]') as HTMLElement;
      
      if (scrollableContainer && scrollableContainer.scrollHeight > scrollableContainer.clientHeight) {
        // Container is scrollable
        const containerRect = scrollableContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollableContainer.scrollTop + elementRect.top - containerRect.top - 20;
        
        scrollableContainer.scrollTo({
          top: Math.max(0, scrollTop),
          behavior: 'smooth'
        });
      } else {
        // Fallback: use scrollIntoView on the element
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }
      setActiveSection(sectionId);
    }, 100);
  };

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollableContainer = document.querySelector('.resume-content [class*="overflow"]') as HTMLElement;
      
      if (!scrollableContainer) return;

      const containerTop = scrollableContainer.getBoundingClientRect().top;
      const scrollTop = scrollableContainer.scrollTop;

      // Find which section is currently in view
      for (const section of visibleSections) {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          const elementTop = element.getBoundingClientRect().top;
          const relativeTop = elementTop - containerTop + scrollTop;

          if (relativeTop <= scrollTop + 150 && relativeTop + element.offsetHeight > scrollTop - 50) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    const scrollableContainer = document.querySelector('.resume-content [class*="overflow"]') as HTMLElement;
    
    if (scrollableContainer) {
      scrollableContainer.addEventListener('scroll', handleScroll);
      // Also listen to window scroll as fallback
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      
      return () => {
        scrollableContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [visibleSections]);

  if (visibleSections.length === 0) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col items-center py-4 border-r border-gray-200 bg-white z-20 print:hidden">
        <div className="flex flex-col gap-2">
          {visibleSections.map((section) => (
            <Tooltip key={section.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-lg transition-all
                    ${activeSection === section.id
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                    }
                  `}
                  aria-label={section.label}
                >
                  {section.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-900 text-white text-sm">
                <p>{section.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}



