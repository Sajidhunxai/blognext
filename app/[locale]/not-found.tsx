import Link from "next/link";
import { headers } from "next/headers";
import { getSettingsWithLocale } from "@/lib/i18n/content";
import { isLocalePrefix, type Locale } from "@/lib/i18n/config";
import FrontendLayout from "@/components/FrontendLayout";
import ColoredButton from "@/components/ColoredButton";
import NotFoundAnimation from "@/components/NotFoundAnimation";

const i18n: Record<string, {
  title: string;
  heading: string;
  line1: string;
  line2: string;
  home: string;
  browse: string;
  alsoLooking: string;
  allPosts: string;
  tip: string;
}> = {
  ur: {
    title: "404 - صفحہ نہیں ملا",
    heading: "صفحہ نہیں ملا",
    line1: "اوہ! آپ جو صفحہ ڈھونڈ رہے ہیں وہ موجود نہیں۔",
    line2: "ہو سکتا ہے اسے منتقل، حذف کر دیا گیا ہو یا URL غلط ہو۔",
    home: "ہوم پیج پر جائیں",
    browse: "پوسٹس دیکھیں",
    alsoLooking: "آپ شاید یہ ڈھونڈ رہے ہیں:",
    allPosts: "تمام پوسٹس",
    tip: "تجویز: ہماری کیٹیگریز میں جا کر جو چاہیں تلاش کریں۔",
  },
  hi: {
    title: "404 - पृष्ठ नहीं मिला",
    heading: "पृष्ठ नहीं मिला",
    line1: "अरे! जो पृष्ठ आप ढूंढ रहे हैं वह मौजूद नहीं है।",
    line2: "हो सकता है इसे स्थानांतरित, हटाया गया हो या URL गलत हो।",
    home: "होमपेज पर जाएं",
    browse: "पोस्ट देखें",
    alsoLooking: "आप शायद यह ढूंढ रहे हैं:",
    allPosts: "सभी पोस्ट",
    tip: "सुझाव: हमारी श्रेणियों में जाकर जो चाहें खोजें।",
  },
};

export async function generateMetadata() {
  const headersList = headers();
  const localeHeader = headersList.get("x-locale") || "";
  const locale = isLocalePrefix(localeHeader) ? (localeHeader as Locale) : "en";
  const t = i18n[locale];
  const settings = await getSettingsWithLocale(locale);

  return {
    title: t?.title || "404 - Page Not Found",
    description: `The page you're looking for doesn't exist on ${settings?.siteName || "our website"}.`,
  };
}

export default async function LocaleNotFound() {
  const headersList = headers();
  const localeHeader = headersList.get("x-locale") || "";
  const locale = isLocalePrefix(localeHeader) ? (localeHeader as Locale) : "en";
  const t = i18n[locale];

  const settings = await getSettingsWithLocale(locale);
  const colors = {
    primary: (settings as any)?.primaryColor || "#dc2626",
    secondary: (settings as any)?.secondaryColor || "#16a34a",
    background: (settings as any)?.backgroundColor || "#111827",
    text: (settings as any)?.textColor || "#ffffff",
    button: (settings as any)?.buttonColor || "#dc2626",
    link: (settings as any)?.linkColor || "#3b82f6",
    error: (settings as any)?.errorColor || "#dc2626",
  };

  const homeHref = locale === "en" ? "/" : `/${locale}/`;
  const browseHref = locale === "en" ? "/category/apps" : `/${locale}/category/apps`;
  const postsHref = locale === "en" ? "/posts" : `/${locale}/posts`;

  if (!t) {
    // Shouldn't happen, but safety fallback — render English 404 text
    return null;
  }

  return (
    <FrontendLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
            style={{ backgroundColor: colors.primary }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse delay-1000"
            style={{ backgroundColor: colors.secondary }}
          />
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10" dir={locale === "ur" ? "rtl" : "ltr"}>
          <div className="mb-6">
            <NotFoundAnimation colors={colors} />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl dark:text-white text-theme-text sm:text-4xl md:text-5xl font-bold mb-4">
              {t.heading}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-2">
              {t.line1}
            </p>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-500">
              {t.line2}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ColoredButton
              href={homeHref}
              color="button"
              className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-300"
            >
              {t.home}
            </ColoredButton>
            <ColoredButton
              href={browseHref}
              color="secondary"
              className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-300"
            >
              {t.browse}
            </ColoredButton>
          </div>

          <div className="mt-12 pt-8 border-t dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t.alsoLooking}</p>
            <div className="flex flex-wrap justify-center gap-4 items-center">
              <Link
                href={homeHref}
                className="text-sm font-medium hover:underline"
                style={{ color: colors.link }}
              >
                {locale === "ur" ? "ہوم" : locale === "hi" ? "होम" : "Home"}
              </Link>
              <span className="text-sm text-gray-400 dark:text-gray-600">|</span>
              <Link
                href={postsHref}
                className="text-sm font-medium hover:underline"
                style={{ color: colors.link }}
              >
                {t.allPosts}
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">
                {locale === "ur" ? "تجویز:" : locale === "hi" ? "सुझाव:" : "Tip:"}
              </span>{" "}
              {t.tip}
            </p>
          </div>
        </div>
      </div>
    </FrontendLayout>
  );
}
