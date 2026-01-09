import Link from "next/link";
import { getSettings } from "@/lib/settings";
import FrontendLayout from "@/components/FrontendLayout";
import ColoredButton from "@/components/ColoredButton";
import NotFoundAnimation from "@/components/NotFoundAnimation";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: "404 - Page Not Found",
    description: `The page you're looking for doesn't exist on ${settings.siteName || "our website"}.`,
  };
}

export default async function NotFound() {
  const settings = await getSettings();
  const colors = {
    primary: settings.primaryColor || "#dc2626",
    secondary: settings.secondaryColor || "#16a34a",
    background: settings.backgroundColor || "#111827",
    text: settings.textColor || "#ffffff",
    button: settings.buttonColor || "#dc2626",
    link: settings.linkColor || "#3b82f6",
    error: settings.errorColor || "#dc2626",
  };

  return (
    <FrontendLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse" style={{ backgroundColor: colors.primary }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse delay-1000" style={{ backgroundColor: colors.secondary }}></div>
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* Animated 404 Number */}
          <div className="mb-6 relative">
            <NotFoundAnimation colors={colors} />
          </div>

          {/* Error Message with Fade In */}
          <div className="mb-8 animate-fade-in-up animation-delay-200">
            <h2 
              className="text-3xl dark:text-white text-theme-text sm:text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up animation-delay-400"
            >
              Page Not Found
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-2 animate-fade-in-up animation-delay-600">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-500 animate-fade-in-up animation-delay-800">
              It might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>

          {/* Action Buttons with Slide In */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-1000">
            <ColoredButton 
              href="/" 
              color="button" 
              className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-300 animate-bounce-in"
            >
              Go to Homepage
            </ColoredButton>
            <ColoredButton 
              href="/category/apps"
              color="secondary" 
              className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-300 animate-bounce-in animation-delay-200"
            >
              Browse Posts
            </ColoredButton>
          </div>

          {/* Helpful Links with Fade In */}
          <div className="mt-12 pt-8 border-t dark:border-gray-700 animate-fade-in-up animation-delay-1200">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              You might also be looking for:
            </p>
            <div className="flex flex-wrap justify-center gap-4 items-center">
              <Link 
                href="/"
                className="text-sm font-medium hover:underline transform hover:scale-110 transition-transform duration-200"
                style={{ color: colors.link }}
              >
                Home
              </Link>
              <span className="text-sm text-gray-400 dark:text-gray-600">|</span>
              <Link 
                href="/posts"
                className="text-sm font-medium hover:underline transform hover:scale-110 transition-transform duration-200"
                style={{ color: colors.link }}
              >
                All Posts
              </Link>
            </div>
          </div>

          {/* Search Suggestion with Fade In */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-fade-in-up animation-delay-1400 transform hover:scale-105 transition-transform duration-300">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Tip:</span> Try using the search function or navigate through our categories to find what you're looking for.
            </p>
          </div>
        </div>
      </div>

    </FrontendLayout>
  );
}
