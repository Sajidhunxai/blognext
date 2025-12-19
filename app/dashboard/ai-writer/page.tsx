"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Link as LinkIcon, Loader2, CheckCircle, XCircle, Copy, Eye } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AIResult {
  originalTitle: string;
  originalSlug: string;
  rewrittenContent: string;
  originalMetaDescription: string;
  featuredImage: string | null;
  appVersion: string | null;
  appSize: string | null;
  requirements: string | null;
  downloads: string | null;
  developer: string | null;
  downloadLink: string | null;
  keywords: string[];
  suggestedKeywords: string[];
}

export default function AIWriterPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [keywords, setKeywords] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tone, setTone] = useState("professional");
  const [categories, setCategories] = useState<Category[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Form fields for creating post
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [postKeywords, setPostKeywords] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setGenerating(true);

    try {
      const response = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          keywords,
          categoryId: categoryId || undefined,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      setResult(data);
      
      // Pre-fill form fields
      setTitle(data.originalTitle);
      setSlug(data.originalSlug);
      setContent(data.rewrittenContent);
      setMetaDescription(data.originalMetaDescription || data.originalTitle);
      setPostKeywords(data.suggestedKeywords.join(", "));
    } catch (err: any) {
      setError(err.message || "An error occurred while generating content");
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePost = async () => {
    if (!title || !content || !slug) {
      setError("Title, slug, and content are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          slug,
          published: true,
          categoryId: categoryId || undefined,
          metaTitle: title,
          metaDescription,
          keywords: postKeywords.split(",").map((k) => k.trim()).filter((k) => k),
          featuredImage: result?.featuredImage,
          featuredImageAlt: title,
          downloadLink: result?.downloadLink,
          appVersion: result?.appVersion,
          appSize: result?.appSize,
          requirements: result?.requirements,
          downloads: result?.downloads,
          developer: result?.developer,
          allowComments: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Redirect to posts page
      router.push("/dashboard/posts");
    } catch (err: any) {
      setError(err.message || "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Content Writer</h1>
          <p className="text-gray-600 mt-1">
            Generate unique content using AI from any post URL
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Source Post URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="https://example.com/post-url"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter the URL of the post you want to rewrite with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Target Keywords (Optional)
              </label>
              <input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="mt-2 text-sm text-gray-500">
                AI will naturally include these keywords in the rewritten content
              </p>
            </div>

            <div>
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Writing Tone
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual & Friendly</option>
                <option value="technical">Technical & Detailed</option>
                <option value="marketing">Marketing & Persuasive</option>
              </select>
            </div>
          </div>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && !result && (
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
              disabled={generating || !url}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700 font-medium">
                Content generated successfully! Review and edit before saving.
              </p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Edit Content</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  AI Generated Content
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showPreview ? "Hide" : "Show"} Preview</span>
                </button>
              </div>
              
              {showPreview ? (
                <div
                  className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg bg-gray-50 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <input
                type="text"
                value={postKeywords}
                onChange={(e) => setPostKeywords(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Generate New
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save as Post</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How It Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-semibold mr-2">1.</span>
            <span>Enter the URL of any post you want to rewrite</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">2.</span>
            <span>Add optional keywords you want to target</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">3.</span>
            <span>Choose the writing tone (professional, casual, technical, or marketing)</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">4.</span>
            <span>AI will scrape the content, rewrite it completely unique, and preserve all images</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">5.</span>
            <span>Review and edit the generated content before saving</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">6.</span>
            <span>Save as a new post with all metadata preserved</span>
          </li>
        </ul>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You need to add your OpenAI API key to <code className="bg-yellow-100 px-1 rounded">.env</code> file:
            <br />
            <code className="bg-yellow-100 px-2 py-1 rounded mt-1 inline-block">OPENAI_API_KEY=your_api_key_here</code>
          </p>
        </div>
      </div>
    </div>
  );
}

