// slugUtils.ts

/**
 * Safely converts any string to a URL-friendly slug.
 * Removes special characters, converts to lowercase, and replaces spaces with hyphens.
 */
export const toSlug = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Generates a keyword-rich job slug for SEO-friendly URLs.
 * Format: /jobs/job-title-company-name-location-experience-years
 * 
 * Example:
 *   /jobs/senior-software-engineer-google-bangalore-5-8-years
 */
export const generateJobSlug = ({
  title,
  company,
  location,
  experience,
  jobId,
}: {
  title: string;
  company: string;
  location: string;
  experience: string;
  jobId: string | number;
}): string => {
  const titleSlug = toSlug(title);
  const companySlug = toSlug(company);
  const locationSlug = toSlug(location);
  const experienceSlug = toSlug(experience);
  
  // Build keyword-rich slug: title-company-location-experience
  const slugParts = [titleSlug, companySlug, locationSlug, experienceSlug]
    .filter(Boolean)
    .join("-");
  
  // Ensure slug is not too long (max 100 chars for SEO)
  const maxLength = 100;
  const finalSlug = slugParts.length > maxLength 
    ? slugParts.substring(0, maxLength).replace(/-+$/, "")
    : slugParts;
  
  return `/jobs/${finalSlug}`;
};

/**
 * Extracts job ID from a slug-based URL or returns the slug itself.
 * This is a helper for backward compatibility during migration.
 */
export const extractJobIdFromSlug = (slug: string): string | null => {
  // If slug contains a numeric ID at the end (old format), extract it
  const match = slug.match(/\/(\d+)$/);
  return match ? match[1] : null;
};

/**
 * Generates a canonical slug from job data.
 * Used for creating consistent URLs across the application.
 */
export const generateCanonicalJobSlug = (job: {
  jobTitle: string;
  companyName?: string;
  companyDetails?: { name: string };
  location?: { fullLocation?: string[] };
  experienceRange?: { min: number; max: number };
  id: string;
}): string => {
  const companyName = job.companyName || job.companyDetails?.name || "company";
  const location = job.location?.fullLocation?.join("-") || "location";
  const experience = job.experienceRange
    ? `${job.experienceRange.min}-${job.experienceRange.max}-years`
    : "experience";
  
  return generateJobSlug({
    title: job.jobTitle,
    company: companyName,
    location: location,
    experience: experience,
    jobId: job.id,
  });
};

/**
 * Generates a slug string (without /jobs/ prefix) from job data.
 * Used for URL matching and comparison.
 */
export const generateSlugFromJob = (job: {
  jobTitle: string;
  companyName?: string;
  companyDetails?: { name: string };
  location?: { fullLocation?: string[] };
  experienceRange?: { min: number; max: number };
}): string => {
  const companyName = job.companyName || job.companyDetails?.name || "company";
  const location = job.location?.fullLocation?.join("-") || "location";
  const experience = job.experienceRange
    ? `${job.experienceRange.min}-${job.experienceRange.max}-years`
    : "experience";
  
  const titleSlug = toSlug(job.jobTitle);
  const companySlug = toSlug(companyName);
  const locationSlug = toSlug(location);
  const experienceSlug = toSlug(experience);
  
  const slugParts = [titleSlug, companySlug, locationSlug, experienceSlug]
    .filter(Boolean)
    .join("-");
  
  const maxLength = 100;
  return slugParts.length > maxLength 
    ? slugParts.substring(0, maxLength).replace(/-+$/, "")
    : slugParts;
};
  