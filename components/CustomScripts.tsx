"use client";

import { useEffect } from "react";

interface CustomScriptsProps {
  headerScript?: string | null;
  footerScript?: string | null;
  headerCSS?: string | null;
  footerCSS?: string | null;
}

type ParsedScript =
  | { type: "inline"; content: string }
  | { type: "external"; src: string };

/**
 * Parses script input into inline code and/or external script URLs.
 * Supports: <script src="..."></script>, <script>code</script>, and raw inline code.
 */
function parseScripts(script: string): ParsedScript[] {
  if (!script || typeof script !== "string") {
    return [];
  }
  const raw = script.trim();
  if (!raw) return [];

  const result: ParsedScript[] = [];

  // 1. External scripts: <script src="..."></script> or <script src='...'></script>
  const srcRegex = /<script[^>]*\ssrc\s*=\s*["']([^"']+)["'][^>]*>\s*<\/script>/gi;
  let match: RegExpExecArray | null;
  srcRegex.lastIndex = 0;
  while ((match = srcRegex.exec(raw)) !== null) {
    const src = match[1].trim();
    if (src) result.push({ type: "external", src });
  }

  // 2. Inline scripts: <script ...>content</script> (content may be empty but we only keep non-empty)
  const inlineTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  inlineTagRegex.lastIndex = 0;
  while ((match = inlineTagRegex.exec(raw)) !== null) {
    const content = match[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    if (content && !/^\s*$/.test(content)) {
      result.push({ type: "inline", content });
    }
  }

  // 3. If no script tags found, treat whole input as inline (strip HTML)
  if (result.length === 0) {
    const content = raw
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();
    if (content && !content.startsWith("<")) {
      result.push({ type: "inline", content });
    }
  }

  return result;
}

const HEADER_SCRIPT_DATA_ID = "custom-header-script";
const FOOTER_SCRIPT_DATA_ID = "custom-footer-script";

export default function CustomScripts({
  headerScript,
  footerScript,
  headerCSS,
  footerCSS,
}: CustomScriptsProps) {
  // Inject header CSS
  useEffect(() => {
    if (headerCSS) {
      const styleId = "custom-header-css";
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = headerCSS;
    }
  }, [headerCSS]);

  // Inject footer CSS
  useEffect(() => {
    if (footerCSS) {
      const styleId = "custom-footer-css";
      let styleElement = document.getElementById(styleId);
      
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = styleId;
        document.body.appendChild(styleElement);
      }
      
      styleElement.textContent = footerCSS;
    }
  }, [footerCSS]);

  // Inject header scripts (supports external src and inline code)
  useEffect(() => {
    if (!headerScript || typeof window === "undefined") return;
    try {
      const parsed = parseScripts(headerScript);
      if (parsed.length === 0) return;

      // Remove previously injected header scripts
      document.querySelectorAll(`[data-${HEADER_SCRIPT_DATA_ID}]`).forEach((el) => el.remove());

      const head = document.head;
      parsed.forEach((item, index) => {
        const el = document.createElement("script");
        el.setAttribute(`data-${HEADER_SCRIPT_DATA_ID}`, String(index));
        el.type = "text/javascript";
        if (item.type === "external") {
          el.src = item.src;
        } else {
          el.textContent = item.content;
        }
        head.appendChild(el);
      });
    } catch (error) {
      console.error("Error injecting header script:", error, {
        scriptPreview: headerScript.substring(0, 100),
      });
    }
  }, [headerScript]);

  // Inject footer scripts (supports external src and inline code)
  useEffect(() => {
    if (!footerScript || typeof window === "undefined") return;
    try {
      const parsed = parseScripts(footerScript);
      if (parsed.length === 0) return;

      // Remove previously injected footer scripts
      document.querySelectorAll(`[data-${FOOTER_SCRIPT_DATA_ID}]`).forEach((el) => el.remove());

      const body = document.body;
      parsed.forEach((item, index) => {
        const el = document.createElement("script");
        el.setAttribute(`data-${FOOTER_SCRIPT_DATA_ID}`, String(index));
        el.type = "text/javascript";
        if (item.type === "external") {
          el.src = item.src;
        } else {
          el.textContent = item.content;
        }
        body.appendChild(el);
      });
    } catch (error) {
      console.error("Error injecting footer script:", error, {
        scriptPreview: footerScript.substring(0, 100),
      });
    }
  }, [footerScript]);

  return null;
}

