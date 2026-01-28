"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Loader2, Eye, Edit } from "lucide-react";

interface PostActionsProps {
  postId: string;
  postSlug: string;
}

export default function PostActions({ postId, postSlug }: PostActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete post");
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to delete post");
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href={`/dashboard/posts/${postId}/edit`}
        className="text-blue-600 hover:text-blue-900 transition flex items-center gap-1 text-sm"
        title="Edit post"
      >
        <Edit className="w-4 h-4" />
        <span className="hidden sm:inline">Edit</span>
      </Link>
      <Link
        href={`/posts/${postSlug}`}
        className="text-gray-600 hover:text-gray-900 transition flex items-center gap-1 text-sm"
        target="_blank"
        title="View post"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">View</span>
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 text-sm"
        title="Delete post"
      >
        {deleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">Deleting...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </>
        )}
      </button>
    </div>
  );
}
