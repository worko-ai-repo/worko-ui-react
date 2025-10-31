import React, { useState, useEffect } from "react";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto, JobMatchingScoreDto } from "@Interfaces/JobsAndCompany.dto";
import JobCard from "./Jobcard";
import SkillsCard from "./SkillsCard";
import { formatRange } from "@Utils/RangeFormater.utils";
import { toTitleCase } from "@Utils/Titlecase.utils";

export interface JobDescriptionSubComponentDTO {
  jobData: JobDto;
  applicationStatus: boolean;
  handleApplyClick: () => void;
  jobMatchDetails: JobMatchingScoreDto;
  isProfileCheckComplete: boolean;
}

const CheckCSpresence = async (jobData: JobDto): Promise<JobDto | undefined> => {
  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI;
  try {
    const { response, error } = await httpServiceObj.post<JobDto>(
      `${APP_JOBS_API_URI}/job/parsejd`,
      {
        jobDescription: jobData.jobDescription,
      },
      true,
      {},
      true
    );
    // console.log(response?.technicalSkills)
    if (response) {
      let minExperience = Number(response.experienceRange?.min) || 0;
      let maxExperience = Number(response.experienceRange?.max) || 0;

      // Fix if max is less than min
      if (maxExperience < minExperience) {
        [minExperience, maxExperience] = [maxExperience, minExperience];
      }

      const requestPayload: Record<string, any> = {};

      // Add experienceRange if both values are valid numbers
      if (minExperience != null && maxExperience != null) {
        requestPayload.experienceRange = {
          min: minExperience,
          max: maxExperience,
        };
      }
      // Add salaryRange if either min or max is a number >= 0
      const minSalary = Math.max(Number(response.salaryRange?.min) || 0, 0);
      const maxSalary = Math.max(Number(response.salaryRange?.max) || 0, 0);
      if (minSalary > 0 || maxSalary > 0) {
        requestPayload.salaryRange = {
          min: minSalary,
          max: maxSalary,
        };
      }
      // Add noticePeriod if it's a valid number
      const noticePeriod = Number(response.noticePeriod);
      if (!isNaN(noticePeriod) && noticePeriod > 0) {
        requestPayload.noticePeriod = noticePeriod;
      }
      // Add location only if it's a valid object
      if (
        typeof response.location === "object" &&
        response.location !== null &&
        Object.keys(response.location).length > 0
      ) {
        requestPayload.location = response.location;
      }
      // Add workMode if it's a valid predefined value
      if (["WFH", "WFO", "HYBRID"].includes(response.workMode)) {
        requestPayload.workMode = response.workMode;
      }
      // Add department if non-empty
      if (response.department) {
        requestPayload.department = response.department;
      }
      // Add skills only if arrays have elements
      if (Array.isArray(response.coreSkills) && response.coreSkills.length > 0) {
        requestPayload.coreSkills = response.coreSkills;
      }
      if (Array.isArray(response.softSkills) && response.softSkills.length > 0) {
        requestPayload.softSkills = response.softSkills;
      }
      if (Array.isArray(response.technicalSkills) && response.technicalSkills.length > 0) {
        requestPayload.technicalSkills = response.technicalSkills;
      }

      // console.log('Formatted Payload:', requestPayload);

      const { response: putResponse, error } = await httpServiceObj.put<JobDto>(
        `${APP_JOBS_API_URI}/job/${jobData.id}`,
        requestPayload,
        true,
        {},
        true
      );
      if (putResponse) return putResponse;
    }
  } catch (err) {
    console.error("Error parsing job description:", err);
  }
};

const HeadBanner: React.FC<JobDescriptionSubComponentDTO> = ({
  jobData,
  applicationStatus,
  handleApplyClick,
  jobMatchDetails,
  isProfileCheckComplete,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  const checkSkillsPresence = async () => {
    const missingFields = [];

    if (!jobData?.experienceRange) missingFields.push("experienceRange");
    if (!jobData?.salaryRange) missingFields.push("salaryRange");
    // if (!jobData?.numOfOpenings) missingFields.push('numOfOpenings');
    // if (!jobData?.department) missingFields.push('department');
    if (!jobData?.coreSkills?.length) missingFields.push("coreSkills");
    // if (!jobData?.softSkills?.length) missingFields.push('softSkills');
    // if (!jobData?.technicalSkills?.length) missingFields.push('technicalSkills');

    if (missingFields.length) {
      // console.log('Missing fields:', missingFields.join(', '));
      const newJobData = await CheckCSpresence(jobData);
      if (newJobData) {
        jobData = newJobData;
      }
    }
  };

  useEffect(() => {
    if (!jobData?.externalJobId) {
      checkSkillsPresence(); //@Dont call parseJD API for external jobs
    }
  }, []);

  // Process company name with proper capitalization
  const companyName = jobData.externalJobId ? jobData.companyName : jobData?.companyDetails?.name;
  const titleCasedCompanyName = toTitleCase(companyName!);
  return (
    <div className="p-6 bg-[#316BFF]">
      <div className="max-w-[1350px] mx-auto">
        <div className="mb-4 mt-6">
          <h1 className="text-white text-left text-2xl font-bold">
            {jobData ? `Apply for jobs at ${titleCasedCompanyName} ` : "Apply for this position"}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <JobCard
              jobData={jobData}
              onApply={handleApplyClick}
              isApplying={isApplying}
              applicationStatus={applicationStatus}
              jobMatchDetails={jobMatchDetails}
              isProfileCheckComplete={isProfileCheckComplete}
            />
          </div>

          <div className="lg:w-1/3 flex">
            <SkillsCard
              department={
                jobData?.department || (jobData?.externalJobId ? companyName : jobData?.companyName)
              }
              employmentType={jobData?.typeOfEmployment || jobData?.typeofEmployment}
              salary={
                jobData?.salaryRange
                  ? formatRange(jobData.salaryRange.min, jobData.salaryRange.max, "salary")
                  : formatRange(jobData?.salaryRange?.min, jobData?.salaryRange?.max, "salary")
              }
              showSalary={jobData?.displaySalaryRange ?? true}
              coreSkills={jobData?.coreSkills}
              experience={
                jobData?.experienceRange
                  ? formatRange(
                      jobData.experienceRange.min,
                      jobData.experienceRange.max,
                      "experience"
                    )
                  : formatRange(
                      jobData?.experienceRange?.min,
                      jobData?.experienceRange?.max,
                      "experience"
                    )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadBanner;
