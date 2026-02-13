"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import FaqEditor, { type FaqItem } from "./FaqEditor";

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  published: boolean;
  categoryId?: string | null;
  allowComments?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  focusKeyword?: string | null;
  noIndex?: boolean;
  faqs?: FaqItem[] | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  downloadLink?: string | null;
  developer?: string | null;
  appSize?: string | null;
  appVersion?: string | null;
  requirements?: string | null;
  downloads?: string | null;
  googlePlayLink?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function EditPostForm({ post }: { post: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [slug, setSlug] = useState(post.slug);
  const [published, setPublished] = useState(post.published);
  const [categoryId, setCategoryId] = useState(post.categoryId || "");
  const [allowComments, setAllowComments] = useState(post.allowComments !== undefined ? post.allowComments : true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metaTitle, setMetaTitle] = useState(post.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post.metaDescription || "");
  const [keywords, setKeywords] = useState(post.keywords?.join(", ") || "");
  const [focusKeyword, setFocusKeyword] = useState(post.focusKeyword || "");
  const [noIndex, setNoIndex] = useState(post.noIndex ?? false);
  const [faqs, setFaqs] = useState<FaqItem[]>(Array.isArray(post.faqs) ? post.faqs : []);
  const [featuredImage, setFeaturedImage] = useState(post.featuredImage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post.featuredImageAlt || "");
  const [downloadLink, setDownloadLink] = useState(post.downloadLink || "");
  const [developer, setDeveloper] = useState(post.developer || "");
  const [appSize, setAppSize] = useState(post.appSize || "");
  const [appVersion, setAppVersion] = useState(post.appVersion || "");
  const [requirements, setRequirements] = useState(post.requirements || "");
  const [downloads, setDownloads] = useState(post.downloads || "");
  const [googlePlayLink, setGooglePlayLink] = useState(post.googlePlayLink || "");
  const [rating, setRating] = useState(post.rating?.toString() || "");
  const [ratingCount, setRatingCount] = useState(post.ratingCount?.toString() || "0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          slug,
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
          downloadLink,
          developer,
          appSize,
          appVersion,
          requirements,
          downloads,
          googlePlayLink,
          rating: rating ? parseFloat(rating) : null,
          ratingCount: ratingCount ? parseInt(ratingCount) : 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update post");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

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
                placeholder="Write your post content here..."
              />
            </div>

            <div>
              <label htmlFor="downloadLink" className="block text-sm font-medium text-gray-700 mb-2">
                Download Link (optional)
              </label>
              <input
                id="downloadLink"
                type="url"
                value={downloadLink}
                onChange={(e) => setDownloadLink(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="https://example.com/file.pdf"
              />
              <p className="mt-1 text-xs text-gray-500">Link to downloadable file (PDF, document, etc.)</p>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">App Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="developer" className="block text-sm font-medium text-gray-700 mb-2">
                    Developer
                  </label>
                  <input
                    id="developer"
                    type="text"
                    value={developer}
                    onChange={(e) => setDeveloper(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., 666W"
                  />
                </div>

                <div>
                  <label htmlFor="appSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <input
                    id="appSize"
                    type="text"
                    value={appSize}
                    onChange={(e) => setAppSize(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., 6.95 MB"
                  />
                </div>

                <div>
                  <label htmlFor="appVersion" className="block text-sm font-medium text-gray-700 mb-2">
                    Version
                  </label>
                  <input
                    id="appVersion"
                    type="text"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., V1.1.52"
                  />
                </div>

                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <input
                    id="requirements"
                    type="text"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., Android 5.0 & Above"
                  />
                </div>

                <div>
                  <label htmlFor="downloads" className="block text-sm font-medium text-gray-700 mb-2">
                    Downloads
                  </label>
                  <input
                    id="downloads"
                    type="text"
                    value={downloads}
                    onChange={(e) => setDownloads(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., 5000+"
                  />
                </div>

                <div>
                  <label htmlFor="googlePlayLink" className="block text-sm font-medium text-gray-700 mb-2">
                    Google Play Link (optional)
                  </label>
                  <input
                    id="googlePlayLink"
                    type="url"
                    value={googlePlayLink}
                    onChange={(e) => setGooglePlayLink(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="https://play.google.com/store/apps/..."
                  />
                </div>

                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (0.0 - 5.0)
                  </label>
                  <input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., 4.5"
                  />
                  <p className="mt-1 text-xs text-gray-500">Rating from 0.0 to 5.0 (leave empty for no rating)</p>
                </div>

                <div>
                  <label htmlFor="ratingCount" className="block text-sm font-medium text-gray-700 mb-2">
                    Rating Count
                  </label>
                  <input
                    id="ratingCount"
                    type="number"
                    min="0"
                    value={ratingCount}
                    onChange={(e) => setRatingCount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g., 1250"
                  />
                  <p className="mt-1 text-xs text-gray-500">Number of reviews/ratings</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title (for SEO)
                  </label>
                  <input
                    id="metaTitle"
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="SEO optimized title (defaults to post title)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Recommended: 50-60 characters</p>
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

                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma-separated)
                  </label>
                  <input
                    id="keywords"
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <label htmlFor="focusKeyword" className="block text-sm font-medium text-gray-700 mb-2">
                    Focus keyphrase (optional)
                  </label>
                  <input
                    id="focusKeyword"
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="e.g. best android game 2024"
                  />
                  <p className="mt-1 text-xs text-gray-500">Target keyword for this post (helps SEO tools)</p>
                </div>

                <div className="flex items-center">
                  <input
                    id="noIndex"
                    type="checkbox"
                    checked={noIndex}
                    onChange={(e) => setNoIndex(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="noIndex" className="ml-2 block text-sm text-gray-700">
                    No index (hide from search engines)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FAQs</label>
                  <FaqEditor value={faqs} onChange={setFaqs} />
                </div>

                <div className="space-y-4">
                  <ImageUpload
                    id="featuredImage"
                    value={featuredImage}
                    onChange={setFeaturedImage}
                    label="Featured Image (also used for Open Graph)"
                    placeholder="https://example.com/image.jpg or upload"
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
                      placeholder="Descriptive alt text for image"
                    />
                    <p className="mt-1 text-xs text-gray-500">This image will be used for both the featured image and Open Graph (social media sharing)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category (optional)
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                  style={{ color: '#000' }}
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{ color: '#000' }}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6">
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
                <div className="flex items-center">
                  <input
                    id="allowComments"
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowComments" className="ml-2 block text-sm text-gray-700">
                    Allow Comments
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Post"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-theme-text px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
              <Link
                href="/dashboard"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

