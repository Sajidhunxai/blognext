import { buildCanonicalUrl } from "@/lib/url";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_URLS_PER_REQUEST = 10_000;

export interface IndexNowConfig {
  key: string;
  host: string;
  keyLocation: string;
  origin: string;
}

/** Read IndexNow settings from environment. Returns null if not configured. */
export function getIndexNowConfig(): IndexNowConfig | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  if (!key) return null;

  const siteUrl =
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) return null;

  try {
    const parsed = new URL(siteUrl);
    const origin = parsed.origin.replace(/\/+$/, "");
    return {
      key,
      host: parsed.hostname,
      keyLocation: `${origin}/${key}.txt`,
      origin,
    };
  } catch {
    return null;
  }
}

export function isIndexNowKeyFile(filename: string): boolean {
  const config = getIndexNowConfig();
  return !!config && filename === `${config.key}.txt`;
}

export function buildAbsoluteUrl(path: string): string | null {
  const config = getIndexNowConfig();
  if (!config) return null;
  return buildCanonicalUrl(config.origin, path);
}

export function buildPostIndexNowUrl(slug: string): string | null {
  return buildAbsoluteUrl(`/post/${slug}`);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/** Submit one or more URLs to IndexNow (Bing, Yandex, etc.). */
export async function submitIndexNowUrls(
  urls: string[],
): Promise<{ ok: boolean; status?: number; error?: string; submitted?: number }> {
  const config = getIndexNowConfig();
  const unique = Array.from(new Set(urls.filter(Boolean)));

  if (!config) {
    return { ok: false, error: "IndexNow is not configured (set INDEXNOW_KEY)" };
  }
  if (unique.length === 0) {
    return { ok: false, error: "No URLs to submit" };
  }

  let submitted = 0;

  for (const batch of chunk(unique, MAX_URLS_PER_REQUEST)) {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: config.host,
        key: config.key,
        keyLocation: config.keyLocation,
        urlList: batch,
      }),
    });

    // 200 = OK, 202 = Accepted
    if (res.status !== 200 && res.status !== 202) {
      const body = await res.text().catch(() => "");
      return {
        ok: false,
        status: res.status,
        error: body || `IndexNow returned HTTP ${res.status}`,
        submitted,
      };
    }

    submitted += batch.length;
  }

  return { ok: true, submitted };
}

/** Fire-and-forget notification for a published post URL. */
export function notifyIndexNowPost(slug: string, published?: boolean): void {
  if (published === false) return;

  const url = buildPostIndexNowUrl(slug);
  if (!url) return;

  submitIndexNowUrls([url]).catch((err) => {
    console.error("[IndexNow] Failed to notify post:", slug, err);
  });
}

/** Fire-and-forget batch notification (e.g. after bulk import). */
export function notifyIndexNowPosts(slugs: string[]): void {
  const urls = slugs
    .map((slug) => buildPostIndexNowUrl(slug))
    .filter((url): url is string => !!url);

  if (urls.length === 0) return;

  submitIndexNowUrls(urls).catch((err) => {
    console.error("[IndexNow] Failed to notify posts:", err);
  });
}
