import { JobDto } from "@Interfaces/JobsAndCompany.dto";

/**
 * Generates Schema.org JobPosting JSON-LD following Google Jobs guidelines
 * https://developers.google.com/search/docs/appearance/structured-data/job-posting
 */
export const generateJobPostingSchema = (job: JobDto, baseUrl: string): object => {
  const companyName = job.companyName || job.companyDetails?.name || "Company";
  const jobLocation = job.location?.fullLocation?.join(", ") || "Location not specified";
  const jobTitle = job.jobTitle || "Job Title";
  const jobDescription = job.jobDescription || job.htmlJobDescription || "";
  
  // Clean HTML from description for text content
  const textDescription = jobDescription
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .substring(0, 5000); // Max 5000 chars for description

  // Build job URL
  const jobUrl = `${baseUrl}/jobs/${job.id}`; // Will be updated to use slug

  // Build datePosted - use jobPostedDate or createdAt
  const datePosted = job.jobPostedDate || job.createdAt || job.jobCreatedDate || new Date().toISOString();
  
  // Build validThrough - typically 30 days from posting or use updatedAt + 30 days
  const validThrough = job.updatedAt 
    ? new Date(new Date(job.updatedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(new Date(datePosted).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Employment type
  const employmentType = job.typeOfEmployment || job.typeofEmployment || "FULL_TIME";
  
  // Base salary
  const baseSalary = job.salaryRange
    ? {
        "@type": "MonetaryAmount",
        currency: "INR", // Default to INR, should be configurable
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salaryRange.min,
          maxValue: job.salaryRange.max,
          unitText: "MONTH", // or "YEAR" based on your system
        },
      }
    : undefined;

  // Experience requirements
  const experienceRequirements = job.experienceRange
    ? {
        "@type": "OccupationalExperienceRequirements",
        monthsOfExperience: {
          "@type": "QuantitativeValue",
          minValue: job.experienceRange.min * 12,
          maxValue: job.experienceRange.max * 12,
          unitText: "MONTH",
        },
      }
    : undefined;

  // Skills
  const skills = [
    ...(job.coreSkills || []),
    ...(job.technicalSkills || []),
    ...(job.softSkills || []),
  ].filter(Boolean);

  // Work location
  const workLocation = {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: job.location?.city?.join(", ") || "",
      addressRegion: job.location?.state?.join(", ") || "",
      addressCountry: job.location?.country?.join(", ") || "IN",
    },
  };

  // Hiring organization
  const hiringOrganization = {
    "@type": "Organization",
    name: companyName,
    sameAs: job.companyDetails?.linkedIn || job.linkedIn || "",
    logo: job.companyDetails?.logoUrl || job.companyLogoUrl || "",
  };

  // Build the schema
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobTitle,
    description: textDescription,
    identifier: {
      "@type": "PropertyValue",
      name: companyName,
      value: job.id,
    },
    datePosted: datePosted,
    validThrough: validThrough,
    employmentType: employmentType,
    hiringOrganization: hiringOrganization,
    jobLocation: workLocation,
    baseSalary: baseSalary,
    jobLocationType: job.workMode === "REMOTE" ? "TELECOMMUTE" : "ONSITE",
  };

  // Add optional fields
  if (experienceRequirements) {
    schema.experienceRequirements = experienceRequirements;
  }

  if (skills.length > 0) {
    schema.skills = skills.join(", ");
  }

  if (job.department) {
    schema.industry = job.department;
  }

  if (job.numOfOpenings) {
    schema.numberOfOpenings = job.numOfOpenings;
  }

  if (job.workMode) {
    schema.workMode = job.workMode;
  }

  // Add application instructions
  schema.applicationContact = {
    "@type": "ContactPoint",
    contactType: "HR",
    email: "contact@worko.ai", // Update with actual contact
    url: jobUrl,
  };

  return schema;
};

/**
 * Generates Organization schema for company pages
 */
export const generateOrganizationSchema = (company: {
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  linkedIn?: string;
  industry?: string;
}, baseUrl: string): object => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description || `${company.name} - Find jobs and career opportunities`,
    logo: company.logoUrl || "",
    url: company.website || baseUrl,
    sameAs: company.linkedIn ? [company.linkedIn] : [],
    industry: company.industry || "",
  };
};

/**
 * Generates BreadcrumbList schema for navigation
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>): object => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};
