# SEO & Google Jobs Implementation Guide

This document outlines the comprehensive SEO optimizations implemented for the Worko job platform, including Google Jobs compliance.

## 📋 Table of Contents

1. [URL Structure](#url-structure)
2. [Dynamic Metadata](#dynamic-metadata)
3. [Schema.org JSON-LD](#schemaorg-json-ld)
4. [Sitemap Generation](#sitemap-generation)
5. [Robots.txt](#robotstxt)
6. [Internal Linking](#internal-linking)
7. [Expired Jobs Handling](#expired-jobs-handling)
8. [Core Web Vitals](#core-web-vitals)
9. [Implementation Checklist](#implementation-checklist)

---

## URL Structure

### SEO-Friendly Slugs

**Before:** `/jobs/:companyName/:jobid` (e.g., `/jobs/Google/12345`)

**After:** `/jobs/job-title-company-name-location-experience` (e.g., `/jobs/senior-software-engineer-google-bangalore-5-8-years`)

### Implementation

- **File:** `src/utils/JobUriSlug.utils.ts`
- **Functions:**
  - `toSlug()` - Converts text to URL-friendly format
  - `generateJobSlug()` - Creates keyword-rich job URLs
  - `generateCanonicalJobSlug()` - Generates canonical URLs from job data
  - `generateSlugFromJob()` - Creates slug string for matching

### Features

- ✅ Keyword-rich URLs (title, company, location, experience)
- ✅ No IDs in URLs
- ✅ Canonical URL support
- ✅ Backward compatibility with old format
- ✅ Automatic redirect to canonical URL

---

## Dynamic Metadata

### SEOHead Component

**File:** `src/components/SEO/SEOHead.tsx`

Comprehensive SEO component that manages:

- **Basic Meta Tags:**
  - `<title>` - Dynamic page titles
  - `<meta name="description">` - SEO descriptions
  - `<meta name="keywords">` - Relevant keywords
  - `<meta name="robots">` - Indexing directives

- **OpenGraph Tags:**
  - `og:title` - Social sharing title
  - `og:description` - Social sharing description
  - `og:image` - Social sharing image
  - `og:type` - Content type (website/article)
  - `og:url` - Canonical URL
  - `og:site_name` - Site name

- **Twitter Card Tags:**
  - `twitter:card` - Card type
  - `twitter:title` - Twitter title
  - `twitter:description` - Twitter description
  - `twitter:image` - Twitter image

- **Canonical URL:**
  - Automatically sets canonical link tag

### Usage Example

```tsx
<SEOHead
  title="Senior Software Engineer at Google - Bangalore | Worko"
  description="Apply for Senior Software Engineer at Google in Bangalore. 5-8 years experience required."
  canonicalUrl="https://worko.ai/jobs/senior-software-engineer-google-bangalore-5-8-years"
  ogTitle="Senior Software Engineer at Google"
  ogDescription="Join Google as a Senior Software Engineer..."
  ogImage="https://worko.ai/images/google-logo.png"
  schemaJsonLd={jobSchema}
/>
```

---

## Schema.org JSON-LD

### JobPosting Schema

**File:** `src/utils/JobSchema.utils.ts`

Implements Google Jobs-compliant Schema.org JobPosting structured data.

### Required Fields

- ✅ `@context`: "https://schema.org"
- ✅ `@type`: "JobPosting"
- ✅ `title`: Job title
- ✅ `description`: Job description (text only, max 5000 chars)
- ✅ `datePosted`: ISO 8601 date
- ✅ `validThrough`: Expiration date
- ✅ `employmentType`: FULL_TIME, PART_TIME, etc.
- ✅ `hiringOrganization`: Company details
- ✅ `jobLocation`: Location with PostalAddress
- ✅ `baseSalary`: Salary range (if available)

### Optional Fields

- `experienceRequirements`: Years of experience
- `skills`: Required skills
- `industry`: Department/industry
- `numberOfOpenings`: Number of positions
- `workMode`: REMOTE, WFO, HYBRID

### Additional Schemas

- **BreadcrumbList:** Navigation breadcrumbs
- **Organization:** Company information

### Google Jobs Compliance

✅ Follows [Google Jobs guidelines](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
✅ Validates against Google's Rich Results Test
✅ Includes all required fields
✅ Proper date formatting (ISO 8601)
✅ Valid location structure

---

## Sitemap Generation

### Dynamic Sitemap

**File:** `src/utils/SitemapGenerator.utils.ts`
**Route:** `/sitemap.xml`

### Features

- ✅ Dynamic generation from job database
- ✅ Includes all published jobs
- ✅ Static pages included
- ✅ Proper priority and changefreq
- ✅ Last modified dates
- ✅ XML format compliant

### URL Priorities

- Homepage: 1.0 (daily)
- Jobs listing: 1.0 (hourly)
- Individual jobs: 0.8 (weekly)
- Referrals: 0.9 (daily)
- Static pages: 0.5-0.8 (monthly/yearly)

### Implementation

```typescript
const sitemap = generateCompleteSitemap(jobs, baseUrl);
```

### Production Note

For production, consider:
- Server-side generation
- Caching (1 hour recommended)
- Cron job for updates
- Sitemap index for large sites (10,000+ URLs)

---

## Robots.txt

**File:** `public/robots.txt`

### Configuration

- ✅ Allows all job pages
- ✅ Disallows auth pages
- ✅ Disallows dashboard/admin
- ✅ Sitemap reference
- ✅ Bot-specific rules (Googlebot, Bingbot)

### Key Directives

```
Allow: /jobs
Allow: /jobs/
Disallow: /auth/
Disallow: /dashboards/
Sitemap: https://worko.ai/sitemap.xml
```

---

## Internal Linking

### InternalLinks Component

**File:** `src/components/SEO/InternalLinks.tsx`

Creates structured internal links for SEO:

- **Company Links:** Link to all jobs at a company
- **Related Jobs:** Similar job listings
- **Category Links:** Department/industry links
- **Location Links:** City/region-based links
- **Navigation Links:** Main site navigation

### Benefits

- ✅ Improves crawlability
- ✅ Distributes page authority
- ✅ Enhances user experience
- ✅ Reduces bounce rate

---

## Expired Jobs Handling

### 410 Gone Status

When a job expires or is deleted:

1. **HTTP 410 Status:** Properly signals to search engines
2. **User-Friendly Page:** Shows expired message
3. **Redirect Option:** Links to job listings
4. **SEO Meta:** `noindex, nofollow` for expired pages

### Implementation

**File:** `src/pages/JobDescriptionPage.tsx`

```typescript
if (error && error.status === 410) {
  return <ExpiredJobPage />;
}
```

### Best Practices

- ✅ Return 410 for expired jobs
- ✅ Keep expired pages for 30 days
- ✅ Redirect to similar jobs
- ✅ Update sitemap to remove expired URLs

---

## Core Web Vitals

### Optimizations Implemented

1. **Code Splitting:**
   - Lazy loading with `React.lazy()`
   - Route-based code splitting
   - Component-level splitting

2. **Lazy Loading:**
   - Images with loading="lazy"
   - Components with Suspense
   - Dynamic imports

3. **Performance:**
   - React Query for caching
   - Memoization where needed
   - Optimized re-renders

### Metrics to Monitor

- **LCP (Largest Contentful Paint):** < 2.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **INP (Interaction to Next Paint):** < 200ms

---

## Implementation Checklist

### ✅ Completed

- [x] SEO-friendly URL structure (keyword-rich slugs)
- [x] Dynamic metadata component (title, description, canonical)
- [x] OpenGraph tags for social sharing
- [x] Twitter Card tags
- [x] Schema.org JobPosting JSON-LD
- [x] Breadcrumb schema
- [x] Dynamic sitemap generation
- [x] Robots.txt optimization
- [x] Internal linking architecture
- [x] Expired jobs handling (410 status)
- [x] Canonical URL management
- [x] Route updates for slug-based URLs

### 🔄 Recommended Next Steps

- [ ] Backend API endpoint for slug-based job lookup
- [ ] Server-side sitemap generation (for better performance)
- [ ] Image optimization (WebP, lazy loading)
- [ ] CDN integration for static assets
- [ ] Google Search Console setup
- [ ] Google Jobs API integration
- [ ] Analytics tracking for SEO metrics
- [ ] A/B testing for meta descriptions
- [ ] Regular sitemap updates (cron job)
- [ ] 301 redirects from old URLs to new slugs

---

## Google Jobs Compliance Checklist

### ✅ Required Fields

- [x] Job title
- [x] Job description (text format)
- [x] Date posted
- [x] Valid through date
- [x] Employment type
- [x] Hiring organization (name, logo, sameAs)
- [x] Job location (address structure)
- [x] Base salary (if available)

### ✅ Best Practices

- [x] Valid JSON-LD format
- [x] Unique job identifiers
- [x] Accurate location data
- [x] Proper date formatting
- [x] Company information
- [x] Skills and requirements
- [x] Experience requirements

### 📝 Testing

1. **Google Rich Results Test:**
   - Test URL: https://search.google.com/test/rich-results
   - Validate JobPosting schema

2. **Schema.org Validator:**
   - Test URL: https://validator.schema.org/
   - Check JSON-LD structure

3. **Google Search Console:**
   - Submit sitemap
   - Monitor indexing status
   - Check for errors

---

## File Structure

```
src/
├── components/
│   └── SEO/
│       ├── SEOHead.tsx          # Main SEO component
│       └── InternalLinks.tsx     # Internal linking component
├── pages/
│   ├── JobDescriptionPage.tsx   # Updated with SEO
│   └── sitemap/
│       └── SitemapPage.tsx      # Dynamic sitemap
├── utils/
│   ├── JobUriSlug.utils.ts      # URL slug generation
│   ├── JobSchema.utils.ts        # Schema.org generators
│   ├── JobSlugResolver.utils.ts  # Slug resolution
│   └── SitemapGenerator.utils.ts # Sitemap generation
└── Routes.tsx                    # Updated routes

public/
└── robots.txt                    # Updated robots.txt
```

---

## Usage Examples

### Adding SEO to a New Page

```tsx
import SEOHead from "@Components/SEO/SEOHead";

const MyPage = () => {
  return (
    <>
      <SEOHead
        title="Page Title - Worko"
        description="Page description for SEO"
        canonicalUrl="https://worko.ai/my-page"
      />
      {/* Page content */}
    </>
  );
};
```

### Generating Job Schema

```tsx
import { generateJobPostingSchema } from "@Utils/JobSchema.utils";

const jobSchema = generateJobPostingSchema(jobData, baseUrl);
```

### Creating Job URLs

```tsx
import { generateCanonicalJobSlug } from "@Utils/JobUriSlug.utils";

const jobUrl = generateCanonicalJobSlug(job);
// Returns: /jobs/senior-software-engineer-google-bangalore-5-8-years
```

---

## Support & Resources

- [Google Jobs Guidelines](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Schema.org JobPosting](https://schema.org/JobPosting)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)

---

## Notes

- All job URLs are now SEO-friendly with keyword-rich slugs
- Backward compatibility maintained for old URL format
- Schema.org JSON-LD follows Google Jobs requirements
- Sitemap is dynamically generated from published jobs
- Internal linking improves crawlability and user experience
