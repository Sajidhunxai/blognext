import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  try {
    const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Get settings
    let settings;
    try {
      settings = await getSettings();
    } catch (error) {
      settings = { siteName: 'Blog CMS' };
    }

    // Get database stats
    let stats = {
      posts: 0,
      publishedPosts: 0,
      categories: 0,
      pages: 0,
      comments: 0,
      users: 0,
    };

    try {
      const [posts, publishedPosts, categories, pages, comments, users] = await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { published: true } }),
        prisma.category.count(),
        prisma.page.count().catch(() => 0),
        prisma.comment.count(),
        prisma.user.count(),
      ]);

      stats = {
        posts,
        publishedPosts,
        categories,
        pages,
        comments,
        users,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
    }

    // Get recent posts
    let recentPosts: any[] = [];
    try {
      recentPosts = await prisma.post.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          title: true,
          slug: true,
          published: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }

    // Get categories
    let categoryList: any[] = [];
    try {
      categoryList = await prisma.category.findMany({
        select: {
          name: true,
          slug: true,
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }

    // Read package.json for dependencies
    let dependencies: Record<string, string> = {};
    let devDependencies: Record<string, string> = {};
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        dependencies = packageJsonContent.dependencies || {};
        devDependencies = packageJsonContent.devDependencies || {};
      }
    } catch (error) {
      console.error('Error reading package.json:', error);
    }

    // Generate llm.txt content
    const llmContent = `# ${settings.siteName || 'Blog CMS'} - LLM Documentation

This file provides an overview of the codebase structure, features, and important information for AI assistants.

## Project Overview

${settings.siteName || 'Blog CMS'} is a Next.js-based content management system for managing blog posts, pages, and app listings. It features a modern admin dashboard, SEO optimization, and dynamic theming.

**Site URL:** ${siteUrl}
**Version:** ${process.env.npm_package_version || '0.1.0'}
**Framework:** Next.js 14 (App Router)
**Database:** MongoDB with Prisma ORM
**Authentication:** NextAuth.js
**Styling:** Tailwind CSS

## Current Statistics

- **Total Posts:** ${stats.posts}
- **Published Posts:** ${stats.publishedPosts}
- **Categories:** ${stats.categories}
- **Pages:** ${stats.pages}
- **Comments:** ${stats.comments}
- **Users:** ${stats.users}

## Key Features

### Content Management
- Blog posts with rich text editor (TipTap)
- Custom pages
- Categories for organizing content
- Comments system with moderation
- Image uploads via Cloudinary

### SEO Features
- Meta titles and descriptions
- Open Graph tags
- Twitter Card support
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt

### Admin Features
- Admin-only authentication
- Dashboard for content management
- Settings management
- Theme customization (colors, logo, favicon)
- Custom header/footer scripts and CSS

### Performance Optimizations
- Next.js Image optimization
- Dynamic imports for code splitting
- Modern browser targeting (reduces polyfills)
- AVIF/WebP image formats
- SWC minification

## Project Structure

\`\`\`
apkapp/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth.js authentication
│   │   ├── posts/           # Post CRUD operations
│   │   ├── categories/     # Category management
│   │   ├── pages/          # Page management
│   │   ├── comments/       # Comment management
│   │   ├── settings/       # Settings API
│   │   └── upload/         # Image upload (Cloudinary)
│   ├── dashboard/          # Admin dashboard pages
│   │   ├── posts/          # Post management
│   │   ├── categories/     # Category management
│   │   ├── pages/          # Page management
│   │   ├── comments/       # Comment moderation
│   │   └── settings/       # Site settings
│   ├── posts/[slug]/       # Public post pages
│   ├── category/[slug]/    # Category archive pages
│   ├── pages/[slug]/       # Public page pages
│   ├── download/[slug]/    # Download pages with countdown
│   ├── login/              # Admin login
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── robots.ts           # Robots.txt
│   └── manifest.ts         # Web manifest
├── components/             # React components
│   ├── FrontendLayout.tsx  # Main layout wrapper
│   ├── CategoryFilter.tsx  # Category filtering
│   ├── CommentsSection.tsx # Comments component
│   ├── RichTextEditor.tsx  # TipTap editor
│   ├── ImageUpload.tsx     # Image upload component
│   └── ...                 # Other UI components
├── lib/                    # Utility functions
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # NextAuth configuration
│   ├── settings.ts        # Settings helper
│   └── api-security.ts    # API security helpers
├── contexts/              # React contexts
│   └── ThemeContext.tsx   # Theme management
├── prisma/
│   └── schema.prisma      # Database schema
└── scripts/               # Utility scripts
    ├── create-admin.js    # Create admin user
    └── seed.js            # Database seeding
\`\`\`

## Database Schema

### Models

**User**
- Authentication and admin users
- Fields: id, email, password, name, role

**Post**
- Blog posts and app listings
- Fields: title, content, slug, published, authorId, categoryId
- SEO: metaTitle, metaDescription, keywords, ogImage, featuredImage
- App Details: developer, appSize, appVersion, requirements, downloads, googlePlayLink, downloadLink
- Relations: author (User), category (Category), comments (Comment[])

**Category**
- Content categories
- Fields: id, name, slug, description
- Relations: posts (Post[])

**Page**
- Custom pages
- Fields: id, title, content, slug, published, metaTitle, metaDescription

**Comment**
- Post comments
- Fields: id, postId, authorName, authorEmail, authorWebsite, content, approved
- Relations: post (Post)

**Settings**
- Site-wide settings
- Fields: siteName, logo, favicon, headerMenu, footerLinks, socialMedia
- Theme: primaryColor, secondaryColor, backgroundColor, textColor, etc.
- Hero: heroTitle, heroSubtitle, heroBackground
- Custom: headerScript, footerScript, headerCSS, footerCSS

## API Routes

### Authentication
- \`POST /api/auth/[...nextauth]\` - NextAuth.js handlers

### Posts
- \`GET /api/posts\` - List posts
- \`POST /api/posts\` - Create post
- \`GET /api/posts/[id]\` - Get post
- \`PUT /api/posts/[id]\` - Update post
- \`DELETE /api/posts/[id]\` - Delete post
- \`GET /api/posts/by-slug?slug=...\` - Get post by slug

### Categories
- \`GET /api/categories\` - List categories
- \`POST /api/categories\` - Create category
- \`PUT /api/categories/[id]\` - Update category
- \`DELETE /api/categories/[id]\` - Delete category

### Pages
- \`GET /api/pages\` - List pages
- \`POST /api/pages\` - Create page
- \`PUT /api/pages/[id]\` - Update page
- \`DELETE /api/pages/[id]\` - Delete page

### Comments
- \`GET /api/comments\` - List comments
- \`POST /api/comments\` - Create comment
- \`PUT /api/comments/[id]\` - Update comment (approve/reject)
- \`DELETE /api/comments/[id]\` - Delete comment

### Settings
- \`GET /api/settings\` - Get settings
- \`PUT /api/settings\` - Update settings

### Upload
- \`POST /api/upload\` - Upload image to Cloudinary

## Dependencies

### Core
${Object.entries(dependencies).map(([name, version]) => `- **${name}**: ${version}`).join('\n')}

### Development
${Object.entries(devDependencies).map(([name, version]) => `- **${name}**: ${version}`).join('\n')}

## Recent Posts

${recentPosts.length > 0 ? recentPosts.map((post, i) => 
  `${i + 1}. **${post.title}** (${post.published ? 'Published' : 'Draft'}) - \`/posts/${post.slug}\` - Created: ${post.createdAt.toISOString().split('T')[0]}`
).join('\n') : 'No posts yet.'}

## Categories

${categoryList.length > 0 ? categoryList.map((cat) => 
  `- **${cat.name}** - \`/category/${cat.slug}\``
).join('\n') : 'No categories yet.'}

## Environment Variables

Required environment variables:
- \`DATABASE_URL\` - MongoDB connection string
- \`NEXTAUTH_URL\` - Site URL for authentication
- \`NEXTAUTH_SECRET\` - Secret for NextAuth.js
- \`CLOUDINARY_CLOUD_NAME\` - Cloudinary cloud name
- \`CLOUDINARY_API_KEY\` - Cloudinary API key
- \`CLOUDINARY_API_SECRET\` - Cloudinary API secret

## Important Notes

1. **Authentication**: Admin-only access via NextAuth.js credentials provider
2. **Image Storage**: Images are uploaded to Cloudinary, not local storage
3. **SEO**: All posts include comprehensive SEO metadata
4. **Theming**: Site colors and branding are customizable via Settings
5. **Performance**: Optimized for modern browsers with minimal polyfills
6. **Dynamic Routes**: Sitemap, robots.txt, and manifest are generated dynamically

## Deployment

- **Platform**: Vercel (recommended)
- **Database**: MongoDB Atlas
- **Image CDN**: Cloudinary
- **Build**: \`npm run build\` (includes Prisma generate)

---

Generated: ${new Date().toISOString()}
`;

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

