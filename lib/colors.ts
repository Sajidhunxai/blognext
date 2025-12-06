import { getSettings } from "./settings";

export async function getThemeColors() {
  const settings = await getSettings();
  
  return {
    primary: settings.primaryColor || "#dc2626",
    secondary: settings.secondaryColor || "#16a34a",
    background: settings.backgroundColor || "#111827",
    text: settings.textColor || "#ffffff",
    button: settings.buttonColor || "#dc2626",
    link: settings.linkColor || "#3b82f6",
    success: settings.successColor || "#16a34a",
    error: settings.errorColor || "#dc2626",
    warning: settings.warningColor || "#f59e0b",
    info: settings.infoColor || "#3b82f6",
  };
}

export function getLighterColor(color: string, amount: number = 0.1): string {
  // Simple function to lighten a hex color
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0x0000FF) + Math.floor(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function getDarkerColor(color: string, amount: number = 0.1): string {
  // Simple function to darken a hex color
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.floor(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.floor(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.floor(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

