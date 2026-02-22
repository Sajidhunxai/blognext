"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";
import FaqEditor, { type FaqItem } from "@/components/FaqEditor";
import ScreenshotEditor from "@/components/ScreenshotEditor";
import PostTranslationsTabs from "@/components/PostTranslationsTabs";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewPostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [noIndex, setNoIndex] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [downloadLink, setDownloadLink] = useState("");
  const [developer, setDeveloper] = useState("");
  const [appSize, setAppSize] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [requirements, setRequirements] = useState("");
  const [downloads, setDownloads] = useState("");
  const [googlePlayLink, setGooglePlayLink] = useState("");
  const [rating, setRating] = useState("");
  const [ratingCount, setRatingCount] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.ok ? r.json() : [])
      .then(setCategories)
      .catch(() => {});
  }, []);

  const generateSlug = (text: string) =>
    text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug || slug === generateSlug(title)) setSlug(generateSlug(newTitle));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: slug || generateSlug(title),
          published,
          categoryId: categoryId || null,
          allowComments,
          metaTitle: metaTitle || title,
          metaDescription,
          keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
          focusKeyword: focusKeyword.trim() || null,
          noIndex,
          faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()).map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
          featuredImage,
          featuredImageAlt,
          screenshots,
          downloadLink,
          developer,
          appSize,
          appVersion,
          requirements,
          downloads,
          googlePlayLink,
          rating: rating ? parseFloat(rating) : null,
          ratingCount: parseInt(ratingCount) || 0,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create post");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">Blog CMS</Link>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <PostTranslationsTabs
              postId={null}
              isNewPost={true}
              englishData={{
                title,
                content,
                metaTitle: metaTitle || title,
                metaDescription,
                keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
                focusKeyword,
                faqs,
                developer,
                requirements,
              }}
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input id="title" type="text" value={title} onChange={handleTitleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Enter post title" />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="post-url-slug" />
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Featured Image & Screenshots</h2>
                <div className="space-y-4">
                  <ImageUpload id="featuredImage" value={featuredImage} onChange={setFeaturedImage} label="Featured Image" placeholder="https://example.com/image.jpg or upload" />
                  <div>
                    <label htmlFor="featuredImageAlt" className="block text-sm font-medium text-gray-700 mb-2">Featured Image Alt Text</label>
                    <input id="featuredImageAlt" type="text" value={featuredImageAlt} onChange={(e) => setFeaturedImageAlt(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Descriptive alt text" />
                  </div>
                  <ScreenshotEditor value={screenshots} onChange={setScreenshots} label="Screenshots" />
                </div>
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <RichTextEditor id="content" value={content} onChange={setContent} placeholder="Write your post content here..." />
              </div>
              <div>
                <label htmlFor="downloadLink" className="block text-sm font-medium text-gray-700 mb-2">Download Link (optional)</label>
                <input id="downloadLink" type="url" value={downloadLink} onChange={(e) => setDownloadLink(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="https://example.com/file.pdf" />
              </div>
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">App Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      ["developer", "Developer", developer, setDeveloper, "e.g., 666W"],
                      ["appSize", "Size", appSize, setAppSize, "e.g., 6.95 MB"],
                      ["appVersion", "Version", appVersion, setAppVersion, "e.g., V1.1.52"],
                      ["requirements", "Requirements", requirements, setRequirements, "e.g., Android 5.0 & Above"],
                      ["downloads", "Downloads", downloads, setDownloads, "e.g., 5000+"],
                      ["googlePlayLink", "Google Play Link", googlePlayLink, setGooglePlayLink, "https://play.google.com/..."],
                    ] as [string, string, string, (v: string) => void, string][]
                  ).map(([fieldId, label, val, setter, ph]) => (
                    <div key={fieldId}>
                      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                      <input id={fieldId} type={fieldId === "googlePlayLink" ? "url" : "text"} value={val} onChange={(e) => setter(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder={ph} />
                    </div>
                  ))}
                  <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">Rating (0.0 - 5.0)</label>
                    <input id="rating" type="number" min="0" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="e.g., 4.5" />
                  </div>
                  <div>
                    <label htmlFor="ratingCount" className="block text-sm font-medium text-gray-700 mb-2">Rating Count</label>
                    <input id="ratingCount" type="number" min="0" value={ratingCount} onChange={(e) => setRatingCount(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="e.g., 1250" />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                    <input id="metaTitle" type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="SEO optimized title" />
                  </div>
                  <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                    <textarea id="metaDescription" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} maxLength={160} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none" placeholder="Brief description for search engines" />
                    <p className="mt-1 text-xs text-gray-500">{metaDescription.length}/160</p>
                  </div>
                  <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma-separated)</label>
                    <input id="keywords" type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="keyword1, keyword2" />
                  </div>
                  <div>
                    <label htmlFor="focusKeyword" className="block text-sm font-medium text-gray-700 mb-2">Focus keyphrase (optional)</label>
                    <input id="focusKeyword" type="text" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="e.g. best android game 2024" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">FAQs</label>
                    <FaqEditor value={faqs} onChange={setFaqs} />
                  </div>
                  <label className="flex items-center">
                    <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">No index (hide from search engines)</span>
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900" style={{ color: "#000" }}>
                    <option value="">No Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} style={{ color: "#000" }}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Publish immediately</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Allow Comments</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">{loading ? "Creating..." : "Create Post"}</button>
                <Link href="/dashboard" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition">Cancel</Link>
              </div>
            </PostTranslationsTabs>
          </form>
        </div>
      </main>
    </div>
  );
}
