import { redirect, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

type Props = {
  params: { slug: string[] };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function findRedirectForPath(pathname: string) {
  if (!prisma || !('redirect' in prisma)) return null;
  let r = await (prisma as any).redirect.findFirst({ where: { from: pathname, active: true } });
  if (r) return r;
  r = await (prisma as any).redirect.findFirst({ where: { from: `${pathname}/`, active: true } });
  if (r) return r;
  if (pathname.startsWith('/')) {
    r = await (prisma as any).redirect.findFirst({ where: { from: pathname.slice(1), active: true } });
  }
  return r;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: "Page Not Found" };
}

export default async function CatchAllPage({ params }: Props) {
  const pathname = `/${params.slug.join("/")}`;

  try {
    const getCached = unstable_cache(
      () => findRedirectForPath(pathname),
      ['catchall-redirect', pathname],
      { revalidate: 300, tags: ['redirects'] }
    );
    const redirectRecord = await getCached();

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

