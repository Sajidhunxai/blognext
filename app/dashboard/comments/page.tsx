"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  approved: boolean;
  createdAt: string;
  post: {
    title: string;
    slug: string;
  };
}

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const fetchComments = async () => {
    try {
      const url = filter === "all" 
        ? "/api/comments"
        : `/api/comments?approved=${filter === "approved"}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Comments</h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "all"
                    ? "bg-button text-button hover:bg-secondary"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "pending"
                    ? "bg-button text-button hover:bg-secondary"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === "approved"
                    ? "bg-button text-button hover:bg-secondary"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Approved
              </button>
            </div>
          </div>

          {comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No comments found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`border rounded-lg p-6 ${
                    comment.approved ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{comment.authorName}</h3>
                        {comment.authorWebsite && (
                          <a
                            href={comment.authorWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {comment.authorWebsite}
                          </a>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Link
                        href={`/post/${comment.post.slug}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        On: {comment.post.title}
                      </Link>
                    </div>
                    <div className="flex gap-2">
                      {!comment.approved && (
                        <button
                          onClick={() => handleApprove(comment.id, true)}
                          className="px-4 py-2 bg-green-600 text-theme-text rounded-lg hover:bg-green-700 transition text-sm"
                        >
                          Approve
                        </button>
                      )}
                      {comment.approved && (
                        <button
                          onClick={() => handleApprove(comment.id, false)}
                          className="px-4 py-2 bg-yellow-600 text-theme-text rounded-lg hover:bg-yellow-700 transition text-sm"
                        >
                          Unapprove
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="px-4 py-2 bg-red-600 text-theme-text rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-2">{comment.authorEmail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}

