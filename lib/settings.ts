import { prisma } from "./prisma";
import { unstable_cache } from "next/cache";

// Default settings object (used when settings don't exist in DB)
function getDefaultSettings() {
  return {
    id: "",
    siteName: "App Marka",
    logo: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766218941/apkapp/tckns1cbre8cntlqipzc.png",
    darkModeLogo: null,
    favicon: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766218951/apkapp/awtdtxtoqrtho7b68ez3.png",
    headerMenu: ["Home", "Apps", "Games"],
    footerLinks: [],
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      pinterest: "",
      telegram: "",
    },
    heroTitle: "Apps, APKs & Alternative App Reviews",
    heroSubtitle: "Your trusted source for alternative apps, APK downloads & app reviews",
    heroBackground: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766219090/apkapp/wogljnipr5b0jjcwinzd.jpg",
    metaTitle: "AppMarka | Apps, APKs & Alternative App Reviews",
    metaDescription: "AppMarka | Apps, APKs & Alternative App Reviews. Discover, download, and explore the latest Android apps and games. Free, safe, and always up-to-date.",
    whyChooseTitle: "Why Choose Appmarka?",
    whyChooseSubtitle: "Your trusted platform for app discovery, reviews, and tech insights beyond the Play Store",
    whyChooseFeatures: [],
    enableComments: true,
    primaryColor: "#5170ff",
    secondaryColor: "#5c76ef",
    backgroundColor: "#faf9f9",
    textColor: "#1a1a1a",
    buttonColor: "#5c76ef",
    buttonTextColor: "#ffffff",
    linkColor: "#2341c7",
    successColor: "#16a34a",
    errorColor: "#dc2626",
    warningColor: "#f59e0b",
    infoColor: "#3b82f6",
    darkModeBackgroundColor: "#272626",
    darkModeTextColor: "#ededed",
    headerScript: null,
    footerScript: null,
    headerCSS: null,
    footerCSS: null,
    updatedAt: new Date(),
  } as any;
}

// Cache settings for 5 minutes to improve performance
const getCachedSettings = unstable_cache(
  async () => {
    try {
      if (!prisma) {
        throw new Error("Prisma client is not initialized");
      }

      // Check if Settings model exists in Prisma Client
      if (!('settings' in prisma)) {
        console.error("Settings model not found in Prisma Client. Please restart the dev server.");
        throw new Error("Settings model not available. Please restart the dev server.");
      }

      // Add timeout to prevent hanging during build
      const settingsPromise = prisma.settings.findFirst();
      const timeoutPromise = new Promise<any>((resolve) => 
        setTimeout(() => resolve(null), 10000)
      );
      
      let settings = await Promise.race([settingsPromise, timeoutPromise]);

      // If query timed out, check if settings exist using a count query (faster)
      // DO NOT create settings here - let the settings API route handle creation
      // This prevents overwriting existing settings when queries timeout
      if (!settings) {
        try {
          const count = await Promise.race([
            prisma.settings.count(),
            new Promise<number>((resolve) => setTimeout(() => resolve(0), 5000))
          ]);
          
          // If settings exist but query was slow, try fetching again
          if (count > 0) {
            settings = await Promise.race([
              prisma.settings.findFirst(),
              new Promise<any>((resolve) => setTimeout(() => resolve(null), 5000))
            ]);
          }
        } catch (err) {
          console.error("Error checking settings count:", err);
        }
      }

      // If settings still don't exist, return defaults without creating in DB
      // The settings API route will handle creation when needed
      if (!settings) {
        return getDefaultSettings();
      }

      return settings;
    } catch (error: any) {
      console.error("Error in getSettings:", error);
      // Return default settings if there's an error (without creating in DB)
      return getDefaultSettings();
    }
  },
  ['settings'],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ['settings'],
  }
);

export async function getSettings() {
  return getCachedSettings();
}

