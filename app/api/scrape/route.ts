import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scrapePost, getPostLinks, createSlug, ScrapedPost } from '@/lib/scraper';
import { secureResponse } from '@/lib/api-security';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return secureResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const { url, categoryId, maxPosts = 50, maxPages = 5 } = body;

    if (!url || typeof url !== 'string') {
      return secureResponse(
        { error: 'URL is required' },
        400
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return secureResponse(
        { error: 'Invalid URL format' },
        400
      );
    }

    // Get or create admin user
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (!admin) {
      // Create admin user if it doesn't exist
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
        },
      });
    }

    // Get category
    let category = null;
    if (categoryId) {
      category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
    }

    // If no category specified, use default "Apps" category
    if (!category) {
      category = await prisma.category.upsert({
        where: { slug: 'apps' },
        update: {},
        create: {
          name: 'Apps',
          slug: 'apps',
          description: 'Latest apps and games',
        },
      });
    }

    // Get post links from the URL
    console.log(`Fetching post links from: ${url}`);
    const postLinks = await getPostLinks(url, maxPages);
    console.log(`Found ${postLinks.length} post links`);
    
    if (postLinks.length === 0) {
      return secureResponse(
        {
          error: 'No posts found. Please check the URL and try again. Make sure the URL is a category page or contains post links.',
          results: {
            total: 0,
            success: 0,
            failed: 0,
            posts: [],
          },
        },
        400
      );
    }

    // Limit posts
    const linksToProcess = postLinks.slice(0, maxPosts);
    console.log(`Processing ${linksToProcess.length} posts...`);

    const results = {
      total: linksToProcess.length,
      success: 0,
      failed: 0,
      posts: [] as Array<{ title: string; slug: string; status: string }>,
    };

    // Process each post
    for (let i = 0; i < linksToProcess.length; i++) {
      const link = linksToProcess[i];
      console.log(`[${i + 1}/${linksToProcess.length}] Processing: ${link}`);

      try {
        const postData = await scrapePost(link);

        if (!postData || !postData.title) {
          results.failed++;
          results.posts.push({
            title: link,
            slug: '',
            status: 'failed',
          });
          continue;
        }

        // Determine category based on title/content if not specified
        let finalCategory = category;
        if (!categoryId) {
          const titleLower = postData.title.toLowerCase();
          const contentLower = postData.content.toLowerCase();

          if (titleLower.includes('injector') || contentLower.includes('injector')) {
            const injectorsCategory = await prisma.category.upsert({
              where: { slug: 'injectors' },
              update: {},
              create: {
                name: 'Injectors',
                slug: 'injectors',
                description: 'Latest injectors and tools for gaming',
              },
            });
            finalCategory = injectorsCategory;
          } else if (
            titleLower.includes('casino') ||
            titleLower.includes('game') ||
            contentLower.includes('casino')
          ) {
            const casinoCategory = await prisma.category.upsert({
              where: { slug: 'casino-games' },
              update: {},
              create: {
                name: 'Casino Games',
                slug: 'casino-games',
                description: 'Casino games and earning apps',
              },
            });
            finalCategory = casinoCategory;
          } else if (titleLower.includes('social') || contentLower.includes('social')) {
            const socialCategory = await prisma.category.upsert({
              where: { slug: 'social-apps' },
              update: {},
              create: {
                name: 'Social Apps',
                slug: 'social-apps',
                description: 'Social media and communication apps',
              },
            });
            finalCategory = socialCategory;
          }
        }

        // Use slug from scraped data (preserves original URL structure)
        const slug = postData.slug;

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
          categoryId: finalCategory.id,
          allowComments: true,
          metaTitle: postData.title,
          metaDescription: postData.metaDescription || postData.title,
          keywords:
            postData.keywords.length > 0
              ? postData.keywords
              : [postData.title.split(' ')[0]],
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
          results.posts.push({
            title: postData.title,
            slug,
            status: 'updated',
          });
        } else {
          await prisma.post.create({
            data: postPayload,
          });
          results.posts.push({
            title: postData.title,
            slug,
            status: 'created',
          });
        }

        results.success++;

        // Add delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Error processing post ${link}:`, error.message);
        results.failed++;
        results.posts.push({
          title: link,
          slug: '',
          status: 'error',
        });
      }
    }

    return secureResponse({
      success: true,
      message: `Scraped ${results.success} posts successfully`,
      results,
    });
  } catch (error: any) {
    console.error('Scrape error:', error);
    return secureResponse(
      {
        error: error.message || 'Failed to scrape posts',
      },
      500
    );
  }
}

