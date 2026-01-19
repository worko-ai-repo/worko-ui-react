import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto, GlobalApiQueryResponseDto } from "@Interfaces/JobsAndCompany.dto";
import { generateCompleteSitemap } from "@Utils/SitemapGenerator.utils";

/**
 * Sitemap page that generates XML sitemap dynamically
 * This should be served at /sitemap.xml
 * 
 * Note: For production, this should ideally be a server-side route
 * that generates the sitemap on-demand or via a cron job.
 */
const SitemapPage = () => {
  const baseUrl = import.meta.env.APP_WORKO_BASE_URL || window.location.origin;
  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI;

  const [sitemapXml, setSitemapXml] = useState<string>("");

  // Fetch all published jobs
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["sitemapJobs"],
    queryFn: async () => {
      let allJobs: JobDto[] = [];
      let lastKey: string | undefined = undefined;
      const pageSize = 100; // Fetch in batches

      do {
        const { response, error } = await httpServiceObj.get<
          GlobalApiQueryResponseDto<JobDto>
        >(
          `${APP_JOBS_API_URI}/job/`,
          true,
          {
            status: "PUBLISHED",
            pageSize,
            lastKey,
            includeCompanyDetails: false,
          },
          true
        );

        if (error) throw error;
        if (response?.data) {
          allJobs = [...allJobs, ...response.data];
          lastKey = response.pagination?.lastKey;
        } else {
          break;
        }
      } while (lastKey);

      return allJobs;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (jobsData) {
      const xml = generateCompleteSitemap(jobsData, baseUrl);
      setSitemapXml(xml);
    }
  }, [jobsData, baseUrl]);

  if (isLoading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Generating sitemap...</p>
      </div>
    );
  }

  // Return XML content
  return (
    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
      {sitemapXml || "Loading sitemap..."}
    </pre>
  );
};

export default SitemapPage;
