"use client";

import Link from "next/link";

interface DownloadClientProps {
  post: {
    title: string;
    slug: string;
    downloadLink: string | null;
    appVersion?: string | null;
    appSize?: string | null;
    requirements?: string | null;
  };
  backHref?: string;
}

export default function DownloadClient({ post, backHref }: DownloadClientProps) {
  if (!post?.downloadLink) {
    return null;
  }

  const appShortName = post.title.split(" ")[0];

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={backHref ?? `/post/${post.slug}`}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg font-medium transition hover:opacity-90 bg-error"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK
        </Link>

        <div className="flex justify-between align-middle items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-theme-text bg-success">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 dark:text-white">Verified</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">App Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Package name:</span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">{post.title}</p>
            </div>
            {post.appVersion && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Version:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{post.appVersion}</p>
              </div>
            )}
            {post.appSize && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Size:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{post.appSize}</p>
              </div>
            )}
            {post.requirements && (
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Requirements:</span>
                <p className="text-gray-900 dark:text-gray-100 mt-1">{post.requirements}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Download links</h2>

          <a
            href={post.downloadLink}
            rel="nofollow noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-button font-bold text-lg transition hover:bg-secondary bg-button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download {appShortName}
          </a>

          <div className="flex items-center gap-2 mt-4 justify-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-theme-text bg-success">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Verified Download</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            How to install {post.title} APK?
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
            <li>Tap the downloaded {appShortName} APK file.</li>
            <li>Touch install.</li>
            <li>Follow the steps on the screen.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
