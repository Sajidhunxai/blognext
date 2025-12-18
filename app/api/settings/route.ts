import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { secureResponse, obfuscateResponse } from "@/lib/api-security";

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

    let settings = await prisma.settings.findFirst();

    // If no settings exist, create default settings
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
          heroTitle: null,
          heroSubtitle: "",
          backgroundColor: "#111827",
          textColor: "#ffffff",
          buttonColor: "#dc2626",
          buttonTextColor: "#ffffff",
          linkColor: "#3b82f6",
          successColor: "#16a34a",
          errorColor: "#dc2626",
          warningColor: "#f59e0b",
          infoColor: "#3b82f6",
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

    // Get existing settings or create new
    let settings = await prisma.settings.findFirst();

    // Build update data object explicitly
    const updateData: any = {};
    
    if (data.siteName !== undefined) updateData.siteName = data.siteName;
    if (data.logo !== undefined) updateData.logo = data.logo;
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
          primaryColor: data.primaryColor || "#dc2626",
          secondaryColor: data.secondaryColor || "#16a34a",
          backgroundColor: data.backgroundColor || "#111827",
          textColor: data.textColor || "#ffffff",
          buttonColor: data.buttonColor || "#dc2626",
          buttonTextColor: data.buttonTextColor || "#ffffff",
          linkColor: data.linkColor || "#3b82f6",
          successColor: data.successColor || "#16a34a",
          errorColor: data.errorColor || "#dc2626",
          warningColor: data.warningColor || "#f59e0b",
          infoColor: data.infoColor || "#3b82f6",
          headerScript: data.headerScript || null,
          footerScript: data.footerScript || null,
          headerCSS: data.headerCSS || null,
          footerCSS: data.footerCSS || null,
        },
      });
    }

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

