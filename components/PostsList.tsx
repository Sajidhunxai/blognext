"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PostActions from "@/components/PostActions";
import PaginationWrapper from "@/components/PaginationWrapper";
import { Search, Filter, X, Loader2, Trash2, CheckSquare, Square } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  category: {
    name: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostsListProps {
  initialPosts: Post[];
  totalPosts: number;
  categories: Category[];
  currentPage: number;
  totalPages: number;
}

export default function PostsList({
  initialPosts,
  totalPosts,
  categories,
  currentPage,
  totalPages,
}: PostsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<"all" | "published" | "draft">(
    (searchParams.get("status") as "all" | "published" | "draft") || "all"
  );
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "all");

  useEffect(() => {
    // Sync posts with initial posts
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      if (categoryId !== "all") params.set("categoryId", categoryId);
      if (currentPage > 1) params.set("page", currentPage.toString());

      const queryString = params.toString();
      router.push(`/dashboard/posts${queryString ? `?${queryString}` : ""}`);
    }, 300); // 300ms debounce for search

    return () => clearTimeout(timeoutId);
  }, [search, status, categoryId]);

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map((p) => p.id)));
    }
  };

  const handleSelectPost = (postId: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;

    const count = selectedPosts.size;
    if (
      !confirm(
        `Are you sure you want to delete ${count} post${count > 1 ? "s" : ""}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch("/api/posts/bulk-delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: Array.from(selectedPosts) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete posts");
      }

      setSelectedPosts(new Set());
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete posts");
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setCategoryId("all");
  };

  const hasActiveFilters = search || status !== "all" || categoryId !== "all";

  return (
    <div className="space-y-6">
      {/* Header and New Post Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Posts</h1>
        <Link
          href="/dashboard/posts/new"
          className="bg-button text-button hover:bg-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition text-sm sm:text-base whitespace-nowrap"
        >
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "all" | "published" | "draft")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPosts.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-900 font-medium">
            {selectedPosts.size} post{selectedPosts.size > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch", maxWidth: "100%" }}>
          <table className="w-full" style={{ minWidth: "640px" }}>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center"
                    title={selectedPosts.size === posts.length ? "Deselect all" : "Select all"}
                  >
                    {selectedPosts.size === posts.length ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Category
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-sm sm:text-base">
                    No posts found.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-gray-50 transition ${
                      selectedPosts.has(post.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => handleSelectPost(post.id)}
                        className="flex items-center"
                      >
                        {selectedPosts.has(post.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      {post.category && (
                        <div className="text-xs text-gray-500 sm:hidden mt-1">
                          {post.category.name}
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                      {post.category ? (
                        <span className="text-sm text-gray-600">{post.category.name}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Uncategorized</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span
                        className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                      <PostActions postId={post.id} postSlug={post.slug} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationWrapper
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/dashboard/posts"
        />
      )}
    </div>
  );
}
