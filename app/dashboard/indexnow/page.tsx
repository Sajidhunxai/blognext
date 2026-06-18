"use client";

import { useEffect, useState } from "react";
import {
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Globe,
} from "lucide-react";

interface IndexNowStatus {
  configured: boolean;
  host?: string;
  keyLocation?: string;
  keyFileUrl?: string;
  message?: string;
}

interface SubmitResult {
  success?: boolean;
  submitted?: number;
  keyLocation?: string;
  error?: string;
}

export default function IndexNowPage() {
  const [status, setStatus] = useState<IndexNowStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitAll, setSubmitAll] = useState(false);
  const [customPaths, setCustomPaths] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/indexnow/submit")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setError("Failed to load IndexNow status"))
      .finally(() => setLoadingStatus(false));
  }, []);

  const handleSubmit = async (payload: Record<string, unknown>) => {
    setError("");
    setResult(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/indexnow/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
      setSubmitAll(false);
    }
  };

  const handleSubmitAll = () => {
    setSubmitAll(true);
    handleSubmit({ allPublished: true });
  };

  const handleSubmitCustom = () => {
    const lines = customPaths
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      setError("Enter at least one URL or path");
      return;
    }

    const paths: string[] = [];
    const urls: string[] = [];

    for (const line of lines) {
      if (line.startsWith("http://") || line.startsWith("https://")) {
        urls.push(line);
      } else {
        paths.push(line.startsWith("/") ? line : `/${line}`);
      }
    }

    handleSubmit({ paths, urls });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Send className="w-7 h-7 text-blue-600" />
          IndexNow — Bing & Yandex
        </h1>
        <p className="text-gray-600 mt-1">
          Notify search engines instantly when pages are added or updated.
        </p>
      </div>

      {/* Status card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-500" />
          Configuration
        </h2>

        {loadingStatus ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking…
          </div>
        ) : status?.configured ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">IndexNow is configured</span>
            </div>
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-gray-500">Host</dt>
                <dd className="font-mono text-gray-900">{status.host}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Key file (must be publicly accessible)</dt>
                <dd>
                  <a
                    href={status.keyFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-600 hover:underline inline-flex items-center gap-1 break-all"
                  >
                    {status.keyFileUrl}
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                </dd>
              </div>
            </dl>
            <p className="text-xs text-gray-500">
              New and updated posts are submitted automatically. Use the options below for manual bulk submit.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Not configured</p>
              <p className="text-sm mt-1">
                Set <code className="bg-amber-100 px-1 rounded">INDEXNOW_KEY</code> in Vercel environment variables and redeploy.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit all */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Submit all published posts</h2>
        <p className="text-sm text-gray-600 mb-4">
          Sends every published post URL plus the homepage and sitemap to IndexNow. Use after bulk imports or when re-indexing the whole site.
        </p>
        <button
          type="button"
          onClick={handleSubmitAll}
          disabled={submitting || !status?.configured}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitAll && submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit all published URLs
            </>
          )}
        </button>
      </div>

      {/* Custom URLs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Submit specific URLs</h2>
        <p className="text-sm text-gray-600 mb-3">
          One per line. Use paths like <code className="bg-gray-100 px-1 rounded">/post/my-app</code> or full URLs.
        </p>
        <textarea
          value={customPaths}
          onChange={(e) => setCustomPaths(e.target.value)}
          placeholder={"/post/evo-injector\n/category/apps\nhttps://www.appmarka.com/"}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={!status?.configured}
        />
        <button
          type="button"
          onClick={handleSubmitCustom}
          disabled={submitting || !status?.configured}
          className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting && !submitAll ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit these URLs
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result?.success && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              Successfully submitted {result.submitted} URL{result.submitted !== 1 ? "s" : ""} to IndexNow
            </p>
            <p className="text-sm mt-1 text-green-700">
              Check{" "}
              <a
                href="https://www.bing.com/webmasters"
                target="_blank"
                rel="noopener noreferrer"
                className="underline inline-flex items-center gap-1"
              >
                Bing Webmaster Tools
                <ExternalLink className="w-3 h-3" />
              </a>{" "}
              to verify URLs were received.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
