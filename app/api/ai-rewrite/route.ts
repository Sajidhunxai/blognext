import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scrapePost } from '@/lib/scraper';
import { secureResponse } from '@/lib/api-security';
import { processContentWithInternalLinks } from '@/lib/internal-links';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return secureResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const { url, keywords, categoryId } = body;
    const tone = body.tone || 'professional';

    if (!url || typeof url !== 'string') {
      return secureResponse(
        { error: 'URL is required' },
        400
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return secureResponse(
        { error: 'Invalid URL format' },
        400
      );
    }

    // Check if OpenAI API key is configured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return secureResponse(
        { error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.' },
        500
      );
    }

    console.log(`Scraping content from: ${url}`);
    
    // Scrape the original content
    const scrapedData = await scrapePost(url);

    if (!scrapedData || !scrapedData.content) {
      return secureResponse(
        { error: 'Failed to scrape content from URL' },
        400
      );
    }

    console.log(`Original content scraped. Length: ${scrapedData.content.length} characters`);

    // Extract text content from HTML for AI processing
    const cheerio = require('cheerio');
    const $ = cheerio.load(scrapedData.content);
    
    // Remove images temporarily for AI processing
    $('img').remove();
    const textContent = $.text().trim();

    // Prepare the prompt for AI
    const keywordsList = keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [];
    const keywordsPrompt = keywordsList.length > 0 
      ? `\n\nIMPORTANT: Include these keywords naturally: ${keywordsList.join(', ')}`
      : '';

    const toneInstructions: { [key: string]: string } = {
      professional: 'Use a professional and informative tone.',
      casual: 'Use a casual and friendly tone.',
      technical: 'Use a technical and detailed tone.',
      marketing: 'Use an engaging and persuasive marketing tone.',
    };
    
    const toneInstruction = toneInstructions[tone] || 'Use a professional tone.';

    const prompt = `You are a content writer for an APK/App download website. 

Your task is to rewrite the following app description in a completely unique way while maintaining all important information.

Original Content:
"""
${textContent}
"""

Instructions:
1. Rewrite the content completely - do NOT copy sentences directly
2. Maintain all key features, benefits, and technical details
3. Keep the same structure (description, features, how to use, etc.)
4. ${toneInstruction}
5. Make it engaging and SEO-friendly
6. Keep HTML formatting (use <h2>, <h3>, <p>, <ul>, <li> tags)
7. Do NOT include any metadata like "Version:", "Size:", "Developer:" - just the description content${keywordsPrompt}

Output format: Return ONLY the rewritten HTML content, no explanations or metadata.`;

    console.log('Sending request to OpenAI...');

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer specializing in app descriptions. You write unique, engaging content while preserving technical accuracy.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8, // More creative
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API error:', error);
      return secureResponse(
        { error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` },
        500
      );
    }

    const openaiData = await openaiResponse.json();
    const rewrittenContent = openaiData.choices[0]?.message?.content || '';

    if (!rewrittenContent) {
      return secureResponse(
        { error: 'Failed to generate content from AI' },
        500
      );
    }

    console.log(`AI content generated. Length: ${rewrittenContent.length} characters`);

    // Process content: remove external links and add internal links
    const allPostsForLinking = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
      },
    });

    const { processedContent, linksAdded } = processContentWithInternalLinks(
      rewrittenContent,
      allPostsForLinking,
      undefined, // New post, no ID yet
      scrapedData.title,
      3 // Max 3 internal links
    );

    console.log(`Processed AI content: Removed external links, added ${linksAdded} internal links`);

    // Return the rewritten data
    return secureResponse({
      success: true,
      originalTitle: scrapedData.title,
      originalSlug: scrapedData.slug,
      rewrittenContent: processedContent,
      originalMetaDescription: scrapedData.metaDescription,
      featuredImage: scrapedData.featuredImage,
      appVersion: scrapedData.appVersion,
      appSize: scrapedData.appSize,
      requirements: scrapedData.requirements,
      downloads: scrapedData.downloads,
      developer: scrapedData.developer,
      downloadLink: scrapedData.downloadLink,
      keywords: scrapedData.keywords,
      suggestedKeywords: keywordsList.length > 0 ? keywordsList : scrapedData.keywords,
    });
  } catch (error: any) {
    console.error('AI Rewrite error:', error);
    return secureResponse(
      {
        error: error.message || 'Failed to rewrite content',
      },
      500
    );
  }
}

