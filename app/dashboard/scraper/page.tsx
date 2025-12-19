"use client";

import { useState, useEffect } from "react";
import { Download, Link as LinkIcon, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ScrapeResult {
  title: string;
  slug: string;
  status: string;
}

interface ScrapeResponse {
  success: boolean;
  message: string;
  results: {
    total: number;
    success: number;
    failed: number;
    posts: ScrapeResult[];
  };
}

export default function ScraperPage() {
  const [url, setUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [maxPosts, setMaxPosts] = useState(50);
  const [maxPages, setMaxPages] = useState(5);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<ScrapeResponse | null>(null);
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setScraping(true);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          categoryId: categoryId || undefined,
          maxPosts,
          maxPages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scrape posts");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while scraping");
    } finally {
      setScraping(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "created":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "updated":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "failed":
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "created":
        return "Created";
      case "updated":
        return "Updated";
      case "failed":
        return "Failed";
      case "error":
        return "Error";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Scraper</h1>
          <p className="text-gray-600 mt-1">
            Scrape posts from any website URL or category page
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Website URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="https://example.com/post or https://example.com/category/page"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter a single post URL or a category/page URL to scrape multiple posts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category (Optional)
              </label>
              {loadingCategories ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  Loading categories...
                </div>
              ) : (
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Auto-detect from content</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to auto-detect category from post content
              </p>
            </div>

            <div>
              <label
                htmlFor="maxPosts"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Max Posts
              </label>
              <input
                id="maxPosts"
                type="number"
                min="1"
                max="200"
                value={maxPosts}
                onChange={(e) => setMaxPosts(parseInt(e.target.value) || 50)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="mt-2 text-sm text-gray-500">
                Maximum number of posts to scrape (1-200)
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="maxPages"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Max Pages to Check
            </label>
            <input
              id="maxPages"
              type="number"
              min="1"
              max="20"
              value={maxPages}
              onChange={(e) => setMaxPages(parseInt(e.target.value) || 5)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="mt-2 text-sm text-gray-500">
              For category pages, how many pages to check for posts (1-20)
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4">
            <button
              type="submit"
              disabled={scraping || !url}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
            >
              {scraping ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Scraping...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Start Scraping</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Scraping Results</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">
                  Success: {result.results.success}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-gray-600">
                  Failed: {result.results.failed}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-700">{result.message}</p>
            <p className="text-sm text-gray-500 mt-1">
              Total processed: {result.results.total} posts
            </p>
          </div>

          {result.results.posts.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.results.posts.map((post, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(post.status)}
                            <span className="ml-2 text-sm text-gray-600">
                              {getStatusText(post.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-900 truncate max-w-md">
                            {post.title || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {post.slug || "N/A"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Single Post:</strong> Enter a direct URL to a post/article page
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Category/Page:</strong> Enter a category or archive page URL to scrape multiple posts
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Category:</strong> Select a category or leave empty to auto-detect from content
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Images:</strong> All images will be automatically downloaded and uploaded to Cloudinary
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Metadata:</strong> App version, size, requirements, and downloads are automatically extracted
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

