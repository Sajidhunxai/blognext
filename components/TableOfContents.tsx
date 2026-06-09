"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

function extractHeadings(html: string): TocItem[] {
  if (typeof document === "undefined") return [];
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const headings = Array.from(tmp.querySelectorAll("h2, h3"));
  return headings.map((h, i) => {
    const level = parseInt(h.tagName[1]);
    const text = h.textContent?.trim() || "";
    const id =
      h.id ||
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 60) +
      `-${i}`;
    return { id, text, level };
  }).filter((h) => h.text.length > 0);
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const headings = extractHeadings(content);
    if (headings.length < 3) return; // Only show TOC for posts with enough headings
    setItems(headings);

    // Inject IDs into the real DOM headings
    const contentEl = document.querySelector(".content-area");
    if (!contentEl) return;
    const domHeadings = Array.from(contentEl.querySelectorAll("h2, h3"));
    domHeadings.forEach((h, i) => {
      const item = headings[i];
      if (item && !h.id) h.id = item.id;
    });
  }, [content]);

  // Highlight active heading on scroll
  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "0px 0px -60% 0px" }
    );
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mb-6 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
    >
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h16M4 18h10" />
        </svg>
        Table of Contents
      </p>
      <ol className="space-y-1.5 text-sm">
        {items.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: level === 3 ? "1rem" : 0 }}>
            <a
              href={`#${id}`}
              className={`block truncate transition-colors rounded px-2 py-1 ${
                active === id
                  ? "text-primary font-medium bg-primary/10"
                  : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${id}`);
                }
              }}
            >
              {level === 3 && <span className="text-gray-400 mr-1">›</span>}
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
