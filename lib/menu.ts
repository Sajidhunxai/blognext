import { prisma } from "./prisma";

export async function getMenuUrl(menuItem: string): Promise<string> {
  // First item is always home
  if (menuItem.toLowerCase() === "home") {
    return "/";
  }

  try {
    // Check if there's a page with this title
    if (prisma && 'page' in prisma) {
      const page = await (prisma as any).page.findFirst({
        where: {
          title: menuItem,
          published: true,
        },
      });

      if (page) {
        return `/pages/${page.slug}`;
      }
    }
  } catch (error) {
    // If Page model is not available, just continue with default behavior
    console.error("Error checking for page:", error);
  }

  // Default to lowercase slug
  return `/${menuItem.toLowerCase()}`;
}

export async function resolveMenuItems(menuItems: string[]): Promise<Array<{ label: string; url: string }>> {
  const resolved = await Promise.all(
    menuItems.map(async (item) => ({
      label: item,
      url: await getMenuUrl(item),
    }))
  );
  return resolved;
}

