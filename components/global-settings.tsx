"use client";

import React from 'react';
import { Label } from "@/components/ui/label";
import { useStyling } from "@/lib/styling-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HeadingStyle } from '@/types/resume';

interface UserData {
  skills?: Array<{
    name: string;
  }>;
}

interface GlobalSettingsProps {
  onClose?: () => void;
  userData?: UserData;
}

interface ThemeColor {
  name: string;
  nameColor: string;
  headingColor: string;
  borderColor: string;
  companyColor: string;
}

const themeColors: ThemeColor[] = [
  {
    name: 'Blue',
    nameColor: '#1a365d',    // Dark blue
    headingColor: '#2b4c7e', // Medium blue
    borderColor: '#4a90e2',  // Light blue
    companyColor: '#3b82f6', // Company blue
  },
  {
    name: 'Green',
    nameColor: '#1b4332',    // Dark green
    headingColor: '#2d6a4f', // Medium green
    borderColor: '#40916c',  // Light green
    companyColor: '#059669', // Company green
  },
  {
    name: 'Purple',
    nameColor: '#4a1d96',    // Dark purple
    headingColor: '#6d28d9', // Medium purple
    borderColor: '#8b5cf6',  // Light purple
    companyColor: '#7c3aed', // Company purple
  },
  {
    name: 'Gray',
    nameColor: '#1f2937',    // Dark gray
    headingColor: '#4b5563', // Medium gray
    borderColor: '#9ca3af',  // Light gray
    companyColor: '#6b7280', // Company gray
  },
];

const ColorPicker = ({ label, value, onChange }: { 
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex items-center justify-between">
    <Label>{label}</Label>
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-10 cursor-pointer rounded !p-0 border border-gray-200"
    />
  </div>
);

export function GlobalSettings({ userData }: GlobalSettingsProps) {
  const { 
    headingColor, 
    updateHeadingColor,
    nameColor,
    updateNameColor,
    borderColor,
    setBorderColor,
    skillsStyle,
    setSkillsStyle,
    headingStyle,
    setHeadingStyle,
    resumeBackgroundColor,
    setResumeBackgroundColor,
    companyColor,
    updateCompanyColor,
  } = useStyling();

  // Check if there are skills in the resume
  const hasSkills = userData?.skills && userData.skills.length > 0;

  const applyThemeColors = (theme: ThemeColor) => {
    // Apply all colors in sequence to ensure they're all updated
    updateNameColor(theme.nameColor);
    updateHeadingColor(theme.headingColor);
    setBorderColor(theme.borderColor);
    updateCompanyColor(theme.companyColor);
  };

  return (
    <div className="w-full space-y-4">
      {/* Theme Colors */}
      <div className="space-y-2">
        <Label>Theme Colors</Label>
        <div className="flex gap-2">
              {themeColors.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyThemeColors(theme)}
                  className="flex flex-col items-center p-2 rounded hover:bg-gray-100"
                  title={theme.name}
                >
                  <div className="flex flex-col gap-1">
                    <div style={{ backgroundColor: theme.nameColor }} className="w-6 h-2 rounded-sm" />
                    <div style={{ backgroundColor: theme.headingColor }} className="w-6 h-2 rounded-sm" />
                    <div style={{ backgroundColor: theme.borderColor }} className="w-6 h-2 rounded-sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>

      {/* Colors */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Colors</Label>
        <div className="space-y-3">
              <ColorPicker
                label="Name Color"
                value={nameColor}
                onChange={updateNameColor}
              />
              <ColorPicker
                label="Heading Color"
                value={headingColor}
                onChange={updateHeadingColor}
              />
              <ColorPicker
                label="Border Color"
                value={borderColor}
                onChange={setBorderColor}
              />
              <ColorPicker
                label="Company Color"
                value={companyColor}
                onChange={updateCompanyColor}
              />
              <ColorPicker
                label="Background"
                value={resumeBackgroundColor}
                onChange={(value) => {
                  setResumeBackgroundColor(value);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('resumeBackgroundColor', value);
                  }
                }}
              />
            </div>
          </div>

      {/* Styles */}
      <div className="space-y-4">
        {/* Skills Style - Only show when there are skills */}
        {hasSkills && (
          <div className="space-y-2">
            <Label>Skills Style</Label>
            <RadioGroup
              value={skillsStyle}
              onValueChange={(value) => setSkillsStyle(value as 'chips' | 'list')}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="chips" id="chips" />
                <Label htmlFor="chips">Chips</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="list" id="list" />
                <Label htmlFor="list">List</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          <Label>Heading Style</Label>
          <RadioGroup
            value={headingStyle}
            onValueChange={(value) => setHeadingStyle(value as HeadingStyle)}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="background" id="background" />
              <Label htmlFor="background">Background</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="border-bottom" id="border-bottom" />
              <Label htmlFor="border-bottom">Bottom Border</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="border-top" id="border-top" />
              <Label htmlFor="border-top">Top Border</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
