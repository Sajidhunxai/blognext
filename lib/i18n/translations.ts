/**
 * Static UI translations for frontend (header, footer, common labels).
 * Content (posts, pages, categories) comes from DB translations.
 */

import type { Locale } from "./config";

export const t = {
  en: {
    dashboard: "Dashboard",
    viewAll: "View all",
    noAppsCheckBack: "No apps yet. Check back soon!",
    latestApps: "Latest Apps",
    noAppsYet: "No apps yet.",
    updated: "UPDATED",
    new: "NEW",
    download: "Download",
    backToHome: "Back to home",
    allRightsReserved: "All rights reserved",
    readMore: "Read more",
    loadMore: "Load more",
    share: "Share",
    comments: "Comments",
    postNotFound: "Post not found",
    pageNotFound: "Page not found",
    category: "Category",
    apps: "Apps",
    relatedPosts: "Related posts",
  },
  ur: {
    dashboard: "ڈیش بورڈ",
    viewAll: "سب دیکھیں",
    noAppsCheckBack: "ابھی کوئی ایپ نہیں۔ جلد واپس آئیں!",
    latestApps: "تازہ ترین ایپس",
    noAppsYet: "ابھی کوئی ایپ نہیں۔",
    updated: "اپڈیٹ",
    new: "نیا",
    download: "ڈاؤن لوڈ",
    backToHome: "واپس ہوم",
    allRightsReserved: "جملہ حقوق محفوظ",
    readMore: "مزید پڑھیں",
    loadMore: "مزید لوڈ کریں",
    share: "شیئر کریں",
    comments: "تبصرے",
    postNotFound: "پوسٹ نہیں ملی",
    pageNotFound: "صفحہ نہیں ملا",
    category: "زمرہ",
    apps: "ایپس",
    relatedPosts: "متعلقہ پوسٹس",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    viewAll: "सभी देखें",
    noAppsCheckBack: "अभी कोई ऐप नहीं। जल्द वापस आएं!",
    latestApps: "नवीनतम ऐप्स",
    noAppsYet: "अभी कोई ऐप नहीं।",
    updated: "अपडेट",
    new: "नया",
    download: "डाउनलोड",
    backToHome: "होम पर वापस",
    allRightsReserved: "सर्वाधिकार सुरक्षित",
    readMore: "और पढ़ें",
    loadMore: "और लोड करें",
    share: "शेयर करें",
    comments: "टिप्पणियाँ",
    postNotFound: "पोस्ट नहीं मिली",
    pageNotFound: "पेज नहीं मिला",
    category: "श्रेणी",
    apps: "ऐप्स",
    relatedPosts: "संबंधित पोस्ट",
  },
} as const;

export type TranslationKey = keyof typeof t.en;

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return t[locale]?.[key] ?? t.en[key];
}
