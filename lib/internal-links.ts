/**
 * Utility functions for managing internal links in post content
 */

/**
 * Checks if a position is inside an HTML tag or link
 */
function isInsideTag(content: string, position: number): boolean {
  const before = content.substring(0, position);
  const lastTagStart = before.lastIndexOf('<');
  const lastTagEnd = before.lastIndexOf('>');
  
  // If we're inside a tag (between < and >)
  if (lastTagStart > lastTagEnd) {
    return true;
  }
  
  // Check if we're inside a link tag
  const beforeContext = content.substring(Math.max(0, position - 1000), position);
  const openLinks = (beforeContext.match(/<a\s+[^>]*>/gi) || []).length;
  const closeLinks = (beforeContext.match(/<\/a>/gi) || []).length;
  
  return openLinks > closeLinks;
}

/**
 * Finds word boundaries around a position in HTML text
 */
function findWordBoundary(content: string, position: number): number {
  // Look for the start of the word (non-whitespace before whitespace or tag)
  let start = position;
  while (start > 0) {
    const char = content[start - 1];
    if (char === '>' || char === '<') {
      break; // Hit a tag boundary
    }
    if (/\s/.test(char)) {
      break; // Hit whitespace
    }
    start--;
  }
  return start;
}

/**
 * Inserts an internal link naturally into HTML content
 */
export function insertInternalLink(
  content: string,
  targetSlug: string,
  targetTitle: string,
  anchorText?: string
): string {
  // Check if link already exists
  const linkPattern = new RegExp(`<a[^>]+href=["']/post/${targetSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'gi');
  if (linkPattern.test(content)) {
    return content; // Link already exists
  }
  
  const linkText = anchorText || targetTitle;
  
  // Extract meaningful keywords from target title
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'game', 'app', 'download']);
  const keywords = targetTitle
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 5); // Use top 5 keywords
  
  if (keywords.length === 0) {
    // Fallback to all words if no keywords found
    keywords.push(...targetTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  }
  
  let bestPosition: number | null = null;
  let bestScore = -1;
  
  // Search for keywords in the content
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const position = match.index;
      
      // Skip if inside a tag or existing link
      if (isInsideTag(content, position)) {
        continue;
      }
      
      // Calculate score (prefer earlier positions, longer keywords)
      const score = keyword.length * 1000 - (position / content.length) * 100;
      
      if (score > bestScore) {
        bestScore = score;
        bestPosition = findWordBoundary(content, position);
      }
    }
  }
  
  // If no keyword match found, try to insert in first paragraph
  if (bestPosition === null) {
    // Find first paragraph that doesn't have a link
    const paragraphRegex = /<p[^>]*>([^<]*(?:<(?![\/]?p|a)[^>]+>[^<]*)*)<\/p>/gi;
    let match;
    
    while ((match = paragraphRegex.exec(content)) !== null) {
      const paragraphContent = match[0];
      if (!paragraphContent.includes('<a ')) {
        // Insert near the end of this paragraph (but before closing tag)
        const paragraphEnd = match.index + paragraphContent.length - 4; // Before </p>
        bestPosition = paragraphEnd;
        break;
      }
    }
    
    // Last resort: insert after first paragraph
    if (bestPosition === null) {
      const firstP = content.indexOf('</p>');
      if (firstP !== -1) {
        bestPosition = firstP + 4;
      } else {
        return content; // Can't find good position
      }
    }
  }
  
  // Create the link HTML
  const linkHtml = ` <a href="/post/${targetSlug}" title="${targetTitle}">${linkText}</a> `;
  
  // Insert the link
  return content.substring(0, bestPosition) + linkHtml + content.substring(bestPosition);
}

/**
 * Adds multiple internal links to content naturally
 */
export function addInternalLinks(
  content: string,
  links: Array<{ slug: string; title: string; anchorText?: string }>
): { updatedContent: string; linksAdded: number } {
  let updatedContent = content;
  let linksAdded = 0;
  
  // Sort links by title length (longer first) to avoid conflicts
  const sortedLinks = [...links].sort((a, b) => b.title.length - a.title.length);
  
  for (const link of sortedLinks) {
    const before = updatedContent;
    updatedContent = insertInternalLink(
      updatedContent,
      link.slug,
      link.title,
      link.anchorText
    );
    
    if (updatedContent !== before) {
      linksAdded++;
    }
  }
  
  return { updatedContent, linksAdded };
}

/**
 * Generates an updated meta description that includes reference to linked posts
 */
export function updateMetaDescription(
  currentDescription: string | null,
  linkedPosts: Array<{ title: string }>,
  postTitle: string
): string {
  if (!currentDescription) {
    currentDescription = postTitle;
  }
  
  // If description is already long enough, just return it
  if (currentDescription.length >= 150) {
    return currentDescription.substring(0, 160);
  }
  
  // Try to add a note about related posts if there's room
  if (linkedPosts.length > 0 && currentDescription.length < 120) {
    const relatedText = ` Related to ${linkedPosts.slice(0, 2).map(p => p.title).join(' and ')}.`;
    const newDescription = currentDescription + relatedText;
    return newDescription.substring(0, 160);
  }
  
  return currentDescription.substring(0, 160);
}

/**
 * Strips HTML tags to get plain text
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extracts keywords from text
 */
function extractKeywords(text: string, minLength: number = 4): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'game', 'app', 'download',
    'android', 'ios', 'mobile', 'free', 'vip', 'latest', 'version', 'apk', 'mod', 'premium'
  ]);
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= minLength && !commonWords.has(word))
    .filter((word, index, self) => self.indexOf(word) === index); // Remove duplicates
}

/**
 * Calculates similarity score between two texts based on shared keywords
 */
function calculateSimilarity(text1: string, text2: string): number {
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);
  
  if (keywords1.length === 0 || keywords2.length === 0) {
    return 0;
  }
  
  const sharedKeywords = keywords1.filter(kw => keywords2.includes(kw));
  const similarity = (sharedKeywords.length * 2) / (keywords1.length + keywords2.length);
  
  return similarity;
}

/**
 * Finds related posts for auto-linking based on content similarity
 */
export function findRelatedPosts(
  currentPostContent: string,
  currentPostTitle: string,
  currentPostId: string,
  allPosts: Array<{ id: string; title: string; slug: string; content: string; published?: boolean }>,
  maxLinks: number = 3
): Array<{ id: string; title: string; slug: string; score: number }> {
  const currentText = stripHtmlTags(currentPostContent);
  const currentFullText = `${currentPostTitle} ${currentText}`;
  
  const relatedPosts = allPosts
    .filter(post => post.id !== currentPostId && (post.published === undefined || post.published !== false))
    .map(post => {
      const postText = stripHtmlTags(post.content);
      const postFullText = `${post.title} ${postText}`;
      const score = calculateSimilarity(currentFullText, postFullText);
      
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        score
      };
    })
    .filter(post => post.score > 0.1) // Only include posts with meaningful similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, maxLinks);
  
  return relatedPosts;
}

/**
 * Extracts existing internal links from content
 */
export function extractExistingLinks(content: string): Array<{ slug: string; title: string; anchorText: string }> {
  const linkRegex = /<a[^>]+href=["']\/posts\/([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  const links: Array<{ slug: string; title: string; anchorText: string }> = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      slug: match[1],
      title: match[2], // This is the anchor text, title would need to be looked up
      anchorText: match[2]
    });
  }
  
  return links;
}

/**
 * Removes external links from HTML content, keeping only internal links
 * External links are replaced with their anchor text (plain text)
 */
export function removeExternalLinks(content: string): string {
  // Regex to match <a> tags with href attributes
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
  
  return content.replace(linkRegex, (match, href, anchorText) => {
    // Check if it's an internal link (starts with /post/)
    if (href.startsWith('/post/')) {
      return match; // Keep internal links
    }
    
    // Check if it's a relative link (no protocol)
    if (!href.match(/^https?:\/\//i) && !href.match(/^mailto:/i) && !href.match(/^tel:/i)) {
      // Relative link, might be internal, keep it
      return match;
    }
    
    // External link - replace with just the anchor text
    return anchorText || '';
  });
}

/**
 * Processes content by removing external links and adding internal links
 */
export function processContentWithInternalLinks(
  content: string,
  allPosts: Array<{ id: string; title: string; slug: string; content: string; published?: boolean }>,
  currentPostId?: string,
  currentPostTitle?: string,
  maxLinks: number = 3
): { processedContent: string; linksAdded: number } {
  // Step 1: Remove external links
  let processedContent = removeExternalLinks(content);
  
  // Step 2: Add internal links if we have post data
  if (currentPostId && currentPostTitle && allPosts.length > 0) {
    const relatedPosts = findRelatedPosts(
      processedContent,
      currentPostTitle,
      currentPostId,
      allPosts,
      maxLinks
    );
    
    if (relatedPosts.length > 0) {
      const linksData = relatedPosts.map((related) => ({
        slug: related.slug,
        title: related.title,
      }));
      
      const result = addInternalLinks(processedContent, linksData);
      processedContent = result.updatedContent;
      return { processedContent, linksAdded: result.linksAdded };
    }
  }
  
  return { processedContent, linksAdded: 0 };
}
