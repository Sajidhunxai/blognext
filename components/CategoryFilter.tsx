"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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

// Dynamically import the client component to avoid SSR issues
const CategoryFilterClient = dynamic(() => import("./CategoryFilterClient"), {
  ssr: false,
});

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Only set mounted if we're in the browser
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);
  
  // Don't render until mounted on client
  if (!mounted || typeof window === 'undefined') {
    return null;
  }
  
  return <CategoryFilterClient categories={categories} />;
}

