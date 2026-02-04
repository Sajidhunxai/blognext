"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface DownloadClientProps {
  post: any;
}

export default function DownloadClient({ post: initialPost }: DownloadClientProps) {
  const { colors } = useTheme();
  const [countdown, setCountdown] = useState(5);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (initialPost?.downloadLink && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (initialPost?.downloadLink && countdown === 0 && !redirecting) {
      handleDownload();
    }
  }, [countdown, initialPost, redirecting]);

  const handleDownload = () => {
    if (initialPost?.downloadLink) {
      setRedirecting(true);
      window.location.href = initialPost.downloadLink;
    }
  };

  if (!initialPost) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={`/post/${initialPost.slug}`}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-theme-text font-medium transition hover:opacity-90 bg-error"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </Link>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {initialPost.title}
        </h1>

        {/* Verified Badge */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-theme-text bg-success"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm text-gray-600">Verified</span>
        </div>

        {/* App Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">App Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600 font-medium">Package name:</span>
              <p className="text-gray-900 mt-1">{initialPost.title}</p>
            </div>
            {initialPost.appVersion && (
              <div>
                <span className="text-sm text-gray-600 font-medium">Version:</span>
                <p className="text-gray-900 mt-1">{initialPost.appVersion}</p>
              </div>
            )}
            {initialPost.appSize && (
              <div>
                <span className="text-sm text-gray-600 font-medium">Size:</span>
                <p className="text-gray-900 mt-1">{initialPost.appSize}</p>
              </div>
            )}
            {initialPost.requirements && (
              <div>
                <span className="text-sm text-gray-600 font-medium">Requirements:</span>
                <p className="text-gray-900 mt-1">{initialPost.requirements}</p>
              </div>
            )}
          </div>
        </div>

        {/* Download Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Download links</h2>
          
          <a
            href={initialPost.downloadLink}
            onClick={(e) => {
              e.preventDefault();
              handleDownload();
            }}
            rel="nofollow noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-button font-bold text-lg transition hover:bg-secondary disabled:opacity-50 bg-button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {redirecting ? "Redirecting..." : `Download ${initialPost.title.split(" ")[0]}`}
          </a>

          {countdown > 0 && !redirecting && (
            <p className="text-center text-sm text-gray-600 mt-2">
              Auto-redirecting in {countdown} seconds...
            </p>
          )}

          <div className="flex items-center gap-2 mt-4 justify-center">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-theme-text bg-success"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Verified Download</span>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How to install {initialPost.title} APK?
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>Tap the downloaded {initialPost.title.split(" ")[0]} APK file.</li>
            <li>Touch install.</li>
            <li>Follow the steps on the screen.</li>
          </ol>
        </div>

        {/* Manual Redirect Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            If you are not redirected automatically,{" "}
            <a
              href={initialPost.downloadLink}
              onClick={(e) => {
                e.preventDefault();
                handleDownload();
              }}
              rel="nofollow noopener noreferrer"
              className="underline font-medium text-link"
            >
              click here to download
            </a>
          </p>
        </div>
    </div>
  );
}

