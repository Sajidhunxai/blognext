"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Listen to route changes
    handleStart();

    // Complete loading after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      handleComplete();
    }, 300);

    return () => {
      clearTimeout(timer);
      handleComplete();
    };
  }, [pathname]);

  if (!loading) return null;

  return <LoadingSpinner fullScreen text="Loading..." />;
}

