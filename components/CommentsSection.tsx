"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const defaultColors = {
  primary: "#dc2626",
  secondary: "#16a34a",
  background: "#111827",
  text: "#ffffff",
  button: "#dc2626",
  link: "#3b82f6",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#f59e0b",
  info: "#3b82f6",
};

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

interface CommentsSectionProps {
  postId: string;
  allowComments: boolean;
  enableComments: boolean;
}

export default function CommentsSection({ postId, allowComments, enableComments }: CommentsSectionProps) {
  let colors = defaultColors;
  try {
    const theme = useTheme();
    colors = theme?.colors || defaultColors;
  } catch (error) {
    // Context not available, use defaults
    colors = defaultColors;
  }
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorWebsite, setAuthorWebsite] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (enableComments && allowComments) {
      fetchComments();
    }
  }, [postId, enableComments, allowComments]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          authorName,
          authorEmail,
          authorWebsite: authorWebsite || undefined,
          content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit comment");
      }

      setMessage({ type: "success", text: "Your comment has been submitted and is awaiting approval." });
      setAuthorName("");
      setAuthorEmail("");
      setAuthorWebsite("");
      setContent("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!enableComments || !allowComments) {
    return null;
  }

  return (
    <div className="mt-8 sm:mt-12 bg-white rounded-lg p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">LEAVE A REPLY</h2>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment *
          </label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg focus:ring-2  outline-none bg-gray-50"
            style={{ 
              color: '#000000'
            }}
            placeholder="Your comment..."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
              style={{ 
                color: '#000000'
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
              style={{ 
                color: '#000000'
              }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={authorWebsite}
            onChange={(e) => setAuthorWebsite(e.target.value)}
            className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-gray-50"
            style={{ 
              color: '#000000'
            }}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="save-info"
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="save-info" className="ml-2 text-sm text-gray-700">
            Save my name, email, and website in this browser for the next time I comment.
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-button text-button hover:bg-secondary font-medium rounded-lg transition disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Post Comment"}
        </button>
      </form>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h3>
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{comment.authorName}</h4>
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
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

