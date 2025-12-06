"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    posts: number;
  };
}

interface CategoryFilterProps {
  categories: Category[];
}

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

export default function CategoryFilterClient({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Check if we're on a category page
  const isCategoryPage = pathname?.startsWith("/category/");
  const categorySlugFromPath = isCategoryPage ? pathname?.split("/category/")[1]?.split("/")[0] : null;
  const selectedCategoryFromQuery = searchParams?.get("category");
  
  // Use category from path if on category page, otherwise from query params
  const selectedCategory = categorySlugFromPath || selectedCategoryFromQuery;

  let colors = defaultColors;
  try {
    const theme = useTheme();
    if (theme?.colors) {
      colors = theme.colors;
    }
  } catch (error) {
    // Context not available, use defaults
  }

  const handleCategoryClick = (categorySlug: string | null) => {
    if (categorySlug) {
      // Navigate to category page
      router.push(`/category/${categorySlug}`);
    } else {
      // Navigate to homepage
      router.push("/");
    }
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="border-t-2" style={{ borderColor: colors.primary, backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium flex items-center gap-2 transition text-sm sm:text-base ${
              !selectedCategory
                ? "text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
            style={
              !selectedCategory
                ? { backgroundColor: colors.primary }
                : {}
            }
          >
            <span>▶</span> All
          </button>
          {categories.map((category) => {
            const isActive = selectedCategory === category.slug;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium flex items-center gap-2 transition text-sm sm:text-base ${
                  isActive
                    ? "text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                style={
                  isActive
                    ? { backgroundColor: colors.primary }
                    : {}
                }
              >
                <span>▶</span> {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

