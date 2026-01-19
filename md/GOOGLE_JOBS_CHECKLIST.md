# Google Jobs Compliance Checklist

This checklist ensures your job postings are compliant with Google Jobs requirements.

## ✅ Schema.org JobPosting Requirements

### Required Properties

- [x] **@context**: "https://schema.org"
- [x] **@type**: "JobPosting"
- [x] **title**: Job title (string)
- [x] **description**: Job description (text, max 5000 chars)
- [x] **datePosted**: ISO 8601 date format
- [x] **validThrough**: Expiration date (ISO 8601)
- [x] **employmentType**: FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY, INTERN, VOLUNTEER, PER_DIEM, OTHER
- [x] **hiringOrganization**: Organization object with:
  - [x] **@type**: "Organization"
  - [x] **name**: Company name
  - [x] **sameAs**: Company LinkedIn/website URL
  - [x] **logo**: Company logo URL
- [x] **jobLocation**: Place object with:
  - [x] **@type**: "Place"
  - [x] **address**: PostalAddress with:
    - [x] **addressLocality**: City
    - [x] **addressRegion**: State/Province
    - [x] **addressCountry**: Country code (ISO 3166-1 alpha-2)

### Recommended Properties

- [x] **baseSalary**: MonetaryAmount (if available)
- [x] **experienceRequirements**: OccupationalExperienceRequirements
- [x] **skills**: Array of required skills
- [x] **industry**: Department/industry
- [x] **numberOfOpenings**: Number of positions
- [x] **workMode**: REMOTE, WFO, HYBRID

## ✅ Technical Requirements

### URL Structure

- [x] SEO-friendly URLs (no IDs in path)
- [x] Canonical URLs set correctly
- [x] HTTPS enabled
- [x] Mobile-friendly (responsive design)

### Metadata

- [x] Unique title for each job
- [x] Descriptive meta description (150-160 chars)
- [x] OpenGraph tags for social sharing
- [x] Twitter Card tags
- [x] Canonical link tag

### Content Quality

- [x] Job descriptions are text-based (HTML stripped for schema)
- [x] Accurate job titles
- [x] Complete location information
- [x] Real company information
- [x] Valid dates (not in the past for datePosted)

## ✅ Sitemap Requirements

- [x] Sitemap.xml exists and is accessible
- [x] All job URLs included in sitemap
- [x] Last modified dates included
- [x] Change frequency set appropriately
- [x] Priority values set (0.0 - 1.0)
- [x] Sitemap referenced in robots.txt

## ✅ Robots.txt

- [x] Allows crawling of job pages
- [x] Disallows private/auth pages
- [x] Sitemap location specified
- [x] Bot-specific rules (if needed)

## ✅ Expired Jobs Handling

- [x] 410 Gone status for expired jobs
- [x] Expired jobs removed from sitemap
- [x] User-friendly expired job page
- [x] Redirect to similar jobs

## ✅ Testing & Validation

### Google Rich Results Test

- [ ] Test job posting URL: https://search.google.com/test/rich-results
- [ ] Verify JobPosting schema is detected
- [ ] Check for any errors or warnings
- [ ] Ensure all required fields are present

### Schema.org Validator

- [ ] Validate JSON-LD: https://validator.schema.org/
- [ ] Check for syntax errors
- [ ] Verify property types are correct
- [ ] Ensure dates are in ISO 8601 format

### Google Search Console

- [ ] Submit sitemap.xml
- [ ] Monitor indexing status
- [ ] Check for crawl errors
- [ ] Review coverage report
- [ ] Monitor job posting performance

### Manual Testing

- [ ] Test job URL accessibility
- [ ] Verify canonical URLs
- [ ] Check mobile responsiveness
- [ ] Test social sharing (OpenGraph)
- [ ] Verify breadcrumb navigation
- [ ] Test internal linking

## ✅ Performance & Core Web Vitals

- [x] LCP (Largest Contentful Paint) < 2.5s
- [x] CLS (Cumulative Layout Shift) < 0.1
- [x] INP (Interaction to Next Paint) < 200ms
- [x] Code splitting implemented
- [x] Lazy loading for images
- [x] Optimized bundle sizes

## ✅ Content Guidelines

### Job Title

- [x] Clear and descriptive
- [x] Includes job level (if applicable)
- [x] No company name in title (unless part of role)
- [x] Standardized format

### Job Description

- [x] Detailed and informative
- [x] Includes responsibilities
- [x] Lists requirements
- [x] Mentions benefits (if applicable)
- [x] Clear application instructions

### Location

- [x] Specific city/region
- [x] Country included
- [x] Remote work clearly indicated
- [x] Multiple locations handled correctly

### Salary

- [x] Salary range provided (if available)
- [x] Currency specified
- [x] Period specified (monthly/yearly)
- [x] "Competitive" used if range not available

## ✅ Best Practices

- [x] Unique job identifiers
- [x] Consistent data format
- [x] Regular sitemap updates
- [x] Monitor for broken links
- [x] Track job posting performance
- [x] Update expired jobs promptly
- [x] Maintain data accuracy

## 📋 Pre-Launch Checklist

Before going live, ensure:

1. [ ] All job postings have valid Schema.org markup
2. [ ] Sitemap.xml is accessible and up-to-date
3. [ ] Robots.txt is properly configured
4. [ ] Canonical URLs are set correctly
5. [ ] All job URLs are SEO-friendly
6. [ ] Google Search Console is set up
7. [ ] Sitemap submitted to Google
8. [ ] Rich Results Test passes
9. [ ] Mobile-friendly design verified
10. [ ] Performance metrics meet targets

## 🔍 Ongoing Maintenance

- [ ] Weekly sitemap updates
- [ ] Monthly schema validation
- [ ] Quarterly SEO audit
- [ ] Monitor Google Search Console
- [ ] Track job posting performance
- [ ] Update expired jobs
- [ ] Review and optimize meta descriptions
- [ ] Monitor Core Web Vitals

## 📞 Support Resources

- [Google Jobs Guidelines](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Schema.org JobPosting](https://schema.org/JobPosting)
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Google Search Console](https://search.google.com/search-console)

---

**Last Updated:** 2025-01-XX
**Status:** ✅ Implementation Complete
**Next Review:** Monthly
