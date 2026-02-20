"use client";

import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ScreenshotEditorProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}

const VIEWPORTS = [
  { label: "Mobile", width: 375, height: 667 },
  { label: "Tablet", width: 768, height: 1024 },
  { label: "Desktop", width: 1280, height: 720 },
];

export default function ScreenshotEditor({
  value,
  onChange,
  label = "Screenshots (under featured image)",
}: ScreenshotEditorProps) {
  const { colors } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [captureUrl, setCaptureUrl] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [captureError, setCaptureError] = useState("");
  const [manualError, setManualError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const screenshots = Array.isArray(value) ? value : [];

  const addScreenshot = (url: string) => {
    const trimmed = url.trim();
    if (trimmed && !screenshots.includes(trimmed)) {
      onChange([...screenshots, trimmed]);
    }
  };

  const removeScreenshot = (index: number) => {
    onChange(screenshots.filter((_, i) => i !== index));
  };

  const handleAddManual = () => {
    setManualError("");
    const trimmed = manualUrl.trim();
    if (!trimmed) {
      setManualError("Please enter an image URL");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setManualError("URL must start with http:// or https://");
      return;
    }
    addScreenshot(trimmed);
    setManualUrl("");
  };

  const handleCaptureFromUrl = async (e: React.MouseEvent<HTMLButtonElement>) => {
    setCaptureError("");
    const trimmed = captureUrl.trim();
    if (!trimmed) {
      setCaptureError("Please enter a page URL");
      return;
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      setCaptureError("URL must start with http:// or https://");
      return;
    }

    setCapturing(true);
    const btn = e.currentTarget as HTMLButtonElement;
    const captureCount = btn.dataset?.count === "1" ? 1 : 3;
    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, count: captureCount }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to capture screenshots");
      }

      const newUrls = data.screenshots || [];
      if (newUrls.length > 0) {
        const combined = [...screenshots];
        newUrls.forEach((u: string) => {
          if (u && !combined.includes(u)) combined.push(u);
        });
        onChange(combined);
      }
      setCaptureUrl("");
    } catch (err: any) {
      setCaptureError(err.message || "Failed to capture screenshots");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Current screenshots */}
      {screenshots.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {screenshots.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600"
            >
              <img
                src={url}
                alt={`Screenshot ${index + 1}`}
                className="w-20 h-20 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23ddd' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' text-anchor='middle' dy='.3em' font-size='12'%3EError%3C/text%3E%3C/svg%3E";
                }}
              />
              <button
                type="button"
                onClick={() => removeScreenshot(index)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                aria-label="Remove screenshot"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual URL add */}
      <div>
        <label htmlFor="manual-screenshot-url" className="block text-xs font-medium text-gray-500 mb-1">
          Add image URL
        </label>
        <div className="flex gap-2">
          <input
            id="manual-screenshot-url"
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://example.com/screenshot.jpg"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 text-sm"
            style={{ color: "#000" }}
          />
          <button
            type="button"
            onClick={handleAddManual}
            className="px-4 py-2.5 rounded-lg font-medium text-sm transition text-theme-text hover:opacity-90"
            style={{ backgroundColor: colors.button }}
          >
            Add
          </button>
        </div>
        {manualError && <p className="mt-1 text-xs" style={{ color: colors.error }}>{manualError}</p>}
      </div>

      {/* Capture from page URL */}
      <div>
        <label htmlFor="capture-screenshot-url" className="block text-xs font-medium text-gray-500 mb-1">
          Or capture screenshots from a page URL
        </label>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            id="capture-screenshot-url"
            type="url"
            value={captureUrl}
            onChange={(e) => setCaptureUrl(e.target.value)}
            placeholder="https://3rrapp.com/?dl=4y8ehj"
            className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900 text-sm"
            style={{ color: "#000" }}
            disabled={capturing}
          />
          <button
            type="button"
            data-count="1"
            onClick={handleCaptureFromUrl}
            disabled={capturing}
            className="px-4 py-2.5 rounded-lg font-medium text-sm transition text-theme-text hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.button }}
          >
            {capturing ? "Capturing…" : "Capture 1"}
          </button>
          <button
            type="button"
            data-count="3"
            onClick={handleCaptureFromUrl}
            disabled={capturing}
            className="px-4 py-2.5 rounded-lg font-medium text-sm transition text-theme-text hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
          >
            {capturing ? "…" : "Capture 3"}
          </button>
        </div>
        {captureError && <p className="mt-1 text-xs" style={{ color: colors.error }}>{captureError}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Uses Microlink API (free tier: 50/month). Add MICROLINK_API_KEY in env for higher limits.
        </p>
      </div>

      {/* Upload single image */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Or upload an image
        </label>
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadError("");
              setUploading(true);
              try {
                const formData = new FormData();
                formData.append("file", file);
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                if (!res.ok) {
                  const d = await res.json();
                  throw new Error(d.error || "Upload failed");
                }
                const d = await res.json();
                if (d.url) addScreenshot(d.url);
              } catch (err: any) {
                setUploadError(err.message || "Upload failed");
              } finally {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 rounded-lg font-medium text-sm transition text-theme-text hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: colors.button }}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        </div>
        {uploadError && <p className="mt-1 text-xs" style={{ color: colors.error }}>{uploadError}</p>}
      </div>
    </div>
  );
}
