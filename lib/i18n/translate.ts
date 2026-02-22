/**
 * MyMemory Translation API - free, no API key or credit card required.
 * Limits: ~1000 words/day unregistered, 10000 words/day with free account.
 * Optional: Set MYMEMORY_EMAIL in .env for higher limits.
 * @see https://mymemory.translated.net/doc/spec.php
 */

const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL; // Optional, for higher quota
const BASE_URL = "https://api.mymemory.translated.net/get";

/** Target locale to MyMemory language code */
export const localeToLanguageCode: Record<string, string> = {
  ur: "ur",
  hi: "hi",
  en: "en",
};

export interface TranslateResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export async function translateText(
  text: string,
  targetLocale: string
): Promise<TranslateResult | null> {
  const target = localeToLanguageCode[targetLocale] || targetLocale;
  if (target === "en") return { translatedText: text };

  if (!text || text.trim().length === 0) {
    return { translatedText: text };
  }

  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `en|${target}`,
    });
    if (MYMEMORY_EMAIL) params.set("de", MYMEMORY_EMAIL);

    const res = await fetch(`${BASE_URL}?${params.toString()}`);

    if (!res.ok) {
      console.error("MyMemory API error:", res.status);
      return null;
    }

    const data = await res.json();

    if (data.responseStatus !== 200) {
      console.error("MyMemory response error:", data.responseDetails);
      return null;
    }

    const translatedText = data.responseData?.translatedText;
    if (translatedText == null) return null;

    return {
      translatedText: String(translatedText),
      detectedSourceLanguage: data.responseData?.detectedSourceLanguage,
    };
  } catch (e) {
    console.error("Translation error:", e);
    return null;
  }
}

/** Translate multiple texts. Runs sequentially to avoid rate limits. */
export async function translateBatch(
  texts: string[],
  targetLocale: string
): Promise<(string | null)[]> {
  if (texts.length === 0) return [];

  const target = localeToLanguageCode[targetLocale] || targetLocale;
  if (target === "en") return texts;

  const results: (string | null)[] = [];

  for (let i = 0; i < texts.length; i++) {
    const r = await translateText(texts[i], targetLocale);
    results.push(r?.translatedText ?? null);
    // Small delay between requests to avoid rate limiting
    if (i < texts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return results;
}
