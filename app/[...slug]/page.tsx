import { redirect, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";

type Props = {
  params: { slug: string[] };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Check redirect in metadata generation to catch it early
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pathname = `/${params.slug.join("/")}`;
  
  try {
    if (prisma && 'redirect' in prisma) {
      let redirectRecord = await (prisma as any).redirect.findFirst({
        where: {
          from: pathname,
          active: true,
        },
      });

      if (!redirectRecord) {
        redirectRecord = await (prisma as any).redirect.findFirst({
          where: {
            from: `${pathname}/`,
            active: true,
          },
        });
      }

      if (redirectRecord) {
        let destination = redirectRecord.to;
        if (!destination.startsWith("http")) {
          if (!destination.startsWith("/")) {
            destination = `/${destination}`;
          }
        }
        
        // Redirect immediately
        if (redirectRecord.type === 301) {
          permanentRedirect(destination);
        } else {
          redirect(destination);
        }
      }
    }
  } catch (error) {
    // Continue to page component
  }

  return {
    title: "Page Not Found",
  };
}

export default async function CatchAllPage({ params }: Props) {
  // Reconstruct the path from the slug array
  const pathname = `/${params.slug.join("/")}`;

  try {
    // Check if a redirect exists for this path
    if (!prisma) {
      notFound();
    }

    if (!('redirect' in prisma)) {
      notFound();
    }

    // Try exact match first
    let redirectRecord = await (prisma as any).redirect.findFirst({
      where: {
        from: pathname,
        active: true,
      },
    });

    // If no exact match, try with trailing slash
    if (!redirectRecord) {
      redirectRecord = await (prisma as any).redirect.findFirst({
        where: {
          from: `${pathname}/`,
          active: true,
        },
      });
    }

    // Also try without leading slash (in case it was stored incorrectly)
    if (!redirectRecord) {
      const pathWithoutSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      redirectRecord = await (prisma as any).redirect.findFirst({
        where: {
          from: pathWithoutSlash,
          active: true,
        },
      });
    }

    if (redirectRecord) {
      // Determine if destination is absolute or relative
      let destination = redirectRecord.to;
      
      // If relative, ensure it starts with /
      if (!destination.startsWith("http")) {
        if (!destination.startsWith("/")) {
          destination = `/${destination}`;
        }
      }

      // Perform redirect with appropriate status code
      // 301 = permanent, 302 = temporary
      if (redirectRecord.type === 301) {
        permanentRedirect(destination);
      } else {
        redirect(destination);
      }
    }
  } catch (error) {
    console.error("Error checking redirect:", error);
  }

  // If no redirect found, show 404
  notFound();
}

