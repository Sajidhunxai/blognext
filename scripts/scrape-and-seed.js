const axios = require('axios');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();

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
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// Helper function to download image
async function downloadImage(url) {
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
  } catch (error) {
    console.error(`Failed to download image ${url}:`, error.message);
    return null;
  }
}

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(imageBuffer, filename) {
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
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(imageBuffer);
    });
  } catch (error) {
    console.error(`Failed to upload image to Cloudinary:`, error.message);
    return null;
  }
}

// Helper function to process and replace images in content
async function processImages(html, baseUrl) {
  const $ = cheerio.load(html);
  const imagePromises = [];

  $('img').each((i, elem) => {
    const $img = $(elem);
    let src = $img.attr('src') || $img.attr('data-src');

    if (!src) return;

    // Convert relative URLs to absolute
    if (src.startsWith('//')) {
      src = 'https:' + src;
    } else if (src.startsWith('/')) {
      src = new URL(src, baseUrl).href;
    } else if (!src.startsWith('http')) {
      src = new URL(src, baseUrl).href;
    }

    imagePromises.push(
      (async () => {
        const imageBuffer = await downloadImage(src);
        if (imageBuffer) {
          const uploadedUrl = await uploadToCloudinary(imageBuffer, `image-${i}-${Date.now()}.jpg`);
          if (uploadedUrl) {
            $img.attr('src', uploadedUrl);
            const alt = $img.attr('alt') || '';
            if (!alt) {
              $img.attr('alt', 'App screenshot');
            }
          }
        }
      })()
    );
  });

  await Promise.all(imagePromises);
  return $.html();
}

// Extract post data from a post page
async function scrapePost(url) {
  try {
    console.log(`Scraping: ${url}`);
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract title
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() ||
                  $('.entry-title').text().trim() ||
                  'Untitled Post';

    // Extract content
    let content = '';
    const contentSelectors = [
      '.entry-content',
      '.post-content',
      '.content',
      'article',
      'main',
      '.post',
    ];

    for (const selector of contentSelectors) {
      const $content = $(selector);
      if ($content.length > 0) {
        content = $content.html() || '';
        break;
      }
    }

    // If no content found, try to get body content
    if (!content) {
      content = $('body').html() || '';
    }

    // Remove unwanted elements
    const $content = cheerio.load(content);
    $content('script, style, nav, header, footer, .ads, .advertisement, .sidebar').remove();
    content = $content.html();

    // Process images in content
    content = await processImages(content, url);

    // Extract featured image
    let featuredImage = null;
    const featuredImageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      '.featured-image img',
      '.post-thumbnail img',
      'article img:first',
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
            featuredImage = await uploadToCloudinary(imageBuffer, `featured-${Date.now()}.jpg`);
          }
          break;
        }
      }
    }

    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') ||
                            $('meta[property="og:description"]').attr('content') ||
                            '';

    // Extract keywords
    const keywordsText = $('meta[name="keywords"]').attr('content') || '';
    const keywords = keywordsText ? keywordsText.split(',').map(k => k.trim()).filter(k => k) : [];

    // Extract app version, size, etc. from content and title
    let appVersion = null;
    let appSize = null;
    let requirements = null;
    let downloads = null;
    let developer = null;

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
    let downloadLink = null;
    $('a').each((i, elem) => {
      const $a = $(elem);
      const href = $a.attr('href');
      const text = $a.text().toLowerCase();
      if (href && (text.includes('download') || text.includes('apk') || href.includes('.apk'))) {
        downloadLink = href.startsWith('http') ? href : new URL(href, url).href;
        return false; // break
      }
    });

    return {
      title,
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
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

// Get all post links from the homepage and pagination
async function getPostLinks(baseUrl = 'https://apkfielder.com/', maxPages = 5) {
  const links = new Set();

  try {
    // Fetch multiple pages
    for (let page = 1; page <= maxPages; page++) {
      let url = baseUrl;
      if (page > 1) {
        url = `${baseUrl}page/${page}/`;
      }

      try {
        console.log(`Fetching post links from page ${page}: ${url}`);
        const response = await axios.get(url, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const $ = cheerio.load(response.data);
        let foundLinks = 0;

        // Find post links - look for article links, post titles, etc.
        $('a').each((i, elem) => {
          const href = $(elem).attr('href');
          if (!href) return;

          let fullUrl;
          if (href.startsWith('http')) {
            fullUrl = href;
          } else if (href.startsWith('/')) {
            fullUrl = new URL(href, baseUrl).href;
          } else {
            fullUrl = new URL(href, baseUrl).href;
          }

          // Filter for post URLs (not homepage, categories, etc.)
          if (
            fullUrl.includes('apkfielder.com') &&
            !fullUrl.includes('#') &&
            !fullUrl.includes('?page=') &&
            !fullUrl.endsWith('/') &&
            fullUrl !== baseUrl &&
            !fullUrl.includes('/category/') &&
            !fullUrl.includes('/tag/') &&
            !fullUrl.includes('/author/') &&
            !fullUrl.includes('/page/') &&
            !fullUrl.includes('/wp-') &&
            !fullUrl.includes('/feed') &&
            !fullUrl.includes('.xml') &&
            !fullUrl.includes('.rss') &&
            fullUrl.split('/').length >= 4 // Has a slug
          ) {
            links.add(fullUrl);
            foundLinks++;
          }
        });

        console.log(`Found ${foundLinks} links on page ${page}`);

        // If no links found on this page, stop pagination
        if (foundLinks === 0 && page > 1) {
          break;
        }

        // Add delay between pages
        if (page < maxPages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);
        // Continue to next page even if this one fails
      }
    }

    return Array.from(links);
  } catch (error) {
    console.error('Error fetching post links:', error.message);
    return Array.from(links);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting scrape and seed process...');

  // Step 1: Remove old seed data
  console.log('🗑️  Removing old seed data...');
  try {
    // Delete all posts
    const deletedPosts = await prisma.post.deleteMany({});
    console.log(`✅ Deleted ${deletedPosts.count} old posts`);

    // Delete all comments
    const deletedComments = await prisma.comment.deleteMany({});
    console.log(`✅ Deleted ${deletedComments.count} old comments`);

    // Delete all users except admin
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@example.com',
        },
      },
    });
    console.log(`✅ Deleted ${deletedUsers.count} old users`);
  } catch (error) {
    console.error('Error removing old data:', error.message);
  }

  // Step 2: Get or create admin user
  console.log('👤 Setting up admin user...');
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('✅ Admin user ready');

  // Step 3: Create or get categories
  console.log('📁 Setting up categories...');
  const categories = {
    'Injectors': await prisma.category.upsert({
      where: { slug: 'injectors' },
      update: {},
      create: {
        name: 'Injectors',
        slug: 'injectors',
        description: 'Latest injectors and tools for gaming',
        featured: true,
      },
    }),
    'Apps': await prisma.category.upsert({
      where: { slug: 'apps' },
      update: {},
      create: {
        name: 'Apps',
        slug: 'apps',
        description: 'Latest apps and games',
        featured: true,
      },
    }),
    'Casino Games': await prisma.category.upsert({
      where: { slug: 'casino-games' },
      update: {},
      create: {
        name: 'Casino Games',
        slug: 'casino-games',
        description: 'Casino games and earning apps',
        featured: true,
      },
    }),
    'Social Apps': await prisma.category.upsert({
      where: { slug: 'social-apps' },
      update: {},
      create: {
        name: 'Social Apps',
        slug: 'social-apps',
        description: 'Social media and communication apps',
      },
    }),
  };
  console.log('✅ Categories ready');

  // Step 4: Get post links
  console.log('🔗 Fetching post links...');
  const postLinks = await getPostLinks('https://apkfielder.com/');
  console.log(`✅ Found ${postLinks.length} post links`);

  // Limit to first 100 posts to avoid overwhelming (adjust as needed)
  const linksToProcess = postLinks.slice(0, 100);
  console.log(`📝 Processing ${linksToProcess.length} posts...`);

  // Step 5: Scrape and create posts
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < linksToProcess.length; i++) {
    const link = linksToProcess[i];
    console.log(`\n[${i + 1}/${linksToProcess.length}] Processing: ${link}`);

    const postData = await scrapePost(link);

    if (!postData || !postData.title) {
      console.log('❌ Failed to scrape post');
      failCount++;
      continue;
    }

    // Determine category based on title/content
    let category = categories['Apps'];
    const titleLower = postData.title.toLowerCase();
    const contentLower = postData.content.toLowerCase();

    if (titleLower.includes('injector') || contentLower.includes('injector')) {
      category = categories['Injectors'];
    } else if (titleLower.includes('casino') || titleLower.includes('game') || contentLower.includes('casino')) {
      category = categories['Casino Games'];
    } else if (titleLower.includes('social') || contentLower.includes('social')) {
      category = categories['Social Apps'];
    }

    // Create slug
    const slug = createSlug(postData.title);

    try {
      // Check if post already exists
      const existingPost = await prisma.post.findUnique({
        where: { slug },
      });

      const postPayload = {
        title: postData.title,
        content: postData.content,
        slug,
        published: true,
        authorId: admin.id,
        categoryId: category.id,
        allowComments: true,
        metaTitle: postData.title,
        metaDescription: postData.metaDescription || postData.title,
        keywords: postData.keywords.length > 0 ? postData.keywords : [postData.title.split(' ')[0]],
        featuredImage: postData.featuredImage,
        featuredImageAlt: postData.title,
        downloadLink: postData.downloadLink,
        appVersion: postData.appVersion,
        appSize: postData.appSize,
        requirements: postData.requirements,
        downloads: postData.downloads,
        developer: postData.developer,
      };

      if (existingPost) {
        await prisma.post.update({
          where: { slug },
          data: postPayload,
        });
        console.log(`✅ Updated post: ${postData.title}`);
      } else {
        await prisma.post.create({
          data: postPayload,
        });
        console.log(`✅ Created post: ${postData.title}`);
      }

      successCount++;
    } catch (error) {
      console.error(`❌ Error creating post:`, error.message);
      failCount++;
    }

    // Add delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 Scrape and seed completed!');
  console.log(`✅ Successfully processed: ${successCount} posts`);
  console.log(`❌ Failed: ${failCount} posts`);
}

main()
  .catch((error) => {
    console.error('❌ Scrape and seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

