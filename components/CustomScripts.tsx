"use client";

import { useEffect } from "react";

interface CustomScriptsProps {
  headerScript?: string | null;
  footerScript?: string | null;
  headerCSS?: string | null;
  footerCSS?: string | null;
}

/**
 * Extracts JavaScript code from script tags or returns the code as-is
 * Handles multiple script tags and removes any HTML
 * This function is safe to use outside of DOM context
 */
function extractScriptContent(script: string): string | null {
  if (!script || typeof script !== 'string') {
    return null;
  }
  
  let content = script.trim();
  
  if (!content) {
    return null;
  }
  
  // First, try to extract content from script tags
  const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  const scriptMatches: string[] = [];
  let match;
  
  // Reset regex lastIndex to ensure we start from the beginning
  scriptTagRegex.lastIndex = 0;
  
  while ((match = scriptTagRegex.exec(content)) !== null) {
    if (match[1]) {
      scriptMatches.push(match[1].trim());
    }
  }
  
  if (scriptMatches.length > 0) {
    // Use extracted content from script tags
    content = scriptMatches
      .filter(code => code.length > 0)
      .join("\n");
  } else {
    // If no script tags found, assume it's raw JavaScript
    // But still remove any HTML tags that might be present
    content = content.replace(/<[^>]+>/g, '').trim();
  }
  
  // Decode common HTML entities without using DOM
  content = content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
  
  // Final cleanup: remove any remaining HTML-like patterns
  content = content
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\/script>/gi, '')
    .trim();
  
  // Return null if content is empty or looks like HTML
  if (!content || content.length === 0 || content.startsWith('<')) {
    return null;
  }
  
  return content;
}

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

  // Inject header script
  useEffect(() => {
    if (headerScript && typeof window !== 'undefined') {
      try {
        const scriptContent = extractScriptContent(headerScript);
        if (scriptContent && scriptContent.length > 0) {
          const scriptId = "custom-header-script";
          
          // Remove existing script if present
          const existingScript = document.getElementById(scriptId);
          if (existingScript) {
            existingScript.remove();
          }
          
          // Create new script element
          const scriptElement = document.createElement("script");
          scriptElement.id = scriptId;
          scriptElement.type = "text/javascript";
          
          // Use textContent to safely set the script content
          // This prevents any HTML from being parsed
          scriptElement.textContent = scriptContent;
          
          // Append to head
          document.head.appendChild(scriptElement);
        }
      } catch (error) {
        console.error("Error injecting header script:", error, {
          scriptPreview: headerScript.substring(0, 100)
        });
      }
    }
  }, [headerScript]);

  // Inject footer script
  useEffect(() => {
    if (footerScript && typeof window !== 'undefined') {
      try {
        const scriptContent = extractScriptContent(footerScript);
        if (scriptContent && scriptContent.length > 0) {
          const scriptId = "custom-footer-script";
          
          // Remove existing script if present
          const existingScript = document.getElementById(scriptId);
          if (existingScript) {
            existingScript.remove();
          }
          
          // Create new script element
          const scriptElement = document.createElement("script");
          scriptElement.id = scriptId;
          scriptElement.type = "text/javascript";
          
          // Use textContent to safely set the script content
          // This prevents any HTML from being parsed
          scriptElement.textContent = scriptContent;
          
          // Append to body
          document.body.appendChild(scriptElement);
        }
      } catch (error) {
        console.error("Error injecting footer script:", error, {
          scriptPreview: footerScript.substring(0, 100)
        });
      }
    }
  }, [footerScript]);

  return null;
}

