import { prisma } from "./prisma";

export async function getSettings() {
  try {
    if (!prisma) {
      throw new Error("Prisma client is not initialized");
    }

    // Check if Settings model exists in Prisma Client
    if (!('settings' in prisma)) {
      console.error("Settings model not found in Prisma Client. Please restart the dev server.");
      throw new Error("Settings model not available. Please restart the dev server.");
    }

    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteName: "PKR Games",
          headerMenu: ["Home", "Apps", "Games", "Casinos"],
          footerLinks: [],
          socialMedia: {
            facebook: "",
            twitter: "",
            instagram: "",
            youtube: "",
            pinterest: "",
            telegram: "",
          },
          heroTitle: "PKR Gamesd - Download Best Games",
          heroSubtitle: "",
        },
      });
    }

    return settings;
  } catch (error: any) {
    console.error("Error in getSettings:", error);
    // Return default settings if there's an error
    return {
      id: "",
      siteName: "PKR Games",
      logo: "",
      favicon: "",
      headerMenu: ["Home", "Apps", "Games", "Casinos"],
      footerLinks: [],
      socialMedia: {
        facebook: "",
        twitter: "",
        instagram: "",
        youtube: "",
        pinterest: "",
        telegram: "",
      },
          heroTitle: "PKR Games - Download Best Games",
          heroSubtitle: "",
          heroBackground: "",
          enableComments: true,
          primaryColor: "#dc2626",
      secondaryColor: "#16a34a",
      backgroundColor: "#111827",
      textColor: "#ffffff",
      buttonColor: "#dc2626",
      linkColor: "#3b82f6",
      successColor: "#16a34a",
      errorColor: "#dc2626",
      warningColor: "#f59e0b",
      infoColor: "#3b82f6",
      headerScript: null,
      footerScript: null,
      headerCSS: null,
      footerCSS: null,
      updatedAt: new Date(),
    } as any;
  }
}

