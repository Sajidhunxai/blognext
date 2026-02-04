/**
 * Normalizes a URL by removing trailing slashes
 * @param url - The URL to normalize
 * @returns The normalized URL without trailing slash
 */
export function normalizeUrl(url: string): string {
  if (!url) return url;
  return url.replace(/\/+$/, '');
}

/**
 * Constructs a canonical URL by joining base URL with path
 * Handles trailing slashes properly to avoid double slashes
 * @param baseUrl - The base URL (e.g., https://example.com or https://example.com/)
 * @param path - The path to append (e.g., /post/slug or post/slug)
 * @returns The properly formatted canonical URL
 */
export function buildCanonicalUrl(baseUrl: string, path: string): string {
  const normalizedBase = normalizeUrl(baseUrl);
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

