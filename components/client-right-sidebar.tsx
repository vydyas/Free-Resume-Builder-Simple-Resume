"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { ResumeConfig } from "@/lib/resume-config";
import { RightSidebarPlaceholder } from './right-sidebar-placeholder';
import { UserData } from '@/types/resume';

const RightSidebar = dynamic(
  () => import('./right-sidebar').then((mod) => mod.RightSidebar),
  {
    ssr: false,
    loading: () => <RightSidebarPlaceholder />
  }
);

interface ClientRightSidebarProps {
  config: ResumeConfig;
  onConfigChange: (key: keyof ResumeConfig, value: boolean) => void;
  userData: UserData;
  onUserDataChange: (data: Partial<ClientRightSidebarProps['userData']>) => void;
  onLinkedInImport?: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isMobile?: boolean;
}

export function ClientRightSidebar(props: ClientRightSidebarProps) {
  return (
    <div className="h-full">
      <Suspense fallback={<RightSidebarPlaceholder />}>
        <RightSidebar {...props} />
      </Suspense>
    </div>
  );
} 