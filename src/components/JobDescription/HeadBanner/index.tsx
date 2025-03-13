import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto, JobMatchingScoreDto } from "@Interfaces/JobsAndCompany.dto";
import JobCard from "./Jobcard";
import SkillsCard from "./SkillsCard";
import { formatRange } from "@Utils/RangeFormater.utils";

export interface JobDescriptionSubComponentDTO {
  jobData: JobDto;
  applicationStatus: boolean;
  handleApplyClick: () => void;
}

const HeadBanner: React.FC<JobDescriptionSubComponentDTO> = ({
  jobData,
  applicationStatus,
  handleApplyClick,
}) => {
  const { jobid } = useParams();
  const [score, setScore] = useState<number | undefined>(undefined);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchMatchingScore = async () => {
      if (!jobid) return;
      try {
        const { response, error } = await httpServiceObj.get<{
          data: [JobMatchingScoreDto];
          pagination: Object;
        }>(
          `https://jobs.dev.worko.work/user-matching-score-job/?jobIds=${jobid}&pageSize=1`,
          true,
          {},
          true
        );

        if (response?.data?.[0]) {
          setScore(response.data[0].matchingScore);
        }
      } catch (err) {
        console.error("Error fetching matching score:", err);
      }
    };

    fetchMatchingScore();
  }, [jobid]);

  // Process company name with proper capitalization
  const companyName = jobData?.companyName 
    ? jobData.companyName.charAt(0).toUpperCase() + jobData.companyName.slice(1).toLowerCase()
    : "";

    return (
      <div className="p-6 bg-[#316BFF]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-4 mt-6">
            <h1 className="text-white text-left text-2xl font-bold">
              {jobData
                ? `Apply for jobs at ${
                    jobData.externalJobId
                      ? (companyName ?? 'Company').charAt(0).toUpperCase() + (companyName ?? 'Company').slice(1).toLocaleLowerCase()
                      : (jobData.companyName ?? 'Company').charAt(0).toUpperCase() + (jobData.companyName ?? 'Company').slice(1).toLocaleLowerCase() || ""
                  }`
                : "Apply for this position"}
            </h1>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <JobCard
                jobData={jobData}
                onApply={handleApplyClick}
                isApplying={isApplying}
                applicationStatus={applicationStatus}
              />
            </div>
    
            <div className="lg:w-1/3 flex">
              <SkillsCard
                department={
                  jobData && jobData.externalJobId
                    ? companyName
                    : jobData?.companyName
                }
                employmentType={jobData?.typeofEmployment}
                salary={formatRange(
                  jobData?.salaryRange?.min,
                  jobData?.salaryRange?.max,
                  "salary"
                )}
                coreSkills={
                  jobData && jobData.externalJobId
                    ? [
                        companyName || "",
                        jobData?.location?.fullLocation?.join(", ") || "",
                      ]
                    : jobData?.coreSkills?.map((skill) =>
                        typeof skill === "string"
                          ? skill
                          : (skill as any).fullLocation.join(", ")
                      )
                }
                experience={formatRange(
                  jobData?.experienceRange?.min,
                  jobData?.experienceRange?.max,
                  "experience"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    );
};

export default HeadBanner;