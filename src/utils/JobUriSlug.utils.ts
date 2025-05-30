// slugUtils.ts

/**
 * Safely converts any string to a URL-friendly slug.
 * Replaces whitespace with hyphens and encodes URI components.
 */
export const toSlug = (text: string): string =>
    encodeURIComponent(text.trim().replace(/\s+/g, "-"));
  
  /**
   * Generates a full job slug for navigation URLs.
   * 
   * Example:
   *   /jobs/Senior-Engineer-OpenAI-San-Francisco-2-5-years/123
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
    // const slug = `/jobs/${toSlug(title)}-${toSlug(company)}-${toSlug(location)}-${toSlug(experience)}/${jobId}`;
    const slug = `/jobs/${toSlug(company)}/${jobId}`;
    return slug;
  };
  