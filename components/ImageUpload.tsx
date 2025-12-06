"use client";

import { useState, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  placeholder?: string;
  id?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label,
  placeholder = "https://example.com/image.jpg",
  id,
}: ImageUploadProps) {
  const { colors } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const inputId = id || `image-upload-${label.replace(/\s+/g, "-").toLowerCase()}`;
  
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
          style={{ color: '#000' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
        />
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
          className={`px-4 py-3 text-white rounded-lg font-medium hover:opacity-90 transition cursor-pointer ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          style={{ backgroundColor: colors.button }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </label>
      </div>
      {error && (
        <p className="mt-1 text-sm" style={{ color: colors.error }}>{error}</p>
      )}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="max-w-xs h-auto rounded-lg border border-gray-200"
            onError={() => setError("Failed to load image")}
          />
        </div>
      )}
    </div>
  );
}

