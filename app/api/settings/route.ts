import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { secureResponse, obfuscateResponse } from "@/lib/api-security";
import { revalidateTag } from "next/cache";

// Ensure this route is dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    if (!prisma) {
      return secureResponse(
        { error: "Prisma client not initialized" },
        500
      );
    }

    // Verify Settings model exists
    if (!('settings' in prisma)) {
      console.error("Settings model not found. Run: npx prisma generate && restart server");
      return secureResponse(
        { 
          error: "Settings model not found",
          hint: "Run 'npx prisma generate' and restart the dev server"
        },
        500
      );
    }

    // Get all settings records to check for duplicates
    const allSettings = await prisma.settings.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    let settings = allSettings[0] || null;

    // If there are multiple settings records, keep the most recent one
    // IMPORTANT: Don't auto-delete duplicates in GET endpoint to prevent accidental data loss
    // If duplicates need cleanup, use the POST endpoint with confirm=true
    if (allSettings.length > 1) {
      console.warn(`Found ${allSettings.length} settings records. Keeping most recent (ID: ${allSettings[0].id}). Consider cleaning duplicates manually.`);
      settings = allSettings[0];
    }

    // If no settings exist, create default settings in MongoDB
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          siteName: "App Marka",
          logo: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766218941/apkapp/tckns1cbre8cntlqipzc.png",
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
        },
      });
    }

    // Obfuscate sensitive fields and add security headers
    const safeSettings = obfuscateResponse(settings);
    return secureResponse(safeSettings);
  } catch (error: any) {
    return secureResponse(
      { error: error.message || "Failed to fetch settings" },
      500
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    if (!prisma) {
      return secureResponse(
        { error: "Prisma client not initialized" },
        500
      );
    }

    // Verify Settings model exists
    if (!('settings' in prisma)) {
      console.error("Settings model not found. Run: npx prisma generate && restart server");
      return secureResponse(
        { 
          error: "Settings model not found",
          hint: "Run 'npx prisma generate' and restart the dev server"
        },
        500
      );
    }

    const data = await req.json();

    // Get all settings records to check for duplicates
    const allSettings = await prisma.settings.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    let settings = allSettings[0] || null;

    // If there are multiple settings records, keep the most recent one for update
    // Only log warning - don't auto-delete to prevent accidental data loss
    if (allSettings.length > 1) {
      console.warn(`Found ${allSettings.length} settings records. Updating most recent (ID: ${allSettings[0].id}). Consider cleaning duplicates manually via POST endpoint.`);
      settings = allSettings[0];
    }

    // Build update data object explicitly
    const updateData: any = {};
    
    if (data.siteName !== undefined) updateData.siteName = data.siteName;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.darkModeLogo !== undefined) updateData.darkModeLogo = data.darkModeLogo;
    if (data.favicon !== undefined) updateData.favicon = data.favicon;
    if (data.headerMenu !== undefined) updateData.headerMenu = data.headerMenu;
    if (data.footerLinks !== undefined) updateData.footerLinks = data.footerLinks;
    if (data.socialMedia !== undefined) updateData.socialMedia = data.socialMedia;
    if (data.heroTitle !== undefined) updateData.heroTitle = data.heroTitle;
    if (data.heroSubtitle !== undefined) updateData.heroSubtitle = data.heroSubtitle;
    if (data.heroBackground !== undefined) updateData.heroBackground = data.heroBackground;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.whyChooseTitle !== undefined) updateData.whyChooseTitle = data.whyChooseTitle;
    if (data.whyChooseSubtitle !== undefined) updateData.whyChooseSubtitle = data.whyChooseSubtitle;
    if (data.whyChooseFeatures !== undefined) updateData.whyChooseFeatures = data.whyChooseFeatures;
    if (data.enableComments !== undefined) updateData.enableComments = data.enableComments;
    if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
    if (data.secondaryColor !== undefined) updateData.secondaryColor = data.secondaryColor;
    if (data.backgroundColor !== undefined) updateData.backgroundColor = data.backgroundColor;
    if (data.textColor !== undefined) updateData.textColor = data.textColor;
    if (data.buttonColor !== undefined) updateData.buttonColor = data.buttonColor;
    if (data.buttonTextColor !== undefined) updateData.buttonTextColor = data.buttonTextColor;
    if (data.linkColor !== undefined) updateData.linkColor = data.linkColor;
    if (data.successColor !== undefined) updateData.successColor = data.successColor;
    if (data.errorColor !== undefined) updateData.errorColor = data.errorColor;
    if (data.warningColor !== undefined) updateData.warningColor = data.warningColor;
    if (data.infoColor !== undefined) updateData.infoColor = data.infoColor;
    if (data.darkModeBackgroundColor !== undefined) updateData.darkModeBackgroundColor = data.darkModeBackgroundColor;
    if (data.darkModeTextColor !== undefined) updateData.darkModeTextColor = data.darkModeTextColor;
    if (data.headerScript !== undefined) updateData.headerScript = data.headerScript;
    if (data.footerScript !== undefined) updateData.footerScript = data.footerScript;
    if (data.headerCSS !== undefined) updateData.headerCSS = data.headerCSS;
    if (data.footerCSS !== undefined) updateData.footerCSS = data.footerCSS;

    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await prisma.settings.create({
        data: {
          siteName: data.siteName || "PKR Games",
          logo: data.logo || "",
          darkModeLogo: data.darkModeLogo || null,
          favicon: data.favicon || "",
          headerMenu: data.headerMenu || [],
          footerLinks: data.footerLinks || [],
          socialMedia: data.socialMedia || {},
          heroTitle: data.heroTitle || null,
          heroSubtitle: data.heroSubtitle || "",
          heroBackground: data.heroBackground || "",
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          whyChooseTitle: data.whyChooseTitle || null,
          whyChooseSubtitle: data.whyChooseSubtitle || null,
          whyChooseFeatures: data.whyChooseFeatures || [],
          enableComments: data.enableComments !== undefined ? data.enableComments : true,
      primaryColor: data.primaryColor || "#5170ff",
      secondaryColor: data.secondaryColor || "#5c76ef",
      backgroundColor: data.backgroundColor || "#faf9f9",
      textColor: data.textColor || "#1a1a1a",
      buttonColor: data.buttonColor || "#5c76ef",
      buttonTextColor: data.buttonTextColor || "#ffffff",
      linkColor: data.linkColor || "#2341c7",
      successColor: data.successColor || "#16a34a",
      errorColor: data.errorColor || "#dc2626",
      warningColor: data.warningColor || "#f59e0b",
      infoColor: data.infoColor || "#3b82f6",
      darkModeBackgroundColor: data.darkModeBackgroundColor || "#272626",
      darkModeTextColor: data.darkModeTextColor || "#ededed",
          headerScript: data.headerScript || null,
          footerScript: data.footerScript || null,
          headerCSS: data.headerCSS || null,
          footerCSS: data.footerCSS || null,
        },
      });
    }

    // Revalidate the settings cache so changes are immediately visible
    revalidateTag('settings');

    // Obfuscate sensitive fields and add security headers
    const safeSettings = obfuscateResponse(settings);
    return secureResponse(safeSettings);
  } catch (error: any) {
    return secureResponse(
      { error: error.message || "Failed to update settings" },
      500
    );
  }
}

// POST endpoint to initialize/reset to default settings (admin only)
// IMPORTANT: This endpoint resets ALL settings to defaults. Use with caution!
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    // Require explicit confirmation parameter to prevent accidental resets
    const { searchParams } = new URL(req.url);
    const confirm = searchParams.get("confirm");
    
    if (confirm !== "true") {
      return secureResponse(
        { 
          error: "Confirmation required. Add ?confirm=true to the URL to reset settings.",
          warning: "This will reset ALL settings to defaults. This action cannot be undone."
        },
        400
      );
    }
    if (!prisma) {
      return secureResponse(
        { error: "Prisma client not initialized" },
        500
      );
    }

    // Verify Settings model exists
    if (!('settings' in prisma)) {
      return secureResponse(
        { 
          error: "Settings model not found",
          hint: "Run 'npx prisma generate' and restart the dev server"
        },
        500
      );
    }

    // Get all settings records to check for duplicates
    const allSettings = await prisma.settings.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    // If there are multiple settings records, clean up duplicates (keep the correct one)
    let existing = allSettings[0] || null;
    
    if (allSettings.length > 1) {
      console.warn(`Found ${allSettings.length} settings records. Cleaning up duplicates...`);
      
      // Smart detection: Find the one with "App Marka" (correct one)
      let keepSettings = allSettings.find(s => s.siteName === 'App Marka');
      
      if (!keepSettings) {
        // If no "App Marka" found, find the one with most complete data
        let bestScore = -1;
        for (const setting of allSettings) {
          let score = 0;
          if (setting.logo) score += 1;
          if (setting.favicon) score += 1;
          if (setting.heroBackground) score += 1;
          if (setting.metaTitle) score += 1;
          if (setting.metaDescription) score += 1;
          if (setting.whyChooseTitle) score += 1;
          if (setting.whyChooseSubtitle) score += 1;
          if (setting.primaryColor === '#5170ff') score += 2;
          if (setting.backgroundColor === '#faf9f9') score += 2;
          
          if (score > bestScore) {
            bestScore = score;
            keepSettings = setting;
          }
        }
      }
      
      // Ensure we have a settings to keep (fallback to first one if somehow still undefined)
      if (!keepSettings) {
        keepSettings = allSettings[0];
      }
      
      // Delete duplicates (all except the one to keep)
      const duplicates = allSettings.filter(s => s.id !== keepSettings!.id);
      for (const duplicate of duplicates) {
        await prisma.settings.delete({
          where: { id: duplicate.id },
        });
      }
      console.log(`Cleaned up ${duplicates.length} duplicate settings record(s), kept ID: ${keepSettings.id}`);
      existing = keepSettings;
    }
    
    const defaultSettings = {
      siteName: "App Marka",
      logo: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766218941/apkapp/tckns1cbre8cntlqipzc.png",
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
    };

    let settings;
    if (existing) {
      // Update existing settings with defaults
      settings = await prisma.settings.update({
        where: { id: existing.id },
        data: defaultSettings,
      });
    } else {
      // Create new settings with defaults
      settings = await prisma.settings.create({
        data: defaultSettings,
      });
    }

    // Revalidate cache
    revalidateTag('settings');

    return secureResponse({
      success: true,
      message: existing ? "Settings reset to defaults" : "Default settings initialized",
      settings: obfuscateResponse(settings),
    });
  } catch (error: any) {
    return secureResponse(
      { error: error.message || "Failed to initialize settings" },
      500
    );
  }
}

