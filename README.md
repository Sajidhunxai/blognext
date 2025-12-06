# Blog CMS

A simple and elegant blog content management system built with Next.js, MongoDB, and Tailwind CSS. Features admin authentication, SEO optimization, and a minimal, modern design.

## Features

- 🔐 Admin-only authentication system
- ✍️ Create, edit, and delete blog posts
- 🎨 Elegant and minimal UI design
- 🔍 Full SEO optimization:
  - Meta titles and descriptions
  - Open Graph tags
  - Twitter Card support
  - Structured data (JSON-LD schema)
  - Image alt tags
  - Keywords support
- 📱 Responsive design
- 🗄️ MongoDB database with Prisma ORM

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="mongodb://localhost:27017/blog-cms"
   # Or for MongoDB Atlas:
   # DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/blog-cms"
   
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Push database schema:**
   ```bash
   npx prisma db push
   ```

5. **Create an admin user:**
   You can create an admin user by running a script or manually inserting into the database. Here's a Node.js script you can run:

   ```javascript
   // scripts/create-admin.js
   const bcrypt = require('bcryptjs');
   const { PrismaClient } = require('@prisma/client');
   
   const prisma = new PrismaClient();
   
   async function main() {
     const hashedPassword = await bcrypt.hash('your-admin-password', 10);
     const admin = await prisma.user.create({
       data: {
         email: 'admin@example.com',
         password: hashedPassword,
         name: 'Admin User',
         role: 'admin',
       },
     });
     console.log('Admin user created:', admin);
   }
   
   main()
     .catch(console.error)
     .finally(() => prisma.$disconnect());
   ```

   Run it with:
   ```bash
   node scripts/create-admin.js
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Login:** Go to `/login` and sign in with your admin credentials
2. **Dashboard:** Access the dashboard at `/dashboard` to manage posts
3. **Create Post:** Click "New Post" to create a blog post with SEO settings
4. **Edit Post:** Click "Edit" on any post to modify it
5. **View Posts:** Published posts are visible on the homepage

## SEO Features

Each blog post includes:
- **Meta Title:** Optimized title for search engines (defaults to post title)
- **Meta Description:** Brief description for search results (max 160 characters)
- **Keywords:** Comma-separated keywords for SEO
- **Featured Image:** Main image for the post with alt text
- **Open Graph Image:** Image for social media sharing with alt text
- **Structured Data:** JSON-LD schema markup for better search engine understanding

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── dashboard/        # Admin dashboard pages
│   ├── login/           # Login page
│   ├── posts/          # Public blog post pages
│   └── page.tsx         # Homepage
├── components/          # React components
├── lib/                # Utility functions
├── prisma/             # Database schema
└── types/              # TypeScript type definitions
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Prisma** - ORM
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **bcryptjs** - Password hashing

## License

MIT
