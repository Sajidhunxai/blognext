"use client";

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

interface PostLink {
  slug: string;
  anchorText: string;
  post: {
    id: string;
    title: string;
    slug: string;
    published: boolean;
  } | null;
}

interface PostWithLinks extends Post {
  links?: PostLink[];
}

export default function InternalLinksPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithLinks[]>([]);
  const [autoLinking, setAutoLinking] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "with-links" | "without-links">("all");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setFetching(true);
      setError("");
      const response = await fetch("/api/posts/with-links");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch posts");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch posts");
    } finally {
      setFetching(false);
    }
  };

  const handleAutoLink = async (postId?: string) => {
    setError("");
    setSuccess("");
    setAutoLinking(true);

    try {
      const response = await fetch("/api/posts/auto-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: postId || undefined,
          maxLinksPerPost: 3,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to auto-link posts");
      }

      const data = await response.json();
      setSuccess(
        data.message ||
          `Successfully auto-linked ${data.results?.length || 0} post(s)`
      );

      setTimeout(() => {
        fetchPosts();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to auto-link posts");
    } finally {
      setAutoLinking(false);
    }
  };

  const togglePostExpanded = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // Show loading state until client-side mount completes
  // This ensures server and initial client render match exactly
  if (!isClient) {
    return (
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>
              Internal Links
            </h1>
            <p className="text-gray-600" suppressHydrationWarning>
              View and manage internal links in your posts. Use auto-link to
              automatically add links based on content similarity.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  // Calculate these only after client-side mount to prevent hydration issues
  const totalLinks = posts.reduce((sum, post) => sum + (post.links?.length || 0), 0);
  const postsWithLinks = posts.filter((post) => (post.links?.length || 0) > 0);
  const postsWithoutLinks = posts.filter((post) => (post.links?.length || 0) === 0);

  const filteredPosts = filter === "with-links" 
    ? postsWithLinks 
    : filter === "without-links"
    ? postsWithoutLinks
    : posts;

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" suppressHydrationWarning>
              Internal Links
            </h1>
            <p className="text-gray-600" suppressHydrationWarning>
              View and manage internal links in your posts. Use auto-link to
              automatically add links based on content similarity.
            </p>
          </div>
          <button
            onClick={() => handleAutoLink()}
            disabled={autoLinking || fetching}
            className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {autoLinking ? "Auto-Linking..." : "Auto-Link All Posts"}
          </button>
        </div>
      </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500 mb-1">Total Posts</div>
            <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500 mb-1">Posts with Links</div>
            <div className="text-2xl font-bold text-green-600">
              {postsWithLinks.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500 mb-1">Total Links</div>
            <div className="text-2xl font-bold text-blue-600">{totalLinks}</div>
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-button text-button"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setFilter("with-links")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "with-links"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            With Links ({postsWithLinks.length})
          </button>
          <button
            onClick={() => setFilter("without-links")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === "without-links"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Without Links ({postsWithoutLinks.length})
          </button>
        </div>

        {fetching ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            Loading posts and links...
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" style={{ minWidth: '800px' }}>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Post Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Links
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Linked Posts
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No posts found
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.flatMap((post) => {
                      const hasLinks = (post.links?.length || 0) > 0;
                      const linksCount = post.links?.length || 0;
                      const isExpanded = expandedPostId === post.id;
                      
                      const mainRow = (
                        <tr key={post.id} className={`hover:bg-gray-50 transition ${hasLinks ? 'bg-green-50/30' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasLinks ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                ✓ Has Links
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                ✗ No Links
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {post.title}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              /post/{post.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${hasLinks ? 'text-green-600' : 'text-gray-400'}`}>
                                {linksCount}
                              </span>
                              <span className="text-sm text-gray-500">
                                {linksCount === 1 ? 'link' : 'links'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {hasLinks && post.links ? (
                              <div className="flex flex-wrap gap-2">
                                {post.links.slice(0, 3).map((link, index) => (
                                  <Link
                                    key={index}
                                    href={`/post/${link.post?.slug || link.slug}`}
                                    target="_blank"
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                                    title={link.post?.title || link.slug}
                                  >
                                    {link.post?.title?.substring(0, 30) || link.slug.substring(0, 20)}
                                    {link.post?.title && link.post.title.length > 30 ? '...' : ''}
                                  </Link>
                                ))}
                                {post.links.length > 3 && (
                                  <button
                                    onClick={() => togglePostExpanded(post.id)}
                                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                                  >
                                    +{post.links.length - 3} more
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-3">
                              {!hasLinks && (
                                <button
                                  onClick={() => handleAutoLink(post.id)}
                                  disabled={autoLinking}
                                  className="text-blue-600 hover:text-blue-900 font-medium disabled:opacity-50"
                                >
                                  Auto-Link
                                </button>
                              )}
                              {hasLinks && (
                                <button
                                  onClick={() => togglePostExpanded(post.id)}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  {isExpanded ? "Hide" : "View Links"}
                                </button>
                              )}
                              <Link
                                href={`/post/${post.slug}`}
                                target="_blank"
                                className="text-gray-600 hover:text-gray-900"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );

                      const expandedRow = isExpanded && hasLinks && post.links ? (
                        <tr key={`${post.id}-expanded`} className="bg-gray-50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                                All Links in &quot;{post.title}&quot;
                              </h4>
                              <div className="space-y-2">
                                {post.links.map((link, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 text-sm bg-white p-3 rounded border border-gray-200"
                                  >
                                    <span className="text-gray-400 font-mono">#{index + 1}</span>
                                    <span className="text-gray-600">Anchor:</span>
                                    <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                                      &quot;{link.anchorText}&quot;
                                    </code>
                                    <span className="text-gray-400">→</span>
                                    <Link
                                      href={`/post/${link.post?.slug || link.slug}`}
                                      target="_blank"
                                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                    >
                                      {link.post?.title || link.slug}
                                    </Link>
                                    <span className="text-xs text-gray-400">
                                      ({link.slug})
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <button
                                onClick={() => handleAutoLink(post.id)}
                                disabled={autoLinking}
                                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                              >
                                Re-auto-link this post
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : null;

                      return expandedRow ? [mainRow, expandedRow] : [mainRow];
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            About Auto-Linking:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Posts with <span className="font-semibold">green status</span> have internal links
            </li>
            <li>
              Posts with <span className="font-semibold">red status</span> don't have links yet
            </li>
            <li>
              Auto-linking finds related posts based on content similarity
            </li>
            <li>
              Links are automatically inserted at natural positions in your
              content
            </li>
            <li>
              Links appear in your post content and are visible on the frontend
            </li>
          </ul>
        </div>
      </>
    );
}
