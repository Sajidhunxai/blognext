"use client";

import Pagination from "./Pagination";

interface PaginationWrapperProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export default function PaginationWrapper({
  currentPage,
  totalPages,
  baseUrl = "",
}: PaginationWrapperProps) {
  return <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={baseUrl} />;
}

