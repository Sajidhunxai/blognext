# Multi-Language Implementation Guide

## Overview
This document outlines the implementation of multi-language support (English, Urdu, Hindi) with SEO optimization.

## URL Structure
| Language | URL Prefix | Example |
|----------|------------|---------|
| English (default) | `/` (no prefix) | `yoursite.com/post/best-games` |
| Urdu | `/ur` | `yoursite.com/ur/post/best-games` |
| Hindi | `/hi` | `yoursite.com/hi/post/best-games` |

> **Note:** ISO 639-1 uses `hi` for Hindi. You mentioned `hr` — `hr` is Croatian. For SEO, `hi` is recommended for Hindi. Change in `lib/i18n/config.ts` if you prefer `hr`.

## Architecture

### 1. Database Schema (MongoDB via Prisma)
- **PostTranslation**: Stores translated post content (title, content, metaTitle, metaDescription, keywords, etc.) per locale
- **PageTranslation**: Same for static pages
- **SettingsTranslation**: Translated settings (hero text, menu labels, etc.)
- **CategoryTranslation**: Translated category names/descriptions

Original content (English) remains in Post, Page, etc. Translations reference the source document.

### 2. Translation Workflow
1. **Manual**: Admin creates/edits translations in dashboard
2. **Google Translate**: Use as draft, then manually review (free tier: 500k chars/month on Google Cloud)
3. **Storage**: All translations in MongoDB

### 3. SEO Requirements
- `hreflang` tags in `<head>` for alternate language URLs
- Language-specific meta titles, descriptions
- Localized sitemaps (`/sitemap-en.xml`, `/sitemap-ur.xml`, `/sitemap-hi.xml`)
- Structured data (JSON-LD) with `inLanguage` property
- `lang` attribute on `<html>` (e.g. `lang="ur"`, `lang="hi"`)

### 4. API Changes
- All content APIs accept `locale` query param or header
- Response includes translated content when available
- Fallback to English if translation missing

## Implementation Phases

### Phase 1: Foundation ✅ DONE
- [x] Add `lib/i18n/config.ts` - locale constants, types
- [x] Add Prisma models: PostTranslation, PageTranslation, SettingsTranslation, CategoryTranslation
- [x] Create middleware for locale routing
- [x] Add `app/[locale]/` routes for /ur and /hi

### Phase 2: Content & API ✅ DONE
- [x] `getPostWithLocale`, `getSettingsWithLocale`, `getCategoriesWithLocale`, `getPostsWithLocale` in `lib/i18n/content.ts`
- [x] POST/GET `/api/posts/[id]/translations` for managing post translations
- [x] POST `/api/translate` for Google Translate (requires `GOOGLE_TRANSLATE_API_KEY`)

### Phase 3: Translation Tools (TODO)
- [ ] Dashboard UI for managing translations per post/page
- [ ] "Translate" button that calls Google Translate API to pre-fill

### Phase 4: SEO (TODO)
- [ ] hreflang tags in layout
- [ ] Localized sitemaps
- [ ] Language switcher component in header/footer

## File Structure After Implementation
```
app/
  (en)/          # English - root level, no prefix
    post/[slug]/page.tsx
    page.tsx
    ...
  [locale]/      # ur, hi - with prefix
    layout.tsx
    post/[slug]/page.tsx
    page.tsx
    ...
middleware.ts    # Handles /ur, /hi prefix, sets locale
lib/
  i18n/
    config.ts
    translations.ts
    ...
```

## Translation API (MyMemory - Free)
- **MyMemory API**: No API key or credit card required
- Limits: ~1000 words/day unregistered; 10,000 words/day with free account
- Optional: Set `MYMEMORY_EMAIL` in `.env` for higher quota (register at mymemory.translated.net)
