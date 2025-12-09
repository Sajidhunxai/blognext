import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  // Fetch settings on server - never exposed to client network tab
  const settingsData = await getSettings();
  
  // Fetch pages on server
  let pages: Array<{ id: string; title: string; slug: string }> = [];
  try {
    if (prisma && 'page' in prisma) {
      pages = await prisma.page.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
        },
        orderBy: {
          title: 'asc',
        },
      });
    }
  } catch (error) {
    console.error("Error fetching pages:", error);
  }

  // Transform settings to match client component interface
  const initialSettings = {
    siteName: settingsData.siteName || "PKR Games",
    logo: settingsData.logo || "",
    favicon: settingsData.favicon || "",
    headerMenu: (settingsData.headerMenu as string[]) || ["Home", "Apps", "Games", "Casinos"],
    footerLinks: (settingsData.footerLinks as any[]) || [],
    socialMedia: (settingsData.socialMedia as any) || {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      pinterest: "",
      telegram: "",
    },
    heroTitle: settingsData.heroTitle || "",
    heroSubtitle: settingsData.heroSubtitle || "",
    heroBackground: settingsData.heroBackground || "",
    enableComments: settingsData.enableComments !== undefined ? settingsData.enableComments : true,
    primaryColor: settingsData.primaryColor || "#dc2626",
    secondaryColor: settingsData.secondaryColor || "#16a34a",
    backgroundColor: settingsData.backgroundColor || "#111827",
    textColor: settingsData.textColor || "#ffffff",
    buttonColor: settingsData.buttonColor || "#dc2626",
    buttonTextColor: settingsData.buttonTextColor || "#ffffff",
    linkColor: settingsData.linkColor || "#3b82f6",
    successColor: settingsData.successColor || "#16a34a",
    errorColor: settingsData.errorColor || "#dc2626",
    warningColor: settingsData.warningColor || "#f59e0b",
    infoColor: settingsData.infoColor || "#3b82f6",
    headerScript: settingsData.headerScript || "",
    footerScript: settingsData.footerScript || "",
    headerCSS: settingsData.headerCSS || "",
    footerCSS: settingsData.footerCSS || "",
  };

  return <SettingsClient initialSettings={initialSettings} pages={pages} />;
}
