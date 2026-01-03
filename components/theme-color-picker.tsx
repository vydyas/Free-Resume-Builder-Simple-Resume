"use client";

import React from "react";
import { Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeColor } from "@/lib/theme-color-context";

// Helper to convert hex to RGB
const hexToRgb = (hex: string): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
};

const PRESET_COLORS = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

export function ThemeColorPicker() {
  const { themeColor, setThemeColor, isMounted } = useThemeColor();
  
  // Use default during SSR
  const displayColor = isMounted ? themeColor : "#10b981";
  const displayRgb = isMounted ? hexToRgb(themeColor) : "16,185,129";

  const handlePresetColorClick = (color: string) => {
    setThemeColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setThemeColor(newColor);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
          style={isMounted ? {
            filter: `drop-shadow(0 0 8px rgba(${displayRgb}, 0.25))`,
          } : {}}
          aria-label="Theme color picker"
        >
          <Palette className="w-5 h-5" style={{ color: displayColor }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Preset Colors</h3>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handlePresetColorClick(color.value)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    displayColor === color.value
                      ? "border-gray-900 scale-110"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Custom Color</h3>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={displayColor}
                onChange={handleCustomColorChange}
                className="w-12 h-12 cursor-pointer rounded-lg border-2 border-gray-300"
              />
              <input
                type="text"
                value={displayColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    setThemeColor(value);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="#10b981"
              />
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

