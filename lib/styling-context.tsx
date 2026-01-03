"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

// Update Predefined font families
export const FONT_FAMILIES = {
  'Inter': 'font-sans',
  'Roboto': 'font-roboto',
  'Montserrat': 'font-montserrat',
  'Playfair Display': 'font-playfair',  // Serif
  'Space Mono': 'font-space-mono',      // Monospace
  'Fira Code': 'font-fira-code',        // Monospace
  'Merriweather': 'font-merriweather',  // Serif
  'Source Code Pro': 'font-source-code', // Monospace
  'Lora': 'font-lora',                  // Serif
};

// Update the type for heading styles
type HeadingStyle = 'background' | 'border-bottom' | 'border-top';

export interface StylingContextType {
  headingFont: keyof typeof FONT_FAMILIES;
  headingColor: string;
  nameFont: keyof typeof FONT_FAMILIES;
  nameColor: string;
  borderColor: string;
  setBorderColor: (color: string) => void;
  updateHeadingFont: (font: keyof typeof FONT_FAMILIES) => void;
  updateHeadingColor: (color: string) => void;
  updateNameFont: (font: keyof typeof FONT_FAMILIES) => void;
  updateNameColor: (color: string) => void;
  skillsStyle: 'chips' | 'list';
  setSkillsStyle: (style: 'chips' | 'list') => void;
  headingStyle: HeadingStyle;
  setHeadingStyle: (style: HeadingStyle) => void;
  resumeBackgroundColor: string;
  setResumeBackgroundColor: (color: string) => void;
  companyColor: string;
  updateCompanyColor: (color: string) => void;
}

const StylingContext = createContext<StylingContextType>({
  headingFont: 'Inter',
  headingColor: '#374151', // Default gray-700
  nameFont: 'Inter',
  nameColor: '#111827', // Default gray-900
  borderColor: '#666', // Changed from #7a3eea to #666
  setBorderColor: () => {},
  updateHeadingFont: () => {},
  updateHeadingColor: () => {},
  updateNameFont: () => {},
  updateNameColor: () => {},
  skillsStyle: 'list',
  setSkillsStyle: () => {},
  headingStyle: 'background',
  setHeadingStyle: () => {},
  resumeBackgroundColor: '#ffffff',
  setResumeBackgroundColor: () => {},
  companyColor: '#4b5563',
  updateCompanyColor: () => {},
});

export const StylingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headingFont, setHeadingFont] = useState<keyof typeof FONT_FAMILIES>('Inter');
  
  // Load headingColor from localStorage
  const [headingColor, setHeadingColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resumeHeadingColor') || '#374151';
    }
    return '#374151';
  });

  const [nameFont, setNameFont] = useState<keyof typeof FONT_FAMILIES>('Inter');
  
  // Load nameColor from localStorage
  const [nameColor, setNameColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resumeNameColor') || '#111827';
    }
    return '#111827';
  });

  // Load borderColor from localStorage (already implemented)
  const [borderColor, setBorderColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resumeBorderColor') || '#666';
    }
    return '#666';
  });

  const [skillsStyle, setSkillsStyle] = useState<'chips' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resumeSkillsStyle') as 'chips' | 'list' || 'list';
    }
    return 'list';
  });

  const [headingStyle, setHeadingStyle] = useState<HeadingStyle>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('resumeHeadingStyle') as HeadingStyle) || 'background';
    }
    return 'background';
  });

  const [resumeBackgroundColor, setResumeBackgroundColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resumeBackgroundColor') || '#ffffff';
    }
    return '#ffffff';
  });

  const [companyColor, setCompanyColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resumeCompanyColor') || '#4b5563'; // Default gray
    }
    return '#4b5563';
  });

  const updateHeadingFont = (font: keyof typeof FONT_FAMILIES) => setHeadingFont(font);
  const updateHeadingColor = (color: string) => {
    setHeadingColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeHeadingColor', color);
    }
  };

  const updateNameFont = (font: keyof typeof FONT_FAMILIES) => setNameFont(font);
  const updateNameColor = (color: string) => {
    setNameColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeNameColor', color);
    }
  };

  const updateCompanyColor = useCallback((color: string) => {
    setCompanyColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeCompanyColor', color);
    }
  }, []);

  // Save borderColor to localStorage (already implemented)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeBorderColor', borderColor);
    }
  }, [borderColor]);

  // Save skillsStyle to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeSkillsStyle', skillsStyle);
    }
  }, [skillsStyle]);

  // Save heading style to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeHeadingStyle', headingStyle);
    }
  }, [headingStyle]);

  // Save background color to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('resumeBackgroundColor', resumeBackgroundColor);
    }
  }, [resumeBackgroundColor]);

  return (
    <StylingContext.Provider value={{
      headingFont,
      headingColor,
      nameFont,
      nameColor,
      borderColor,
      setBorderColor,
      updateHeadingFont,
      updateHeadingColor,
      updateNameFont,
      updateNameColor,
      skillsStyle,
      setSkillsStyle,
      headingStyle,
      setHeadingStyle,
      resumeBackgroundColor,
      setResumeBackgroundColor,
      companyColor,
      updateCompanyColor,
    }}>
      {children}
    </StylingContext.Provider>
  );
};

export const useStyling = () => useContext(StylingContext);
