import { StylingContextType } from "./styling-context";

/**
 * Color scheme definitions that map to theme colors
 */
export interface ColorSchemeTheme {
  nameColor: string;
  headingColor: string;
  borderColor: string;
  companyColor: string;
}

export const COLOR_SCHEME_THEMES: Record<string, ColorSchemeTheme> = {
  emerald: {
    nameColor: "#1b4332",      // Dark green (emerald-900)
    headingColor: "#2d6a4f",   // Medium green (emerald-700)
    borderColor: "#40916c",    // Light green (emerald-600)
    companyColor: "#059669",   // Company green (emerald-600)
  },
  blue: {
    nameColor: "#1a365d",      // Dark blue
    headingColor: "#2b4c7e",   // Medium blue
    borderColor: "#4a90e2",     // Light blue
    companyColor: "#3b82f6",    // Company blue
  },
  slate: {
    nameColor: "#1f2937",      // Dark gray (slate-800)
    headingColor: "#4b5563",  // Medium gray (slate-600)
    borderColor: "#9ca3af",    // Light gray (slate-400)
    companyColor: "#6b7280",  // Company gray (slate-500)
  },
};

/**
 * Applies theme colors based on a color scheme
 */
export function applyColorScheme(
  colorScheme: string,
  styling: Pick<StylingContextType, "updateNameColor" | "updateHeadingColor" | "setBorderColor" | "updateCompanyColor">
) {
  const theme = COLOR_SCHEME_THEMES[colorScheme];
  if (!theme) {
    console.warn(`Unknown color scheme: ${colorScheme}`);
    return;
  }

  styling.updateNameColor(theme.nameColor);
  styling.updateHeadingColor(theme.headingColor);
  styling.setBorderColor(theme.borderColor);
  styling.updateCompanyColor(theme.companyColor);
}



