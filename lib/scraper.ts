import axios from 'axios';
import * as cheerio from 'cheerio';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/^["']|["']$/g, '');
const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^["']|["']$/g, '');
const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^["']|["']$/g, '');

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

// Helper function to create slug from title
export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Helper function to download image
export async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    return Buffer.from(response.data);
  } catch (error: any) {
    console.error(`Failed to download image ${url}:`, error.message);
    return null;
  }
}

// Helper function to upload image to Cloudinary
export async function uploadToCloudinary(
  imageBuffer: Buffer,
  filename: string
): Promise<string | null> {
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary not configured, skipping image upload');
    return null;
  }

  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'apkapp',
          resource_type: 'image',
          transformation: [
            {
              quality: 'auto:good',
              fetch_format: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result?.secure_url || null);
          }
        }
      );

      uploadStream.end(imageBuffer);
    });
  } catch (error: any) {
    console.error(`Failed to upload image to Cloudinary:`, error.message);
    return null;
  }
}

// Helper function to process and replace images in content
export async function processImages(
  html: string,
  baseUrl: string
): Promise<string> {
  const $ = cheerio.load(html);
  const images: Array<{ elem: any; src: string; index: number }> = [];

  // Collect all images first
  $('img').each((i: number, elem: any) => {
    const $img = $(elem);
    let src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src') || $img.attr('data-original');

    if (!src) return;

    // Convert relative URLs to absolute
    if (src.startsWith('//')) {
      src = 'https:' + src;
    } else if (src.startsWith('/')) {
      try {
        src = new URL(src, baseUrl).href;
      } catch (e) {
        return; // Skip invalid URLs
      }
    } else if (!src.startsWith('http')) {
      try {
        src = new URL(src, baseUrl).href;
      } catch (e) {
        return; // Skip invalid URLs
      }
    }

    images.push({ elem, src, index: i });
  });

  // Process images sequentially to avoid overwhelming the server
  for (const { elem, src, index } of images) {
    try {
      const $img = $(elem);
      console.log(`Processing image ${index + 1}/${images.length}: ${src}`);
      
      const imageBuffer = await downloadImage(src);
      if (imageBuffer) {
        const uploadedUrl = await uploadToCloudinary(
          imageBuffer,
          `content-${Date.now()}-${index}.jpg`
        );
        if (uploadedUrl) {
          $img.attr('src', uploadedUrl);
          // Remove lazy loading attributes
          $img.removeAttr('data-src');
          $img.removeAttr('data-lazy-src');
          $img.removeAttr('data-original');
          $img.removeAttr('srcset'); // Remove srcset as we have a single optimized image
          
          const alt = $img.attr('alt') || '';
          if (!alt) {
            $img.attr('alt', 'App screenshot');
          }
          
          console.log(`✓ Uploaded image ${index + 1}: ${uploadedUrl}`);
        }
      }
      
      // Add small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      console.error(`Failed to process image ${index + 1}:`, error.message);
      // Continue with next image
    }
  }

  return $.html();
}

// Extract post data from a post page
export interface ScrapedPost {
  title: string;
  slug: string; // Extract from URL
  content: string;
  featuredImage: string | null;
  metaDescription: string;
  keywords: string[];
  appVersion: string | null;
  appSize: string | null;
  requirements: string | null;
  downloads: string | null;
  developer: string | null;
  downloadLink: string | null;
}

export async function scrapePost(url: string): Promise<ScrapedPost | null> {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract slug from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1] || createSlug(url);

    // Extract title
    const title =
      $('h1').first().text().trim() ||
      $('title').text().trim().replace(/\s*-\s*.*$/, '') || // Remove site name
      $('.entry-title').text().trim() ||
      $('article h1').text().trim() ||
      'Untitled Post';

    // Extract content - try multiple approaches
    let content = '';
    
    // First, try specific content selectors
    const contentSelectors = [
      '.entry-content',
      '.post-content',
      'article .entry-content',
      'article .post-content',
      'main article',
      '.post .entry-content',
      '.article-content',
      '#content article',
      '.single-post .entry-content',
      'article',
      'main',
      '.content',
    ];

    for (const selector of contentSelectors) {
      const $content = $(selector);
      if ($content.length > 0) {
        // Clone to avoid modifying original
        const $clone = $content.clone();
        
        // Remove obvious sidebars and metadata sections from the clone
        $clone.find('aside, .sidebar, .widget, [class*="widget"], [class*="meta"]').remove();
        
        content = $clone.html() || '';
        if (content.trim().length > 200) { // Make sure we got substantial content
          break;
        }
      }
    }

    // If still no content, try description-specific selectors
    if (!content || content.trim().length < 200) {
      const descriptionSelectors = [
        'h2:contains("Description") ~ *',
        'h3:contains("Description") ~ *',
        '#description',
        '.description',
        '[id*="description"]',
        'section.description',
      ];
      
      for (const selector of descriptionSelectors) {
        try {
          const $desc = $(selector);
          if ($desc.length > 0) {
            // If it's a heading followed by content, get all siblings after it
            if (selector.includes('~')) {
              let descHtml = '';
              $desc.each((i: number, elem: any) => {
                descHtml += $(elem).prop('outerHTML') || '';
              });
              content = descHtml;
            } else {
              content = $desc.html() || '';
            }
            
            if (content.trim().length > 200) {
              break;
            }
          }
        } catch (e) {
          // Skip this selector if it fails
          continue;
        }
      }
    }
    
    // Last resort: get main or body content
    if (!content || content.trim().length < 100) {
      content = $('main').html() || $('body').html() || '';
    }

    // Remove unwanted elements more aggressively
    const $content = cheerio.load(content);
    
    // Remove scripts, styles, and navigation elements
    $content('script, style, nav, header, footer, aside, iframe, embed, object, form').remove();
    
    // Remove sidebars and widgets
    $content('.sidebar, .widget, .widget-area, [class*="sidebar"], [class*="widget"]').remove();
    
    // Remove ads and promotional content
    $content('.ads, .advertisement, .ad, .adsbygoogle, [class*="ad-"], [id*="ad-"], [class*="banner"]').remove();
    
    // Remove social sharing and related elements
    $content('.sidebar, .social-share, .sharedaddy, .share-buttons, .addtoany_share_save_container, .social-links, .share-links, [class*="share"], [class*="social"]').remove();
    
    // Remove comments section
    $content('#comments, .comments, .comment-form, .comment-respond, .comment-list, #respond, [id*="comment"], [class*="comment"]').remove();
    
    // Remove related posts
    $content('.related-posts, .related-articles, .related, [class*="related"], .more-posts, .similar-posts, [id*="related"]').remove();
    
    // Remove author box and bio
    $content('.author-box, .author-bio, .author-info, [class*="author"], .about-author').remove();
    
    // Remove navigation (previous/next post)
    $content('.post-navigation, .nav-links, .pagination, .post-nav, [class*="navigation"]').remove();
    
    // Remove app details sections (often in tables or specific divs)
    $content('.app-details, .post-meta, .entry-meta, table.app-info, .download-info, .app-info-table, .meta-info, .app-sidebar, .app-info-sidebar').remove();
    
    // Remove specific metadata blocks that are clearly not description content
    $content('div, section, aside').each((i: number, elem: any) => {
      const $elem = $content(elem);
      const text = $elem.text().toLowerCase().trim();
      const html = $elem.html() || '';
      
      // Skip if this is too large (likely contains description)
      if (html.length > 3000) return;
      
      // Check for metadata patterns
      const hasVersion = /version[:\s]*v?\d+\.\d+/i.test(text);
      const hasSize = /size[:\s]*\d+\.?\d*\s*(mb|gb|kb)/i.test(text);
      const hasRequirements = /requirement[s]?[:\s]*android/i.test(text);
      const hasReport = /report this (app|application)/i.test(text);
      const hasGetItOn = /get it on/i.test(text);
      const hasVotes = /\d+\/\d+\s*votes?/i.test(text);
      const hasUpdated = /updated[:\s]*just now/i.test(text);
      
      // Count metadata indicators
      const metadataCount = [hasVersion, hasSize, hasRequirements, hasReport, hasGetItOn, hasVotes, hasUpdated].filter(Boolean).length;
      
      // If it has 3+ metadata indicators and is small, it's likely a sidebar
      if (metadataCount >= 3 && text.length < 500) {
        $elem.remove();
      }
    });
    
    // Remove breadcrumbs
    $content('.breadcrumbs, .breadcrumb, [class*="breadcrumb"]').remove();
    
    // Remove tags and categories
    $content('.tags, .tag-links, .categories, .cat-links, .post-tags, .post-categories').remove();
    
    // Remove "Leave a Reply" and similar
    $content('h2, h3, h4, h5').each((i: number, elem: any) => {
      const $heading = $content(elem);
      const headingText = $heading.text().toLowerCase();
      
      // Remove headings and content after them for non-content sections
      if (
        headingText.includes('app detail') ||
        headingText.includes('app information') ||
        headingText.includes('app info') ||
        headingText.includes('technical detail') ||
        headingText.includes('specification') ||
        headingText.includes('related post') ||
        headingText.includes('related app') ||
        headingText.includes('similar app') ||
        headingText.includes('you may also like') ||
        headingText.includes('comment') ||
        headingText.includes('leave a reply') ||
        headingText.includes('developer') ||
        headingText.includes('about the app') ||
        headingText.includes('app specification')
      ) {
        // Get all siblings after this heading until the next heading or end
        let $next = $heading.next();
        while ($next.length > 0 && !$next.is('h1, h2, h3, h4, h5, h6')) {
          const $current = $next;
          $next = $next.next();
          $current.remove();
        }
        $heading.remove();
      }
    });
    
    // Remove tables that look like app info tables
    $content('table').each((i: number, elem: any) => {
      const $table = $content(elem);
      const tableText = $table.text().toLowerCase();
      
      if (
        (tableText.includes('version') && tableText.includes('size')) ||
        (tableText.includes('developer') && tableText.includes('requirement')) ||
        tableText.includes('app name') ||
        (tableText.includes('file size') || tableText.includes('android'))
      ) {
        $table.remove();
      }
    });
    
    // Remove download buttons and links sections at the end
    $content('.download-button, .download-link, .download-section, [class*="download-btn"]').remove();
    
    // Remove report forms and voting sections
    $content('form, .report-form, .vote-form, [class*="report"], [class*="vote"]').remove();
    
    // Remove "Get it on" sections
    $content('[class*="google-play"], [class*="play-store"], .store-badge').remove();
    
    // Remove any remaining lists that are just metadata (ul/ol with version, size, etc.)
    $content('ul, ol, dl').each((i: number, elem: any) => {
      const $list = $content(elem);
      const text = $list.text().toLowerCase();
      
      if (
        (text.includes('version') && text.includes('size')) ||
        (text.includes('requirement') && text.includes('android')) ||
        (text.includes('updated') && text.includes('just now'))
      ) {
        $list.remove();
      }
    });
    
    // Remove empty paragraphs and divs
    $content('p:empty, div:empty, span:empty').remove();
    
    content = $content.html() || '';

    // Process images in content - upload to Cloudinary
    content = await processImages(content, url);

    // Extract featured image
    let featuredImage: string | null = null;
    const featuredImageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      '.featured-image img',
      '.post-thumbnail img',
      'article img:first',
      '.entry-content img:first',
    ];

    for (const selector of featuredImageSelectors) {
      const $img = $(selector);
      if ($img.length > 0) {
        let src = $img.attr('content') || $img.attr('src') || $img.attr('data-src');
        if (src) {
          if (src.startsWith('//')) {
            src = 'https:' + src;
          } else if (src.startsWith('/')) {
            src = new URL(src, url).href;
          } else if (!src.startsWith('http')) {
            src = new URL(src, url).href;
          }

          const imageBuffer = await downloadImage(src);
          if (imageBuffer) {
            featuredImage = await uploadToCloudinary(
              imageBuffer,
              `featured-${Date.now()}.jpg`
            );
          }
          break;
        }
      }
    }

    // Extract meta description
    const metaDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Extract keywords
    const keywordsText = $('meta[name="keywords"]').attr('content') || '';
    const keywords = keywordsText
      ? keywordsText.split(',').map((k: string) => k.trim()).filter((k: string) => k)
      : [];

    // Extract app version, size, etc. from structured data and content
    let appVersion: string | null = null;
    let appSize: string | null = null;
    let requirements: string | null = null;
    let downloads: string | null = null;
    let developer: string | null = null;

    // First, try to find structured app details (tables, definition lists, etc.)
    // Look for developer
    const developerSelectors = [
      '.developer a',
      '.author a',
      'a[rel="author"]',
      '.post-author a',
      '.entry-author a',
    ];
    
    for (const selector of developerSelectors) {
      const $dev = $(selector);
      if ($dev.length > 0) {
        developer = $dev.text().trim();
        if (developer) break;
      }
    }

    // Look for app details in tables or lists
    $('table tr, dl dt, .app-info div').each((i: number, elem: any) => {
      const $elem = $(elem);
      const text = $elem.text().toLowerCase();
      const nextText = $elem.next().text().trim();

      if (text.includes('version') && !appVersion) {
        const vMatch = nextText.match(/v?(\d+\.?\d*\.?\d*\.?\d*)/i);
        if (vMatch) appVersion = 'V' + vMatch[1];
      }
      if (text.includes('size') && !appSize) {
        const sMatch = nextText.match(/(\d+\.?\d*)\s*(MB|GB|KB)/i);
        if (sMatch) appSize = `${sMatch[1]} ${sMatch[2].toUpperCase()}`;
      }
      if (text.includes('requirement') && !requirements) {
        const rMatch = nextText.match(/android\s+(\d+\.?\d*\+?)/i);
        if (rMatch) requirements = `Android ${rMatch[1]}`;
      }
      if (text.includes('download') && !downloads) {
        const dMatch = nextText.match(/(\d+[kKmM]?\+?)/);
        if (dMatch) downloads = dMatch[1];
      }
      if (text.includes('developer') && !developer) {
        developer = nextText;
      }
    });

    const fullText = (title + ' ' + content).toLowerCase();

    // Try multiple version patterns
    const versionPatterns = [
      /[vV](\d+\.?\d*\.?\d*\.?\d*)/,
      /version\s+(\d+\.?\d*\.?\d*\.?\d*)/i,
      /v\s*(\d+\.?\d*\.?\d*\.?\d*)/i,
      /(\d+\.\d+\.\d+)/,
    ];

    for (const pattern of versionPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        appVersion = match[0].replace(/version\s+/i, '').trim();
        break;
      }
    }

    // Extract size
    const sizePatterns = [
      /(\d+\.?\d*)\s*(MB|GB|KB)/i,
      /size[:\s]+(\d+\.?\d*)\s*(MB|GB|KB)/i,
    ];

    for (const pattern of sizePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        appSize = `${match[1]} ${match[2].toUpperCase()}`;
        break;
      }
    }

    // Extract Android requirements
    const androidPatterns = [
      /android\s+(\d+\.?\d*\+?)/i,
      /requires?\s+android\s+(\d+\.?\d*\+?)/i,
      /android\s+(\d+\.?\d*)\s*or\s*higher/i,
    ];

    for (const pattern of androidPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        requirements = `Android ${match[1]}`;
        break;
      }
    }

    // Extract downloads
    const downloadsPatterns = [
      /(\d+[kKmM]?)\s*(downloads?|users?)/i,
      /(\d+[kKmM]?\+)\s*(downloads?|users?)/i,
    ];

    for (const pattern of downloadsPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        downloads = match[1];
        break;
      }
    }

    // Extract download link
    let downloadLink: string | null = null;
    $('a').each((i: number, elem: any) => {
      const $a = $(elem);
      const href = $a.attr('href');
      const text = $a.text().toLowerCase();
      if (
        href &&
        (text.includes('download') ||
          text.includes('apk') ||
          href.includes('.apk') ||
          href.includes('download'))
      ) {
        downloadLink = href.startsWith('http')
          ? href
          : new URL(href, url).href;
        return false; // break
      }
    });

    return {
      title,
      slug,
      content,
      featuredImage,
      metaDescription,
      keywords,
      appVersion,
      appSize,
      requirements,
      downloads,
      developer,
      downloadLink,
    };
  } catch (error: any) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

// Get all post links from a category/page URL
export async function getPostLinks(
  baseUrl: string,
  maxPages: number = 5
): Promise<string[]> {
  const links = new Set<string>();

  try {
    // First, check if it's a single post URL or a category/page URL
    // A category URL will have /category/ or /tag/ in it
    // A single post URL won't have these patterns
    const isSinglePost = !baseUrl.includes('/category/') && 
                         !baseUrl.includes('/tag/') && 
                         !baseUrl.includes('/page/') &&
                         !baseUrl.match(/\/\d+\/$/) && // WordPress pagination
                         !baseUrl.match(/\/category\/|\/tag\//); // Not a category/tag archive

    if (isSinglePost) {
      // Single post URL, return as is (normalize by removing trailing slash)
      const normalized = baseUrl.replace(/\/$/, '');
      return [normalized];
    }

    // Fetch multiple pages
    for (let page = 1; page <= maxPages; page++) {
      let url = baseUrl;
      if (page > 1) {
        // Try different pagination patterns
        if (baseUrl.includes('?')) {
          url = `${baseUrl}&page=${page}`;
        } else if (baseUrl.endsWith('/')) {
          url = `${baseUrl}page/${page}/`;
        } else {
          url = `${baseUrl}/page/${page}/`;
        }
      }

      try {
        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const $ = cheerio.load(response.data);
        let foundLinks = 0;

        // First, try to find links in article/post containers (more reliable)
        const articleSelectors = [
          'article a',
          '.post a',
          '.entry a',
          '.post-title a',
          '.entry-title a',
          'h2 a',
          'h3 a',
          '.post-content a',
          'main article a',
        ];

        let foundInArticles = false;
        for (const selector of articleSelectors) {
          $(selector).each((i: number, elem: any) => {
            const href = $(elem).attr('href');
            if (!href) return;

            let fullUrl: string;
            try {
              if (href.startsWith('http')) {
                fullUrl = href;
              } else if (href.startsWith('/')) {
                fullUrl = new URL(href, baseUrl).href;
              } else {
                fullUrl = new URL(href, baseUrl).href;
              }

              // Normalize URL (remove trailing slash for comparison)
              const normalizedUrl = fullUrl.replace(/\/$/, '');
              const normalizedBase = baseUrl.replace(/\/$/, '');

              // Filter for post URLs (not homepage, categories, etc.)
              if (
                new URL(fullUrl).hostname === new URL(baseUrl).hostname &&
                !fullUrl.includes('#') &&
                !fullUrl.includes('?page=') &&
                normalizedUrl !== normalizedBase &&
                !fullUrl.includes('/category/') &&
                !fullUrl.includes('/tag/') &&
                !fullUrl.includes('/author/') &&
                !fullUrl.includes('/page/') &&
                !fullUrl.includes('/wp-') &&
                !fullUrl.includes('/feed') &&
                !fullUrl.includes('.xml') &&
                !fullUrl.includes('.rss') &&
                !fullUrl.includes('/search') &&
                !fullUrl.match(/\/\d{4}\/\d{2}\/$/) && // Date archives
                fullUrl.split('/').filter(Boolean).length >= 3 && // Has a slug (at least domain + slug)
                !fullUrl.match(/^https?:\/\/[^\/]+\/?$/) // Not just the domain
              ) {
                // Remove trailing slash for consistency
                const cleanUrl = fullUrl.replace(/\/$/, '');
                links.add(cleanUrl);
                foundLinks++;
                foundInArticles = true;
              }
            } catch (e) {
              // Invalid URL, skip
            }
          });

          if (foundInArticles) break;
        }

        // If no links found in articles, fall back to all links
        if (!foundInArticles) {
          $('a').each((i: number, elem: any) => {
            const href = $(elem).attr('href');
            if (!href) return;

            let fullUrl: string;
            try {
              if (href.startsWith('http')) {
                fullUrl = href;
              } else if (href.startsWith('/')) {
                fullUrl = new URL(href, baseUrl).href;
              } else {
                fullUrl = new URL(href, baseUrl).href;
              }

              // Normalize URL (remove trailing slash for comparison)
              const normalizedUrl = fullUrl.replace(/\/$/, '');
              const normalizedBase = baseUrl.replace(/\/$/, '');

              // Filter for post URLs (not homepage, categories, etc.)
              if (
                new URL(fullUrl).hostname === new URL(baseUrl).hostname &&
                !fullUrl.includes('#') &&
                !fullUrl.includes('?page=') &&
                normalizedUrl !== normalizedBase &&
                !fullUrl.includes('/category/') &&
                !fullUrl.includes('/tag/') &&
                !fullUrl.includes('/author/') &&
                !fullUrl.includes('/page/') &&
                !fullUrl.includes('/wp-') &&
                !fullUrl.includes('/feed') &&
                !fullUrl.includes('.xml') &&
                !fullUrl.includes('.rss') &&
                !fullUrl.includes('/search') &&
                !fullUrl.match(/\/\d{4}\/\d{2}\/$/) && // Date archives
                fullUrl.split('/').filter(Boolean).length >= 3 && // Has a slug
                !fullUrl.match(/^https?:\/\/[^\/]+\/?$/) // Not just the domain
              ) {
                // Remove trailing slash for consistency
                const cleanUrl = fullUrl.replace(/\/$/, '');
                links.add(cleanUrl);
                foundLinks++;
              }
            } catch (e) {
              // Invalid URL, skip
            }
          });
        }

        console.log(`Page ${page}: Found ${foundLinks} links, total unique: ${links.size}`);
        
        // If no links found on this page, stop pagination
        if (foundLinks === 0 && page > 1) {
          console.log(`No links found on page ${page}, stopping pagination`);
          break;
        }
        
        // If we found links but they're all duplicates, also check if we should continue
        if (page === 1 && foundLinks === 0) {
          console.log(`No links found on first page. URL might be a single post or structure is different.`);
        }

        // Add delay between pages
        if (page < maxPages) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        // If page doesn't exist, stop pagination
        if (error.response?.status === 404 && page > 1) {
          break;
        }
        console.error(`Error fetching page ${page}:`, error.message);
      }
    }

    return Array.from(links);
  } catch (error: any) {
    console.error('Error fetching post links:', error.message);
    return Array.from(links);
  }
}

