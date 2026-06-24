import { buildLlmsTxt } from '@/lib/llms';

export const dynamic = 'force-dynamic';
export const revalidate = 7200; // 2 hours — aligned with sitemap

export async function GET(): Promise<Response> {
  const body = await buildLlmsTxt();

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, s-maxage=7200, stale-while-revalidate=3600',
    },
  });
}
