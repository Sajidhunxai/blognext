"use strict";(()=>{var e={};e.id=6154,e.ids=[6154],e.modules={53524:e=>{e.exports=require("@prisma/client")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},92048:e=>{e.exports=require("fs")},55315:e=>{e.exports=require("path")},64873:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>P,patchFetch:()=>x,requestAsyncStorage:()=>C,routeModule:()=>y,serverHooks:()=>b,staticGenerationAsyncStorage:()=>S});var o={};r.r(o),r.d(o,{GET:()=>f,dynamic:()=>g,revalidate:()=>h});var a=r(49303),s=r(88716),i=r(60670),n=r(87070),l=r(72331),p=r(51809),m=r(92048),c=r.n(m),u=r(55315),d=r.n(u);let g="force-dynamic",h=3600;async function f(){try{let e;let t=process.env.NEXTAUTH_URL||process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000";try{e=await (0,p.G)()}catch(t){e={siteName:"Blog CMS"}}let r={posts:0,publishedPosts:0,categories:0,pages:0,comments:0,users:0};try{let[e,t,o,a,s,i]=await Promise.all([l._.post.count(),l._.post.count({where:{published:!0}}),l._.category.count(),l._.page.count().catch(()=>0),l._.comment.count(),l._.user.count()]);r={posts:e,publishedPosts:t,categories:o,pages:a,comments:s,users:i}}catch(e){console.error("Error fetching stats:",e)}let o=[];try{o=await l._.post.findMany({take:10,orderBy:{createdAt:"desc"},select:{title:!0,slug:!0,published:!0,createdAt:!0}})}catch(e){console.error("Error fetching recent posts:",e)}let a=[];try{a=await l._.category.findMany({select:{name:!0,slug:!0},orderBy:{name:"asc"}})}catch(e){console.error("Error fetching categories:",e)}let s={},i={};try{let e=d().join(process.cwd(),"package.json");if(c().existsSync(e)){let t=JSON.parse(c().readFileSync(e,"utf-8"));s=t.dependencies||{},i=t.devDependencies||{}}}catch(e){console.error("Error reading package.json:",e)}let m=`# ${e.siteName||"Blog CMS"} - LLM Documentation

This file provides an overview of the codebase structure, features, and important information for AI assistants.

## Project Overview

${e.siteName||"Blog CMS"} is a Next.js-based content management system for managing blog posts, pages, and app listings. It features a modern admin dashboard, SEO optimization, and dynamic theming.

**Site URL:** ${t}
**Version:** ${process.env.npm_package_version||"0.1.0"}
**Framework:** Next.js 14 (App Router)
**Database:** MongoDB with Prisma ORM
**Authentication:** NextAuth.js
**Styling:** Tailwind CSS

## Current Statistics

- **Total Posts:** ${r.posts}
- **Published Posts:** ${r.publishedPosts}
- **Categories:** ${r.categories}
- **Pages:** ${r.pages}
- **Comments:** ${r.comments}
- **Users:** ${r.users}

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
${Object.entries(s).map(([e,t])=>`- **${e}**: ${t}`).join("\n")}

### Development
${Object.entries(i).map(([e,t])=>`- **${e}**: ${t}`).join("\n")}

## Recent Posts

${o.length>0?o.map((e,t)=>`${t+1}. **${e.title}** (${e.published?"Published":"Draft"}) - \`/posts/${e.slug}\` - Created: ${e.createdAt.toISOString().split("T")[0]}`).join("\n"):"No posts yet."}

## Categories

${a.length>0?a.map(e=>`- **${e.name}** - \`/category/${e.slug}\``).join("\n"):"No categories yet."}

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
`;return new n.NextResponse(m,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, s-maxage=3600, stale-while-revalidate"}})}catch(e){return console.error("Error generating llm.txt:",e),new n.NextResponse("Error generating llm.txt",{status:500})}}let y=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/llm.txt/route",pathname:"/llm.txt",filename:"route",bundlePath:"app/llm.txt/route"},resolvedPagePath:"/Users/hunxai/apkapp/app/llm.txt/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:C,staticGenerationAsyncStorage:S,serverHooks:b}=y,P="/llm.txt/route";function x(){return(0,i.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:S})}},72331:(e,t,r)=>{r.d(t,{_:()=>a});var o=r(53524);let a=globalThis.prisma??new o.PrismaClient},51809:(e,t,r)=>{r.d(t,{G:()=>a});var o=r(72331);async function a(){try{if(!o._)throw Error("Prisma client is not initialized");if(!("settings"in o._))throw console.error("Settings model not found in Prisma Client. Please restart the dev server."),Error("Settings model not available. Please restart the dev server.");let e=o._.settings.findFirst(),t=new Promise(e=>setTimeout(()=>e(null),1e4)),r=await Promise.race([e,t]);return r||(r=await o._.settings.create({data:{siteName:"PKR Games",headerMenu:["Home","Apps","Games","Casinos"],footerLinks:[],socialMedia:{facebook:"",twitter:"",instagram:"",youtube:"",pinterest:"",telegram:""},heroTitle:"PKR Gamesd - Download Best Games",heroSubtitle:""}})),r}catch(e){return console.error("Error in getSettings:",e),{id:"",siteName:"PKR Games",logo:"",favicon:"",headerMenu:["Home","Apps","Games","Casinos"],footerLinks:[],socialMedia:{facebook:"",twitter:"",instagram:"",youtube:"",pinterest:"",telegram:""},heroTitle:"PKR Games - Download Best Games",heroSubtitle:"",heroBackground:"",enableComments:!0,primaryColor:"#dc2626",secondaryColor:"#16a34a",backgroundColor:"#111827",textColor:"#ffffff",buttonColor:"#dc2626",buttonTextColor:"#ffffff",linkColor:"#3b82f6",successColor:"#16a34a",errorColor:"#dc2626",warningColor:"#f59e0b",infoColor:"#3b82f6",headerScript:null,footerScript:null,headerCSS:null,footerCSS:null,updatedAt:new Date}}}},79925:e=>{var t=Object.defineProperty,r=Object.getOwnPropertyDescriptor,o=Object.getOwnPropertyNames,a=Object.prototype.hasOwnProperty,s={};function i(e){var t;let r=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),o=`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}`;return 0===r.length?o:`${o}; ${r.join("; ")}`}function n(e){let t=new Map;for(let r of e.split(/; */)){if(!r)continue;let e=r.indexOf("=");if(-1===e){t.set(r,"true");continue}let[o,a]=[r.slice(0,e),r.slice(e+1)];try{t.set(o,decodeURIComponent(null!=a?a:"true"))}catch{}}return t}function l(e){var t,r;if(!e)return;let[[o,a],...s]=n(e),{domain:i,expires:l,httponly:c,maxage:u,path:d,samesite:g,secure:h,partitioned:f,priority:y}=Object.fromEntries(s.map(([e,t])=>[e.toLowerCase(),t]));return function(e){let t={};for(let r in e)e[r]&&(t[r]=e[r]);return t}({name:o,value:decodeURIComponent(a),domain:i,...l&&{expires:new Date(l)},...c&&{httpOnly:!0},..."string"==typeof u&&{maxAge:Number(u)},path:d,...g&&{sameSite:p.includes(t=(t=g).toLowerCase())?t:void 0},...h&&{secure:!0},...y&&{priority:m.includes(r=(r=y).toLowerCase())?r:void 0},...f&&{partitioned:!0}})}((e,r)=>{for(var o in r)t(e,o,{get:r[o],enumerable:!0})})(s,{RequestCookies:()=>c,ResponseCookies:()=>u,parseCookie:()=>n,parseSetCookie:()=>l,stringifyCookie:()=>i}),e.exports=((e,s,i,n)=>{if(s&&"object"==typeof s||"function"==typeof s)for(let i of o(s))a.call(e,i)||void 0===i||t(e,i,{get:()=>s[i],enumerable:!(n=r(s,i))||n.enumerable});return e})(t({},"__esModule",{value:!0}),s);var p=["strict","lax","none"],m=["low","medium","high"],c=class{constructor(e){this._parsed=new Map,this._headers=e;let t=e.get("cookie");if(t)for(let[e,r]of n(t))this._parsed.set(e,{name:e,value:r})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed);if(!e.length)return r.map(([e,t])=>t);let o="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(([e])=>e===o).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,r]=1===e.length?[e[0].name,e[0].value]:e,o=this._parsed;return o.set(t,{name:t,value:r}),this._headers.set("cookie",Array.from(o).map(([e,t])=>i(t)).join("; ")),this}delete(e){let t=this._parsed,r=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>i(t)).join("; ")),r}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},u=class{constructor(e){var t,r,o;this._parsed=new Map,this._headers=e;let a=null!=(o=null!=(r=null==(t=e.getSetCookie)?void 0:t.call(e))?r:e.get("set-cookie"))?o:[];for(let e of Array.isArray(a)?a:function(e){if(!e)return[];var t,r,o,a,s,i=[],n=0;function l(){for(;n<e.length&&/\s/.test(e.charAt(n));)n+=1;return n<e.length}for(;n<e.length;){for(t=n,s=!1;l();)if(","===(r=e.charAt(n))){for(o=n,n+=1,l(),a=n;n<e.length&&"="!==(r=e.charAt(n))&&";"!==r&&","!==r;)n+=1;n<e.length&&"="===e.charAt(n)?(s=!0,n=a,i.push(e.substring(t,o)),t=n):n=o+1}else n+=1;(!s||n>=e.length)&&i.push(e.substring(t,e.length))}return i}(a)){let t=l(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed.values());if(!e.length)return r;let o="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(e=>e.name===o)}has(e){return this._parsed.has(e)}set(...e){let[t,r,o]=1===e.length?[e[0].name,e[0].value,e[0]]:e,a=this._parsed;return a.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:r,...o})),function(e,t){for(let[,r]of(t.delete("set-cookie"),e)){let e=i(r);t.append("set-cookie",e)}}(a,this._headers),this}delete(...e){let[t,r,o]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:t,path:r,domain:o,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(i).join("; ")}}},38238:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"ReflectAdapter",{enumerable:!0,get:function(){return r}});class r{static get(e,t,r){let o=Reflect.get(e,t,r);return"function"==typeof o?o.bind(e):o}static set(e,t,r,o){return Reflect.set(e,t,r,o)}static has(e,t){return Reflect.has(e,t)}static deleteProperty(e,t){return Reflect.deleteProperty(e,t)}}},92044:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{RequestCookies:function(){return o.RequestCookies},ResponseCookies:function(){return o.ResponseCookies},stringifyCookie:function(){return o.stringifyCookie}});let o=r(79925)}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[8948,5972],()=>r(64873));module.exports=o})();