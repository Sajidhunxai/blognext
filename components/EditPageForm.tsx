"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function EditPageForm({ page }: { page: Page }) {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this page?")) {
      return;
    }

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete page");
      }

      router.push("/dashboard/pages");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Page</h1>

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
                placeholder="Write your page content here..."
              />
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
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
                className="bg-red-600 text-theme-text px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition"
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
        </div>
      </main>
    </div>
  );
}

