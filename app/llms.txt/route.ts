import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// Helper function to strip HTML tags and clean text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

export async function GET() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                    process.env.NEXTAUTH_URL || 
                    process.env.NEXT_PUBLIC_SITE_URL || 
                    'http://localhost:3000';
    
    // Get settings
    let settings;
    try {
      settings = await getSettings();
    } catch (error) {
      settings = { siteName: 'Blog CMS' };
    }

    // Fetch all published posts with content
    let posts: any[] = [];
    try {
      posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: {
          title: true,
          content: true,
          slug: true,
          metaDescription: true,
          metaTitle: true,
          createdAt: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
    }

    // Fetch all published pages with content
    let pages: any[] = [];
    try {
      pages = await prisma.page.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        select: {
          title: true,
          content: true,
          slug: true,
          metaDescription: true,
          metaTitle: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
    }

    // Fetch all categories with descriptions
    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: {
          name: true,
          slug: true,
          description: true,
        },
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

    // Generate llm.txt content with only actual content
    const sections: string[] = [];

    // Site header
    sections.push(`# ${settings.siteName || 'Blog CMS'}`);
    sections.push(`Site URL: ${siteUrl}`);
    sections.push('');

    // Categories section
    if (categories.length > 0) {
      sections.push('## Categories');
      sections.push('');
      categories.forEach((category) => {
        sections.push(`### ${category.name}`);
        sections.push(`URL: ${siteUrl}/category/${category.slug}`);
        if (category.description) {
          sections.push(`Description: ${category.description}`);
        }
        sections.push('');
      });
    }

    // Posts section
    if (posts.length > 0) {
      sections.push('## Posts');
      sections.push('');
      posts.forEach((post) => {
        sections.push(`### ${post.metaTitle || post.title}`);
        sections.push(`URL: ${siteUrl}/post/${post.slug}`);
        if (post.metaDescription) {
          sections.push(`Description: ${post.metaDescription}`);
        }
        if (post.category) {
          sections.push(`Category: ${post.category.name}`);
        }
        sections.push(`Published: ${post.createdAt.toISOString().split('T')[0]}`);
        sections.push('');
        // Add content (strip HTML)
        const cleanContent = stripHtml(post.content);
        if (cleanContent) {
          sections.push(cleanContent);
          sections.push('');
        }
        sections.push('---');
        sections.push('');
      });
    }

    // Pages section
    if (pages.length > 0) {
      sections.push('## Pages');
      sections.push('');
      pages.forEach((page) => {
        sections.push(`### ${page.metaTitle || page.title}`);
        sections.push(`URL: ${siteUrl}/pages/${page.slug}`);
        if (page.metaDescription) {
          sections.push(`Description: ${page.metaDescription}`);
        }
        sections.push(`Published: ${page.createdAt.toISOString().split('T')[0]}`);
        sections.push('');
        // Add content (strip HTML)
        const cleanContent = stripHtml(page.content);
        if (cleanContent) {
          sections.push(cleanContent);
          sections.push('');
        }
        sections.push('---');
        sections.push('');
      });
    }

    // Footer
    sections.push(`Generated: ${new Date().toISOString()}`);

    const llmContent = sections.join('\n');

    return new NextResponse(llmContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating llm.txt:', error);
    return new NextResponse('Error generating llm.txt', { status: 500 });
  }
}

