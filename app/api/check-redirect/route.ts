import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");

  if (!from) {
    return NextResponse.json({ redirect: null });
  }

  try {
    if (!prisma || !('redirect' in prisma)) {
      return NextResponse.json({ redirect: null });
    }

    // Try exact match first
    let redirect = await (prisma as any).redirect.findFirst({
      where: {
        from: from,
        active: true,
      },
    });

    // Try with trailing slash
    if (!redirect) {
      redirect = await (prisma as any).redirect.findFirst({
        where: {
          from: `${from}/`,
          active: true,
        },
      });
    }

    // Try without leading slash
    if (!redirect && from.startsWith('/')) {
      redirect = await (prisma as any).redirect.findFirst({
        where: {
          from: from.slice(1),
          active: true,
        },
      });
    }

    if (redirect) {
      return NextResponse.json({
        redirect: {
          to: redirect.to,
          type: redirect.type,
        },
      });
    }

    return NextResponse.json({ redirect: null });
  } catch (error: any) {
    console.error("Error checking redirect:", error);
    return NextResponse.json({ redirect: null });
  }
}

