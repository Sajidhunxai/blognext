"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";
import FaqEditor, { type FaqItem } from "./FaqEditor";

const LOCALES = [
  { code: "en" as const, label: "English" },
  { code: "ur" as const, label: "اردو" },
  { code: "hi" as const, label: "हिन्दी" },
];

export interface TranslationData {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  focusKeyword?: string;
  faqs?: FaqItem[];
  developer?: string;
  requirements?: string;
  ogImageAlt?: string;
  featuredImageAlt?: string;
}

interface PostTranslationsTabsProps {
  postId: string | null;
  isNewPost: boolean;
  englishData: TranslationData;
  onEnglishChange?: (data: Partial<TranslationData>) => void;
  children: React.ReactNode;
}

export default function PostTranslationsTabs({
  postId,
  isNewPost,
  englishData,
  onEnglishChange,
  children,
}: PostTranslationsTabsProps) {
  const [activeLang, setActiveLang] = useState<"en" | "ur" | "hi">("en");
  const [translations, setTranslations] = useState<Record<string, TranslationData>>({});
  const [translationLoading, setTranslationLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (postId && !isNewPost) {
      fetchTranslations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, isNewPost]);

  const fetchTranslations = async () => {
    if (!postId) return;
    try {
      const res = await fetch(`/api/posts/${postId}/translations`);
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, TranslationData> = {};
        data.forEach((t: any) => {
          map[t.locale] = {
            title: t.title,
            content: t.content,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
            keywords: t.keywords || [],
            focusKeyword: t.focusKeyword,
            faqs: Array.isArray(t.faqs) ? t.faqs : [],
            developer: t.developer,
            requirements: t.requirements,
            ogImageAlt: t.ogImageAlt,
            featuredImageAlt: t.featuredImageAlt,
          };
        });
        setTranslations(map);
      }
    } catch (e) {
      console.error("Failed to fetch translations", e);
    }
  };

  const handleAutoTranslate = async () => {
    if (activeLang === "en") return;
    setTranslationLoading(true);
    try {
      const fields: (keyof TranslationData)[] = [
        "title",
        "content",
        "metaTitle",
        "metaDescription",
        "developer",
        "requirements",
      ];
      const next = { ...(translations[activeLang] || {}) } as TranslationData;
      next.keywords = next.keywords || [];
      next.faqs = next.faqs || [];

      for (const field of fields) {
        const val = englishData[field];
        if (val && typeof val === "string" && val.trim()) {
          const res = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: val, targetLocale: activeLang }),
          });
          if (res.ok) {
            const { translatedText } = await res.json();
            (next as any)[field] = translatedText;
          }
        }
      }

      if (englishData.keywords?.length) {
        const kwRes = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: englishData.keywords.join(", "),
            targetLocale: activeLang,
          }),
        });
        if (kwRes.ok) {
          const { translatedText } = await kwRes.json();
          next.keywords = translatedText.split(",").map((k: string) => k.trim()).filter(Boolean);
        }
      }

      if (englishData.faqs?.length) {
        const faqs: FaqItem[] = [];
        for (const faq of englishData.faqs) {
          const [qRes, aRes] = await Promise.all([
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: faq.question, targetLocale: activeLang }),
            }),
            fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: faq.answer, targetLocale: activeLang }),
            }),
          ]);
          const q = qRes.ok ? (await qRes.json()).translatedText : faq.question;
          const a = aRes.ok ? (await aRes.json()).translatedText : faq.answer;
          faqs.push({ question: q, answer: a });
        }
        next.faqs = faqs;
      }

      next.metaTitle = next.metaTitle || next.title;
      setTranslations((prev) => ({ ...prev, [activeLang]: next }));
    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleSaveTranslation = async () => {
    if (!postId || activeLang === "en") return;
    const t = translations[activeLang];
    if (!t?.title || !t?.content) {
      setSaveMessage("error");
      return;
    }
    setSaveLoading(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/posts/${postId}/translations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale: activeLang,
          title: t.title,
          content: t.content,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
          keywords: t.keywords,
          focusKeyword: t.focusKeyword,
          faqs: t.faqs?.filter((f) => f.question.trim() && f.answer.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
          developer: t.developer,
          requirements: t.requirements,
          ogImageAlt: t.ogImageAlt,
          featuredImageAlt: t.featuredImageAlt,
        }),
      });
      if (res.ok) {
        setSaveMessage("success");
      } else {
        setSaveMessage("error");
      }
    } catch (e) {
      setSaveMessage("error");
    } finally {
      setSaveLoading(false);
    }
  };

  const updateTranslation = (updates: Partial<TranslationData>) => {
    if (activeLang === "en") return;
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: { ...(prev[activeLang] || {}), ...updates } as TranslationData,
    }));
  };

  const currentTranslation = translations[activeLang] || {
    title: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    focusKeyword: "",
    faqs: [],
    developer: "",
    requirements: "",
  };

  return (
    <div className="space-y-6">
      {/* Language tabs - at top */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-600 mr-2">Language:</span>
        <div className="flex rounded-lg border border-gray-200 bg-gray-50/80 p-1 gap-1">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLang(code)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeLang === code
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeLang === "en" ? (
        children
      ) : isNewPost ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 text-center">
          <p className="text-gray-600 mb-2">Save your post first to add {activeLang === "ur" ? "Urdu" : "Hindi"} translations.</p>
          <p className="text-sm text-gray-500">Create the post, then come back here to translate.</p>
        </div>
      ) : (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeLang === "ur" ? "اردو" : "हिन्दी"} Translation
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translationLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {translationLoading ? "Translating…" : "Auto-translate from English"}
              </button>
              <button
                type="button"
                onClick={handleSaveTranslation}
                disabled={saveLoading || !currentTranslation.title || !currentTranslation.content}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saveLoading ? "Saving…" : "Save translation"}
              </button>
            </div>
          </div>

          {saveMessage === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
              Translation saved.
            </div>
          )}
          {saveMessage === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              Failed to save. Check title and content.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={currentTranslation.title}
              onChange={(e) => updateTranslation({ title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Translated title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <RichTextEditor
              value={currentTranslation.content}
              onChange={(v) => updateTranslation({ content: v })}
              placeholder="Translated content..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta title</label>
              <input
                type="text"
                value={currentTranslation.metaTitle || ""}
                onChange={(e) => updateTranslation({ metaTitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta description</label>
              <textarea
                value={currentTranslation.metaDescription || ""}
                onChange={(e) => updateTranslation({ metaDescription: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma-separated)</label>
            <input
              type="text"
              value={(currentTranslation.keywords || []).join(", ")}
              onChange={(e) =>
                updateTranslation({
                  keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">FAQs</label>
            <FaqEditor
              value={currentTranslation.faqs || []}
              onChange={(faqs) => updateTranslation({ faqs })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
