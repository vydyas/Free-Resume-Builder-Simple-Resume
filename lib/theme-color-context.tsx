"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeColorContextType {
  themeColor: string;
  setThemeColor: (color: string) => void;
  getThemeColorRgb: () => string; // Returns RGB values for use in rgba()
  isMounted: boolean; // Indicates if component has mounted (to prevent hydration errors)
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function ThemeColorProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [themeColor, setThemeColorState] = useState<string>("#10b981"); // Default emerald-500

  // Load from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const savedColor = localStorage.getItem("appThemeColor");
    if (savedColor) {
      setThemeColorState(savedColor);
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      localStorage.setItem("appThemeColor", themeColor);
    }
  }, [themeColor, isMounted]);

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
  };

  // Convert hex to RGB for use in rgba() functions
  const getThemeColorRgb = (): string => {
    const hex = themeColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r},${g},${b}`;
  };

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor, getThemeColorRgb, isMounted }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
}

