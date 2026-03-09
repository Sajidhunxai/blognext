"use client";

import { useState } from "react";
import {
  RefreshCcw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface RepoResult {
  repo: string;
  status: "success" | "error";
  message: string;
}

interface ApiResponse {
  success: boolean;
  upstream?: string;
  results: RepoResult[];
}

export default function CodeUpdatesPage() {
  const [updating, setUpdating] = useState(false);
  const [results, setResults] = useState<RepoResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upstream, setUpstream] = useState<string>("");
  const [reposText, setReposText] = useState<string>("");

  const handleUpdate = async () => {
    setUpdating(true);
    setError(null);
    setResults(null);

    try {
      const payload = {
        upstream: upstream.trim() || undefined,
        repos: reposText.trim() || undefined,
      };

      const response = await fetch("/api/admin/code-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse | { error: string } = await response.json();

      if (!response.ok) {
        const message =
          "error" in data
            ? data.error
            : "Failed to trigger code updates. Please check server logs.";
        throw new Error(message);
      }

      if ("results" in data) {
        setResults(data.results);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  const hasErrors = results?.some((r) => r.status === "error");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Code Updates (Client Repos)
          </h1>
          <p className="text-gray-600 mt-1">
            Trigger code updates for other installations that share this
            codebase.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <RefreshCcw className="w-5 h-5" />
          Update Client Code
        </h2>
        <p className="text-gray-600 mb-6">
          Configure the upstream repository and client repositories here, then
          trigger a sync. Each client repo should have a GitHub Actions
          workflow that listens for the{" "}
          <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">
            sync_from_upstream
          </code>{" "}
          event and pulls the latest changes from the upstream repository.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upstream repository (owner/repo)
            </label>
            <input
              type="text"
              value={upstream}
              onChange={(e) => setUpstream(e.target.value)}
              placeholder="e.g. you/main-blog-cms"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. If left blank, the server will fall back to{" "}
              <code className="px-1 py-0.5 bg-gray-100 rounded">
                CODE_SYNC_UPSTREAM_REPO
              </code>{" "}
              or{" "}
              <code className="px-1 py-0.5 bg-gray-100 rounded">
                GITHUB_REPOSITORY
              </code>
              .
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client repositories (one per line or comma separated)
            </label>
            <textarea
              value={reposText}
              onChange={(e) => setReposText(e.target.value)}
              placeholder={`you/client-one\nyou/client-two`}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              If left blank, the server will fall back to{" "}
              <code className="px-1 py-0.5 bg-gray-100 rounded">
                CODE_SYNC_REPOS
              </code>
              .
            </p>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          {updating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Triggering updates...</span>
            </>
          ) : (
            <>
              <RefreshCcw className="w-5 h-5" />
              <span>Update Client Repos</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {results && (
          <div
            className={`mt-6 rounded-lg p-4 ${
              hasErrors
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <div className="flex items-start gap-2 mb-3">
              {hasErrors ? (
                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              )}
              <div>
                <p
                  className={`font-medium ${
                    hasErrors ? "text-red-800" : "text-green-800"
                  }`}
                >
                  {hasErrors
                    ? "Some repositories failed to receive the update."
                    : "Update requests sent successfully to all repositories."}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Check the GitHub Actions tab for each client repo to see the
                  actual sync status.
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              {results.map((result) => (
                <li
                  key={result.repo}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="flex items-center gap-2">
                    {result.status === "success" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-mono text-gray-800">
                      {result.repo}
                    </span>
                  </div>
                  <span
                    className={`text-xs ${
                      result.status === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {result.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Configuration notes
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Set{" "}
              <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                CODE_SYNC_GITHUB_TOKEN
              </code>{" "}
              in your environment to a GitHub token with access to the client
              repos.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Set{" "}
              <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                CODE_SYNC_REPOS
              </code>{" "}
              to a JSON array or comma-separated list of{" "}
              <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                owner/repo
              </code>{" "}
              values (for example:{" "}
              <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                ["you/client-one","you/client-two"]
              </code>
              ).
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              Optionally set{" "}
              <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                CODE_SYNC_UPSTREAM_REPO
              </code>{" "}
              to the <code className="px-1 py-0.5 bg-blue-100 rounded text-xs">
                owner/repo
              </code>{" "}
              of this main codebase; each client workflow can use this value to
              pull changes.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

