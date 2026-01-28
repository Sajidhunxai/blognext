"use client";

import { useState } from "react";
import { Upload, Download, Loader2, CheckCircle, XCircle, FileText, FileJson, AlertCircle } from "lucide-react";

interface ImportResult {
  success: boolean;
  message: string;
  results?: {
    total: number;
    success: number;
    failed: number;
    skipped: number;
    posts: Array<{
      title: string;
      slug: string;
      status: string;
      error?: string;
    }>;
  };
}

export default function ImportExportPage() {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const [exportFormat, setExportFormat] = useState<"xml" | "json">("xml");

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError("");
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/posts/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import posts");
      }

      setImportResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while importing");
    } finally {
      setImporting(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleExport = async (format: "xml" | "json") => {
    setExporting(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/export?format=${format}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to export posts");
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `posts-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "An error occurred while exporting");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import & Export Posts</h1>
          <p className="text-gray-600 mt-1">
            Import posts from WordPress XML or export your posts
          </p>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Posts
        </h2>
        <p className="text-gray-600 mb-4">
          Upload a WordPress XML export file or JSON file to import posts into your site.
        </p>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="import-file"
              accept=".xml,.json"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
            <label
              htmlFor="import-file"
              className={`cursor-pointer flex flex-col items-center gap-4 ${
                importing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {importing ? (
                <>
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <span className="text-gray-600">Importing posts...</span>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <span className="text-blue-600 font-medium">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </div>
                  <p className="text-sm text-gray-500">XML or JSON file (WordPress export format)</p>
                </>
              )}
            </label>
          </div>

          {importResult && (
            <div className={`rounded-lg p-4 ${
              importResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}>
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${importResult.success ? "text-green-800" : "text-red-800"}`}>
                    {importResult.message}
                  </p>
                  {importResult.results && (
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <span className="font-semibold ml-2">{importResult.results.total}</span>
                        </div>
                        <div>
                          <span className="text-green-600">Imported:</span>
                          <span className="font-semibold ml-2">{importResult.results.success}</span>
                        </div>
                        <div>
                          <span className="text-yellow-600">Skipped:</span>
                          <span className="font-semibold ml-2">{importResult.results.skipped}</span>
                        </div>
                        <div>
                          <span className="text-red-600">Failed:</span>
                          <span className="font-semibold ml-2">{importResult.results.failed}</span>
                        </div>
                      </div>
                      {importResult.results.failed > 0 && (
                        <div className="mt-3 max-h-48 overflow-y-auto">
                          <p className="text-sm font-medium text-gray-700 mb-2">Failed Posts:</p>
                          <ul className="space-y-1 text-sm">
                            {importResult.results.posts
                              .filter(p => p.status === "failed")
                              .slice(0, 10)
                              .map((post, idx) => (
                                <li key={idx} className="text-red-700">
                                  {post.title} {post.error && `- ${post.error}`}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Posts
        </h2>
        <p className="text-gray-600 mb-4">
          Export all your posts in WordPress XML format or JSON format.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="export-format"
                value="xml"
                checked={exportFormat === "xml"}
                onChange={() => setExportFormat("xml")}
                className="w-4 h-4 text-blue-600"
              />
              <FileText className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">WordPress XML Format</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="export-format"
                value="json"
                checked={exportFormat === "json"}
                onChange={() => setExportFormat("json")}
                className="w-4 h-4 text-blue-600"
              />
              <FileJson className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">JSON Format</span>
            </label>
          </div>

          <button
            onClick={() => handleExport(exportFormat)}
            disabled={exporting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {exporting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Export Posts ({exportFormat.toUpperCase()})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Import & Export Information
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Import:</strong> Supports WordPress XML export files and JSON format. Posts with existing slugs will be skipped.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>Export:</strong> Export all posts in WordPress-compatible XML format or JSON format for backup or migration.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>WordPress XML:</strong> Includes all post data, metadata, categories, and custom fields in WordPress export format.
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">•</span>
            <span>
              <strong>JSON Format:</strong> Clean JSON format with all post data, useful for programmatic access or custom migrations.
            </span>
          </li>
        </ul>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
