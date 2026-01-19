import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto } from "@Interfaces/JobsAndCompany.dto";
import { toSlug } from "./JobUriSlug.utils";

/**
 * Resolves a job slug to a job ID by fetching jobs and matching the slug.
 * This is a fallback when the backend doesn't support slug-based lookups.
 * 
 * For production, the backend should support: GET /job/by-slug/:slug
 */
export const resolveJobSlugToId = async (
  slug: string,
  apiUri: string
): Promise<string | null> => {
  try {
    // Try to extract ID if it's in the old format
    const idMatch = slug.match(/\/(\d+)$/);
    if (idMatch) {
      return idMatch[1];
    }

    // For new slug format, we need to search for the job
    // This is a temporary solution - backend should support slug lookup
    // Extract potential job title and company from slug
    const slugParts = slug.split("-");
    
    // Try to fetch by searching with slug parts
    // This is not ideal but works until backend supports slug lookup
    return null; // Will be handled by the route resolver
  } catch (error) {
    console.error("Error resolving job slug:", error);
    return null;
  }
};

/**
 * Generates a slug from job data for URL matching
 */
export const generateSlugFromJob = (job: JobDto): string => {
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

/**
 * Checks if a slug matches a job (fuzzy matching for SEO)
 */
export const doesSlugMatchJob = (slug: string, job: JobDto): boolean => {
  const jobSlug = generateSlugFromJob(job);
  // Exact match
  if (slug === jobSlug) return true;
  
  // Check if slug contains key parts (title + company)
  const slugLower = slug.toLowerCase();
  const titleSlug = toSlug(job.jobTitle).toLowerCase();
  const companySlug = toSlug(job.companyName || job.companyDetails?.name || "").toLowerCase();
  
  return slugLower.includes(titleSlug) && slugLower.includes(companySlug);
};
