"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, CheckCircle, XCircle, TrendingUp, Calendar, Link as LinkIcon, Trash2, Copy, Check } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
}

interface RankCheck {
  id: string;
  keyword: string;
  siteUrl: string;
  ranking: number | null;
  checkedAt: string;
  post: Post | null;
}

export default function RankCheckerPage() {
  const [keyword, setKeyword] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [postId, setPostId] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [rankChecks, setRankChecks] = useState<RankCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [copiedKeyword, setCopiedKeyword] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchPosts();
    fetchRankChecks();
    // Get default site URL - use window.location.hostname in browser
    if (typeof window !== 'undefined') {
      const defaultUrl = window.location.hostname;
      setSiteUrl(defaultUrl);
    }
  }, []);

  useEffect(() => {
    // Update suggestions only from post titles
    if (posts.length > 0) {
      const postTitles = posts.map(post => post.title);
      setKeywordSuggestions(postTitles);
    }
  }, [posts]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts?published=true&limit=100");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchRankChecks = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/rank-check");
      if (response.ok) {
        const data = await response.json();
        setRankChecks(data);
      }
    } catch (error) {
      console.error("Error fetching rank checks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setChecking(true);

    try {
      const response = await fetch("/api/rank-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword,
          postId: postId || undefined,
          siteUrl: siteUrl || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check ranking");
      }

      setSuccess(data.message || "Rank check completed successfully");
      setKeyword(""); // Clear keyword after successful check
      fetchRankChecks(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "An error occurred while checking ranking");
    } finally {
      setChecking(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rank check?")) {
      return;
    }

    try {
      const response = await fetch(`/api/rank-check?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete rank check");
      }

      fetchRankChecks(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Failed to delete rank check");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRankingColor = (ranking: number | null) => {
    if (ranking === null) return "text-gray-500";
    if (ranking <= 10) return "text-green-600 font-bold";
    if (ranking <= 30) return "text-yellow-600 font-semibold";
    return "text-orange-600";
  };

  const getRankingBadge = (ranking: number | null) => {
    if (ranking === null) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
          Not Found
        </span>
      );
    }
    if (ranking <= 10) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
          #{ranking}
        </span>
      );
    }
    if (ranking <= 30) {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
          #{ranking}
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
        #{ranking}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rank Checker</h1>
          <p className="text-gray-600 mt-1">
            Check your site's Google ranking for specific keywords
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="keyword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Keyword <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="keyword"
                  type="text"
                  list={isClient ? "keyword-suggestions" : undefined}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Type or select a keyword..."
                  autoComplete="off"
                  suppressHydrationWarning
                />
                {isClient && (
                  <datalist id="keyword-suggestions">
                    {keywordSuggestions.map((suggestion, index) => (
                      <option key={index} value={suggestion} />
                    ))}
                  </datalist>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    if (keyword) {
                      try {
                        await navigator.clipboard.writeText(keyword);
                        setCopiedKeyword(true);
                        setTimeout(() => setCopiedKeyword(false), 2000);
                      } catch (err) {
                        console.error("Failed to copy:", err);
                      }
                    }
                  }}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition ${
                    keyword 
                      ? "text-gray-400 hover:text-gray-600 cursor-pointer" 
                      : "text-gray-300 cursor-not-allowed pointer-events-none"
                  }`}
                  title="Copy keyword"
                  disabled={!keyword}
                >
                  {copiedKeyword ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              {isClient && keywordSuggestions.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Suggestions from post titles available as you type
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="siteUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Site URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="siteUrl"
                  type="text"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="example.com"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Leave empty to use default site URL from settings
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="postId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Related Post (Optional)
            </label>
            {loadingPosts ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                Loading posts...
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  id="postId"
                  value={postId}
                  onChange={(e) => setPostId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">No specific post</option>
                  {posts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.title}
                    </option>
                  ))}
                </select>
                {postId && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const selectedPost = posts.find(p => p.id === postId);
                        if (selectedPost) {
                          setKeyword(selectedPost.title);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition"
                    >
                      <Copy className="w-4 h-4" />
                      Use Post Title as Keyword
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const selectedPost = posts.find(p => p.id === postId);
                        if (selectedPost) {
                          try {
                            await navigator.clipboard.writeText(selectedPost.title);
                            setCopiedTitle(true);
                            setTimeout(() => setCopiedTitle(false), 2000);
                          } catch (err) {
                            console.error("Failed to copy:", err);
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition"
                    >
                      {copiedTitle ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Title
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Link this rank check to a specific post. Selecting a post will auto-fill the keyword field with the post title.
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

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4">
            <button
              type="submit"
              disabled={checking || !keyword}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2"
            >
              {checking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Check Ranking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Rank Check History</h2>
          <button
            onClick={fetchRankChecks}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading && rankChecks.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading rank checks...</p>
          </div>
        ) : rankChecks.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No rank checks yet. Start checking your keywords above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ranking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Checked At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rankChecks.map((check) => (
                  <tr key={check.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {check.keyword}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={getRankingColor(check.ranking)}>
                        {getRankingBadge(check.ranking)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {check.post ? (
                          <span className="truncate max-w-xs block" title={check.post.title}>
                            {check.post.title}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {check.siteUrl}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(check.checkedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(check.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Setup Required:</strong> You need to configure GOOGLE_API_KEY and GOOGLE_CX environment variables. 
              Get these from Google Cloud Console and create a Custom Search Engine.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Keyword:</strong> Enter the keyword you want to check ranking for
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Site URL:</strong> The domain to check (leave empty to use default from settings)
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Post:</strong> Optionally link the rank check to a specific post
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Results:</strong> The checker searches top 100 results and displays your ranking position
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

