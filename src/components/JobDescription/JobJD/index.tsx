import React, { useState, useEffect } from "react";
import httpServiceObj from "@Services/ApiHandler.service";
import JobDetails from "./JobDetails";
import SimilarJobs from "./SimilarJobs";
import { JobDto } from "@Interfaces/JobsAndCompany.dto";
import { JobDescriptionSubComponentDTO } from "../HeadBanner";
import { SimilarJobsSkeleton } from "@Components/Loader/Skeleton/SkeletonLoader";

const JobJD: React.FC<JobDescriptionSubComponentDTO> = ({
  jobData,
  applicationStatus,
  handleApplyClick,
  jobMatchDetails,
  isProfileCheckComplete,
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI;

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (jobData && jobData.id) {
        setIsLoading(true);
        try {
          // First try to fetch similar jobs from the similar-jobs endpoint
          const { response, error: similarJobsError } = await httpServiceObj.get(
            `${APP_JOBS_API_URI}/job/`,
            true,
            {
              jobTitle: jobData.jobTitle,
              status: "PUBLISHED",
              pageSize: 10,
            },
            true
          );

          let similarJobsResponse = (response as { data: any[] }).data;
          if (
            !similarJobsError &&
            Array.isArray(similarJobsResponse) &&
            similarJobsResponse.length > 0
          ) {
            setSimilarJobs(similarJobsResponse);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching similar jobs:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSimilarJobs();
  }, [jobData?.id, jobData?.jobTitle]);

  // Only use fallback jobs if no similar jobs were found and we're not loading
  const displayedSimilarJobs = isLoading
    ? []
    : similarJobs.length > 0
    ? similarJobs
    : [
        {
          id: jobData?.id || "fallback1",
          jobTitle: jobData?.jobTitle,
          companyName: jobData?.companyName,
          location: jobData?.location,
          department: jobData?.department,
          experienceRange: jobData?.experienceRange,
          isNew: true,
          companyLogoUrl: jobData?.logoUrl,
        },
      ];

  return (
    <div className="flex flex-col text-left md:flex-row md:justify-between py-5 bg-white min-h-screen max-w-[1350px] mx-auto ">
      <div className="w-full md:w-[67%]">
        <JobDetails
          job={jobData}
          isApplying={isApplying}
          applicationStatus={applicationStatus}
          onApply={handleApplyClick}
          jobMatchDetails={jobMatchDetails}
          isProfileCheckComplete={isProfileCheckComplete}
        />
      </div>
      <div className="w-full md:w-[33%]">
        {isLoading ? (
          <SimilarJobsSkeleton />
        ) : (
          <SimilarJobs similarJobs={displayedSimilarJobs} onApply={handleApplyClick} />
        )}
      </div>
    </div>
  );
};

export default JobJD;
