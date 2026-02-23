import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function findRedirectUncached(from: string) {
  if (!prisma || !('redirect' in prisma)) return null;

  let redirect = await (prisma as any).redirect.findFirst({
    where: { from, active: true },
  });
  if (redirect) return redirect;

  redirect = await (prisma as any).redirect.findFirst({
    where: { from: `${from}/`, active: true },
  });
  if (redirect) return redirect;

  if (from.startsWith('/')) {
    redirect = await (prisma as any).redirect.findFirst({
      where: { from: from.slice(1), active: true },
    });
  }
  return redirect;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");

  if (!from) {
    return NextResponse.json({ redirect: null });
  }

  try {
    const getCached = unstable_cache(
      () => findRedirectUncached(from),
      ['redirect-check', from],
      { revalidate: 300, tags: ['redirects'] }
    );

    const redirect = await getCached();

    if (redirect) {
      return NextResponse.json({
        redirect: { to: redirect.to, type: redirect.type },
      });
    }
    return NextResponse.json({ redirect: null });
  } catch (error: any) {
    console.error("Error checking redirect:", error);
    return NextResponse.json({ redirect: null });
  }
}

