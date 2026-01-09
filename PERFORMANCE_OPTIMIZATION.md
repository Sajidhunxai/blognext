# Performance Optimization Guide

## Reducing HTTP Requests

This guide explains how to reduce HTTP requests and improve page loading speed.

## Current Status

**Before Optimization:**
- Total HTTP Requests: **37**
- Images: 20 requests (54.1%)
- JavaScript: 12 requests (32.4%)
- Other: 3 requests (8.1%)
- HTML: 1 request (2.7%)
- CSS: 1 request (2.7%)

**Total Size:** 426.26 Kb
- Images: 280.29 Kb (65.8%)
- JavaScript: 122.06 Kb (28.6%)
- HTML: 11.32 Kb (2.7%)
- CSS: 8.51 Kb (2.0%)

## Optimizations Implemented

### 1. Image Loading Optimization ✅

**Changes Made:**
- Added `priority` prop only to above-the-fold images (first 2 posts)
- Added `fetchPriority="high"` for critical images
- Added `loading="lazy"` for below-the-fold images
- Reduced initial post count from 12 to 9
- Reduced featured category posts from 6 to 4 per category
- Limited featured categories to 3 maximum

**Impact:**
- Reduces initial image requests by ~30-40%
- Images below the fold load only when user scrolls near them
- Above-the-fold images load with high priority

### 2. JavaScript Bundle Optimization ✅

**Changes Made:**
- Removed unnecessary preconnect for Google Fonts (if not using)
- Optimized dynamic imports
- Next.js automatically code-splits and minifies

**Impact:**
- Smaller JavaScript bundles
- Better tree-shaking
- Faster initial page load

### 3. Caching Headers ✅

**Changes Made:**
- Added long-term caching for `/_next/image` endpoint
- Static assets cached for 1 year with immutable flag

**Impact:**
- Repeat visitors load much faster
- Reduced server load
- Better Core Web Vitals

### 4. Content Reduction ✅

**Changes Made:**
- Reduced initial homepage posts from 12 to 9
- Limited featured categories to 3
- Reduced posts per featured category from 6 to 4

**Impact:**
- Fewer HTTP requests on initial page load
- Faster Time to Interactive (TTI)
- Better user experience

## Expected Results After Optimization

**Target Metrics:**
- **Initial Requests:** ~25-28 (down from 37)
- **Above-the-fold Images:** 4-6 (with priority)
- **Below-the-fold Images:** Load on scroll
- **JavaScript Requests:** 8-10 (optimized bundles)
- **Total Initial Size:** ~250-300 Kb (reduced from 426 Kb)

## Additional Optimization Strategies

### 1. Image Sprites (If Applicable)

For small icons/logos that appear multiple times, consider using CSS sprites:

```css
.icon {
  background-image: url('/icons-sprite.png');
  background-size: 200px 200px;
}
```

**When to Use:**
- Small icons used frequently
- Logos and badges
- UI elements

**Benefits:**
- Reduces multiple requests to one
- Better caching
- Faster loading

### 2. Resource Hints

Add resource hints for critical resources:

```html
<!-- Preload critical resources -->
<link rel="preload" as="image" href="/hero-image.jpg" />
<link rel="preload" as="font" href="/font.woff2" crossorigin />

<!-- Prefetch next page resources -->
<link rel="prefetch" href="/posts/page-2" />
```

### 3. Image Format Optimization

**Already Configured:**
- Next.js Image component uses WebP/AVIF when supported
- Cloudinary optimization enabled

**Additional Options:**
- Use WebP format for all new images
- Consider AVIF for modern browsers
- Serve responsive images with srcset

### 4. Code Splitting

**Already Optimized:**
- Dynamic imports for non-critical components
- Route-based code splitting (Next.js default)

**Best Practices:**
```javascript
// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // If not needed for SEO
});
```

### 5. Reduce Third-Party Scripts

**Check:**
- Remove unused scripts
- Defer non-critical scripts
- Load analytics asynchronously

### 6. Combine CSS/JS Files

**Already Optimized:**
- Next.js automatically bundles CSS
- JavaScript is code-split automatically
- Tailwind CSS is purged in production

### 7. Implement Pagination/Lazy Loading

**Current:**
- Posts are paginated
- Consider infinite scroll or "Load More" button

**Option:**
```typescript
// Load more posts on button click
const [visiblePosts, setVisiblePosts] = useState(9);
const loadMore = () => setVisiblePosts(prev => prev + 12);
```

### 8. Service Worker / PWA

**Consider:**
- Implement service worker for caching
- Enable offline functionality
- Cache API responses

### 9. CDN Configuration

**Current:**
- Using Cloudinary CDN for images ✅

**Optimize:**
- Enable Cloudinary automatic format selection
- Use Cloudinary transformations for responsive images
- Enable Cloudinary lazy loading

### 10. Database Query Optimization

**Current:**
- Posts are fetched efficiently
- Consider adding indexes for common queries

**Optimize:**
```javascript
// Fetch only needed fields
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    featuredImage: true,
    // Only select needed fields
  },
});
```

## Monitoring Performance

### Tools to Use:

1. **PageSpeed Insights**
   - https://pagespeed.web.dev/
   - Provides Core Web Vitals scores

2. **Lighthouse** (Chrome DevTools)
   - Performance audit
   - Identifies optimization opportunities

3. **WebPageTest**
   - https://www.webpagetest.org/
   - Detailed waterfall charts
   - Request analysis

4. **Next.js Analytics**
   - Built-in performance monitoring
   - Real User Monitoring (RUM)

### Key Metrics to Track:

- **Total Requests:** Target < 30
- **Total Page Size:** Target < 500 Kb
- **Time to First Byte (TTFB):** Target < 200ms
- **First Contentful Paint (FCP):** Target < 1.8s
- **Largest Contentful Paint (LCP):** Target < 2.5s
- **Cumulative Layout Shift (CLS):** Target < 0.1
- **First Input Delay (FID):** Target < 100ms

## Testing Your Optimizations

### Before Testing:
1. Clear browser cache
2. Open DevTools Network tab
3. Enable "Disable cache"
4. Set throttling to "Fast 3G" or "Slow 3G"

### Check:
1. Total number of requests
2. Total page size
3. Load time
4. Images loading (lazy vs eager)
5. JavaScript bundle sizes

### Verify Lazy Loading:
1. Open Network tab
2. Load page
3. Scroll down slowly
4. Verify images load as you approach them

## Best Practices Going Forward

### When Adding New Images:

1. **Always specify dimensions:**
   ```tsx
   <SmartImage
     width={800}
     height={600}
     src={image}
     alt="Description"
   />
   ```

2. **Use priority only for above-the-fold:**
   ```tsx
   <SmartImage
     priority={isAboveFold}
     src={image}
     alt="Description"
   />
   ```

3. **Optimize image quality:**
   ```tsx
   <SmartImage
     quality={85} // Good balance
     src={image}
     alt="Description"
   />
   ```

4. **Use responsive sizes:**
   ```tsx
   <SmartImage
     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
     src={image}
     alt="Description"
   />
   ```

### When Adding New Components:

1. **Use dynamic imports for heavy components:**
   ```tsx
   const HeavyChart = dynamic(() => import('./Chart'), {
     ssr: false,
     loading: () => <Loading />,
   });
   ```

2. **Lazy load non-critical features:**
   ```tsx
   // Load only when needed
   const loadAnalytics = () => {
     import('./analytics').then(module => {
       module.init();
     });
   };
   ```

### When Adding New Pages:

1. **Implement proper caching:**
   ```tsx
   export const revalidate = 300; // 5 minutes
   ```

2. **Use static generation when possible:**
   ```tsx
   export async function generateStaticParams() {
     // Pre-generate pages
   }
   ```

## Troubleshooting

### Images Still Loading Immediately:

**Check:**
- Is `priority={true}` set? (Remove for below-fold images)
- Is `loading="lazy"` explicitly set? (Should be automatic but verify)
- Is the image in viewport on page load? (Above fold images load immediately)

### Too Many JavaScript Requests:

**Check:**
- Are there unnecessary dynamic imports?
- Are third-party scripts deferred?
- Is code splitting too aggressive?

### Slow Page Load:

**Check:**
- Network tab for slow requests
- Large bundle sizes
- Too many requests
- Blocking scripts
- Unoptimized images

## Summary

### Immediate Actions Taken:
✅ Optimized image loading with lazy loading
✅ Reduced initial content load
✅ Added proper caching headers
✅ Optimized JavaScript bundles
✅ Limited featured categories and posts

### Expected Improvements:
- **30-40% reduction** in initial HTTP requests
- **20-30% reduction** in initial page size
- **Faster Time to Interactive**
- **Better Core Web Vitals scores**
- **Improved user experience**

### Next Steps:
1. Monitor performance with Lighthouse
2. Test on slow connections
3. Consider implementing image sprites if applicable
4. Add service worker for offline caching
5. Monitor and optimize based on real user data

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/pages/api-reference/components/image)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Cloudinary Image Optimization](https://cloudinary.com/documentation/image_optimization)

