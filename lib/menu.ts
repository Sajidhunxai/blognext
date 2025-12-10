import { prisma } from "./prisma";

// Convert text to URL-friendly slug
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export async function getMenuUrl(menuItem: string): Promise<string> {
  // First item is always home
  if (menuItem.toLowerCase() === "home") {
    return "/";
  }

  // Check if this is a page reference in format "page:slug"
  if (menuItem.startsWith("page:")) {
    const slug = menuItem.substring(5); // Remove "page:" prefix
    return `/pages/${slug}`;
  }

  try {
    // Check if there's a page with this title or slug
    if (prisma && 'page' in prisma) {
      // First, try to find by exact title match
      let page = await (prisma as any).page.findFirst({
        where: {
          title: menuItem,
          published: true,
        },
      });

      // If not found by title, try to find by slug
      if (!page) {
        page = await (prisma as any).page.findFirst({
          where: {
            slug: menuItem,
            published: true,
          },
        });
      }

      // Also try case-insensitive title match
      if (!page) {
        const allPages = await (prisma as any).page.findMany({
          where: {
            published: true,
          },
        });
        page = allPages.find((p: any) => 
          p.title.toLowerCase() === menuItem.toLowerCase()
        );
      }

      if (page) {
        return `/pages/${page.slug}`;
      }
    }
  } catch (error) {
    // If Page model is not available, just continue with default behavior
    console.error("Error checking for page:", error);
  }

  // Default to URL-friendly slug (convert spaces to hyphens, lowercase, etc.)
  return `/${toSlug(menuItem)}`;
}

type MenuItem = string | { label: string; url: string };

export async function resolveMenuItems(menuItems: MenuItem[]): Promise<Array<{ label: string; url: string }>> {
  const resolved = await Promise.all(
    menuItems.map(async (item, index) => {
      // Handle new object format
      if (typeof item === "object" && item !== null && "label" in item && "url" in item) {
        // If URL is empty, try to resolve it
        if (!item.url || item.url.trim() === "") {
          const resolvedUrl = await getMenuUrl(item.label);
          return { label: item.label, url: resolvedUrl };
        }
        // First item should link to home if label is "Home"
        if (index === 0 && item.label.toLowerCase() === "home" && item.url !== "/") {
          return { label: item.label, url: "/" };
        }
        return { label: item.label, url: item.url };
      }

      // Handle old string format (backward compatibility)
      let label = item as string;
      let url = await getMenuUrl(label);

      // If item is in "page:slug" format, look up the page title for display
      if (label.startsWith("page:")) {
        const slug = label.substring(5);
        try {
          if (prisma && 'page' in prisma) {
            const page = await (prisma as any).page.findFirst({
              where: {
                slug: slug,
                published: true,
              },
            });
            if (page) {
              label = page.title;
            } else {
              // Fallback to slug if page not found
              label = slug;
            }
          }
        } catch (error) {
          // Fallback to slug if error
          label = slug;
        }
      }

      return { label, url };
    })
  );
  return resolved;
}

