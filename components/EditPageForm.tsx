"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";

interface Page {
  id: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
}

interface Translation {
  locale: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  featuredImageAlt: string;
}

const LOCALES = [
  { code: "ur", label: "اردو (Urdu)", dir: "rtl" },
  { code: "hi", label: "हिन्दी (Hindi)", dir: "ltr" },
];

const emptyTranslation = (): Translation => ({
  locale: "",
  title: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  featuredImageAlt: "",
});

export default function EditPageForm({ page }: { page: Page }) {
  const router = useRouter();

  // English fields
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [slug, setSlug] = useState(page.slug);
  const [published, setPublished] = useState(page.published);
  const [metaTitle, setMetaTitle] = useState(page.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || "");
  const [featuredImage, setFeaturedImage] = useState(page.featuredImage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(page.featuredImageAlt || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Translation state: { ur: Translation, hi: Translation }
  const [translations, setTranslations] = useState<Record<string, Translation>>(
    Object.fromEntries(LOCALES.map((l) => [l.code, emptyTranslation()]))
  );
  const [activeTab, setActiveTab] = useState<"en" | "ur" | "hi">("en");
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationSaving, setTranslationSaving] = useState<string | null>(null);
  const [translationSuccess, setTranslationSuccess] = useState<string | null>(null);

  // Load existing translations
  useEffect(() => {
    setTranslationLoading(true);
    fetch(`/api/pages/${page.id}/translations`)
      .then((r) => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const map: Record<string, Translation> = Object.fromEntries(
            LOCALES.map((l) => [l.code, emptyTranslation()])
          );
          data.forEach((t) => {
            if (map[t.locale] !== undefined) {
              map[t.locale] = {
                locale: t.locale,
                title: t.title || "",
                content: t.content || "",
                metaTitle: t.metaTitle || "",
                metaDescription: t.metaDescription || "",
                featuredImageAlt: t.featuredImageAlt || "",
              };
            }
          });
          setTranslations(map);
        }
      })
      .catch(() => {})
      .finally(() => setTranslationLoading(false));
  }, [page.id]);

  const updateTranslation = (locale: string, field: keyof Translation, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug,
          published,
          metaTitle: metaTitle || title,
          metaDescription,
          featuredImage,
          featuredImageAlt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update page");
      }

      router.push("/dashboard/pages");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSaveTranslation = async (locale: string) => {
    const t = translations[locale];
    if (!t.title || !t.content) {
      setError(`Title and content are required for ${locale} translation`);
      return;
    }

    setTranslationSaving(locale);
    setError("");
    try {
      const res = await fetch(`/api/pages/${page.id}/translations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...t, locale }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save translation");
      }

      setTranslationSuccess(locale);
      setTimeout(() => setTranslationSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTranslationSaving(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const response = await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete page");
      router.push("/dashboard/pages");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const tabClass = (tab: string) =>
    `px-5 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
      activeTab === tab
        ? "border-blue-600 text-blue-600 bg-white"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
              Blog CMS
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Tab Bar */}
          <div className="flex gap-1 px-6 pt-6 border-b border-gray-200">
            <button className={tabClass("en")} onClick={() => setActiveTab("en")}>
              🇬🇧 English
            </button>
            {LOCALES.map((l) => (
              <button key={l.code} className={tabClass(l.code)} onClick={() => setActiveTab(l.code as any)}>
                {l.code === "ur" ? "🇵🇰" : "🇮🇳"} {l.label}
                {translations[l.code]?.title && (
                  <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-green-500" title="Has translation" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* ── English Tab ── */}
            {activeTab === "en" && (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Page</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <RichTextEditor
                      id="content"
                      value={content}
                      onChange={setContent}
                      placeholder="Write your page content here..."
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Image</h2>
                    <div className="space-y-4">
                      <ImageUpload
                        label="Featured Image URL"
                        value={featuredImage}
                        onChange={setFeaturedImage}
                        placeholder="https://example.com/image.jpg"
                      />
                      <div>
                        <label htmlFor="featuredImageAlt" className="block text-sm font-medium text-gray-700 mb-2">
                          Featured Image Alt Text
                        </label>
                        <input
                          id="featuredImageAlt"
                          type="text"
                          value={featuredImageAlt}
                          onChange={(e) => setFeaturedImageAlt(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          placeholder="Description of the image for accessibility"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Title
                        </label>
                        <input
                          id="metaTitle"
                          type="text"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          placeholder="SEO optimized title (defaults to page title)"
                        />
                      </div>
                      <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          id="metaDescription"
                          value={metaDescription}
                          onChange={(e) => setMetaDescription(e.target.value)}
                          rows={3}
                          maxLength={160}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                          placeholder="Brief description for search engines"
                        />
                        <p className="mt-1 text-xs text-gray-500">{metaDescription.length}/160 characters</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="published"
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                      Published
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Updating..." : "Update Page"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                    <Link
                      href="/dashboard/pages"
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                      Cancel
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* ── Translation Tabs (ur / hi) ── */}
            {(activeTab === "ur" || activeTab === "hi") && (() => {
              const localeInfo = LOCALES.find((l) => l.code === activeTab)!;
              const t = translations[activeTab];

              return (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {localeInfo.label} Translation
                  </h1>
                  <p className="text-sm text-gray-500 mb-8">
                    Falls back to English if left empty.
                  </p>

                  {translationLoading ? (
                    <p className="text-gray-500">Loading translation…</p>
                  ) : (
                  <div className="space-y-6">
                  {translationSuccess === activeTab && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      Translation saved successfully!
                    </div>
                  )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          dir="auto"
                          value={t.title}
                          onChange={(e) => updateTranslation(activeTab, "title", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          placeholder={`Page title in ${localeInfo.label}`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Content <span className="text-red-500">*</span>
                        </label>
                        <RichTextEditor
                          value={t.content}
                          onChange={(val) => updateTranslation(activeTab, "content", val)}
                          placeholder={`Page content in ${localeInfo.label}`}
                        />
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Settings</h2>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Meta Title
                            </label>
                            <input
                              type="text"
                              dir="auto"
                              value={t.metaTitle}
                              onChange={(e) => updateTranslation(activeTab, "metaTitle", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                              placeholder="SEO title (defaults to translated title)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Meta Description
                            </label>
                            <textarea
                              dir="auto"
                              value={t.metaDescription}
                              onChange={(e) => updateTranslation(activeTab, "metaDescription", e.target.value)}
                              rows={3}
                              maxLength={160}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                              placeholder="Brief description for search engines"
                            />
                            <p className="mt-1 text-xs text-gray-500">{t.metaDescription.length}/160 characters</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Featured Image Alt Text
                            </label>
                            <input
                              type="text"
                              dir="auto"
                              value={t.featuredImageAlt}
                              onChange={(e) => updateTranslation(activeTab, "featuredImageAlt", e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                              placeholder="Image alt text in this language"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSaveTranslation(activeTab)}
                          disabled={translationSaving === activeTab}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {translationSaving === activeTab ? "Saving…" : "Save Translation"}
                        </button>
                        <Link
                          href="/dashboard/pages"
                          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                          Cancel
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
