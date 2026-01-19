import { JobDto } from "@Interfaces/JobsAndCompany.dto";
import { generateCanonicalJobSlug } from "./JobUriSlug.utils";

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Generates XML sitemap content
 */
export const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const urlEntries = urls.map((url) => {
    const lastmod = url.lastmod ? `\n      <lastmod>${url.lastmod}</lastmod>` : "";
    const changefreq = url.changefreq ? `\n      <changefreq>${url.changefreq}</changefreq>` : "";
    const priority = url.priority !== undefined ? `\n      <priority>${url.priority}</priority>` : "";
    
    return `    <url>
      <loc>${escapeXml(url.loc)}</loc>${lastmod}${changefreq}${priority}
    </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

/**
 * Escapes XML special characters
 */
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Generates sitemap URLs for jobs
 */
export const generateJobSitemapUrls = (
  jobs: JobDto[],
  baseUrl: string
): SitemapUrl[] => {
  const now = new Date().toISOString();
  
  return jobs
    .filter((job) => job.status === "PUBLISHED" && !job.isDeleted)
    .map((job) => {
      const slug = generateCanonicalJobSlug(job);
      const lastmod = job.updatedAt || job.createdAt || now;
      
      return {
        loc: `${baseUrl}${slug}`,
        lastmod: formatDateForSitemap(lastmod),
        changefreq: "weekly" as const,
        priority: 0.8,
      };
    });
};

/**
 * Generates sitemap URLs for static pages
 */
export const generateStaticPageUrls = (baseUrl: string): SitemapUrl[] => {
  const now = new Date().toISOString();
  
  return [
    {
      loc: `${baseUrl}/`,
      lastmod: formatDateForSitemap(now),
      changefreq: "daily" as const,
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/jobs`,
      lastmod: formatDateForSitemap(now),
      changefreq: "hourly" as const,
      priority: 1.0,
    },
    {
      loc: `${baseUrl}/referrals`,
      lastmod: formatDateForSitemap(now),
      changefreq: "daily" as const,
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/for-employee`,
      lastmod: formatDateForSitemap(now),
      changefreq: "weekly" as const,
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/corporate`,
      lastmod: formatDateForSitemap(now),
      changefreq: "weekly" as const,
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/corporate/connect-with-us`,
      lastmod: formatDateForSitemap(now),
      changefreq: "monthly" as const,
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/about`,
      lastmod: formatDateForSitemap(now),
      changefreq: "monthly" as const,
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/faq`,
      lastmod: formatDateForSitemap(now),
      changefreq: "monthly" as const,
      priority: 0.7,
    },
    {
      loc: `${baseUrl}/guidance`,
      lastmod: formatDateForSitemap(now),
      changefreq: "weekly" as const,
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/terms`,
      lastmod: formatDateForSitemap(now),
      changefreq: "yearly" as const,
      priority: 0.5,
    },
    {
      loc: `${baseUrl}/privacy-policy`,
      lastmod: formatDateForSitemap(now),
      changefreq: "yearly" as const,
      priority: 0.5,
    },
    {
      loc: `${baseUrl}/contact-us`,
      lastmod: formatDateForSitemap(now),
      changefreq: "monthly" as const,
      priority: 0.6,
    },
  ];
};

/**
 * Formats date for sitemap (ISO 8601 format)
 */
const formatDateForSitemap = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
};

/**
 * Generates complete sitemap with all URLs
 */
export const generateCompleteSitemap = (
  jobs: JobDto[],
  baseUrl: string
): string => {
  const staticUrls = generateStaticPageUrls(baseUrl);
  const jobUrls = generateJobSitemapUrls(jobs, baseUrl);
  const allUrls = [...staticUrls, ...jobUrls];
  
  return generateSitemapXML(allUrls);
};
