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
  // Convert old string[] format to new {label, url}[] format if needed
  const headerMenuRaw = settingsData.headerMenu || ["Home", "Apps", "Games", "Casinos"];
  // Ensure headerMenuRaw is an array
  const headerMenuArray = Array.isArray(headerMenuRaw) ? headerMenuRaw : [];
  const headerMenu = headerMenuArray.map((item: any, index: number) => {
    // If already in new format, return as is
    if (typeof item === "object" && item !== null && "label" in item && "url" in item) {
      return item;
    }
    // Convert old string format to new format
    const label = typeof item === "string" ? item : "";
    let url = "";
    if (index === 0 && label.toLowerCase() === "home") {
      url = "/";
    } else if (typeof label === "string" && label.startsWith("page:")) {
      const slug = label.substring(5);
      url = `/pages/${slug}`;
    } else {
      url = `/${label.toLowerCase().replace(/\s+/g, "-")}`;
    }
    return { label, url };
  });

  const initialSettings = {
    siteName: settingsData.siteName || "PKR Games",
    logo: settingsData.logo || "",
    favicon: settingsData.favicon || "",
    headerMenu: headerMenu,
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
    metaTitle: settingsData.metaTitle || "",
    metaDescription: settingsData.metaDescription || "",
    whyChooseTitle: settingsData.whyChooseTitle || "",
    whyChooseSubtitle: settingsData.whyChooseSubtitle || "",
    whyChooseFeatures: (settingsData.whyChooseFeatures as any[]) || [],
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
