import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto, JobMatchingScoreDto } from "@Interfaces/JobsAndCompany.dto";
import JobCard from "./Jobcard";
import SkillsCard from "./SkillsCard";
import { formatRange } from "@Utils/RangeFormater.utils";

// Interface for parsed job description
interface ParsedJobDescription extends JobDto {
}

export interface JobDescriptionSubComponentDTO {
  jobData: JobDto;
  applicationStatus: boolean;
  handleApplyClick: () => void;
  jobMatchDetails?:JobMatchingScoreDto;
}

const CheckCSpresence = async(jobData: JobDto): Promise<JobDto | undefined> => {
  try {
    const { response, error } = await httpServiceObj.post<JobDto>(
      `https://jobs.dev.worko.work/job/parsejd`,
      {
        jobDescription: jobData.jobDescription
      },
      true,
      {},
      true
    );
    console.log(response?.technicalSkills)
    if (response) {
      let minExperience = Number(response.experienceRange?.min) || 0;
    let maxExperience = Number(response.experienceRange?.max) || 0;

    // Fix if max is less than min
    if (maxExperience < minExperience) {
      [minExperience, maxExperience] = [maxExperience, minExperience];
    }

    const requestPayload = {
      experienceRange: {
        min: minExperience,
        max: maxExperience,
      },
      salaryRange: {
        min: Math.max(Number(response.salaryRange?.min) || 0, 0),
        max: Math.max(Number(response.salaryRange?.max) || 0, 0),
      },
      noticePeriod: Number(response.noticePeriod) || 0,
      location: typeof response.location === 'object' ? response.location : {},
      workMode: ['WFH', 'WFO', 'HYBRID'].includes(response.workMode)
        ? response.workMode
        : undefined,
      department: response.department,
      coreSkills: response.coreSkills || [],
      softSkills: response.softSkills || [],
      technicalSkills: response.technicalSkills || [],
    };

    console.log('Formatted Payload:', requestPayload);

    const { response: putResponse, error } = await httpServiceObj.put<JobDto>(
      `https://jobs.dev.worko.work/job/${jobData.id}`,
      requestPayload,
      true,
      {},
      true
    );
    if(putResponse) return putResponse;
    }
  } catch (err) {
    console.error("Error parsing job description:", err);
  }
}

const HeadBanner: React.FC<JobDescriptionSubComponentDTO> = ({
  jobData,
  applicationStatus,
  handleApplyClick,
  jobMatchDetails,
}) => {

  const [isApplying, setIsApplying] = useState(false);
  
  const checkSkillsPresence = async () => {
    const missingFields = [];
  
    if (!jobData?.experienceRange) missingFields.push('experienceRange');
    if (!jobData?.salaryRange) missingFields.push('salaryRange');
    // if (!jobData?.numOfOpenings) missingFields.push('numOfOpenings');
    // if (!jobData?.department) missingFields.push('department');
    if (!jobData?.coreSkills?.length) missingFields.push('coreSkills');
    // if (!jobData?.softSkills?.length) missingFields.push('softSkills');
    // if (!jobData?.technicalSkills?.length) missingFields.push('technicalSkills');
  
    if (missingFields.length) {
      console.log('Missing fields:', missingFields.join(', '));
  
      const newJobData = await CheckCSpresence(jobData);
      if (newJobData) {
        jobData = newJobData;
      }
    }
  };
  

  useEffect(() => {
    checkSkillsPresence();
  }, []);
  
  // Process company name with proper capitalization
  const companyName = jobData?.companyName 
    ? jobData.companyName.charAt(0).toUpperCase() + jobData.companyName.slice(1).toLowerCase()
    : "";

  return (
    <div className="p-6 bg-[#316BFF]">
      <div className="max-w-[1350px] mx-auto">
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
              jobMatchDetails={jobMatchDetails}
            />
          </div>
  
          <div className="lg:w-1/3 flex">
            <SkillsCard
              department={jobData?.department || (jobData?.externalJobId ? companyName : jobData?.companyName)}
              employmentType={jobData?.typeOfEmployment || jobData?.typeofEmployment}
              salary={jobData?.salaryRange 
                ? formatRange(
                    jobData.salaryRange.min,
                    jobData.salaryRange.max,
                    "salary"
                  )
                : formatRange(
                    jobData?.salaryRange?.min,
                    jobData?.salaryRange?.max,
                    "salary"
                  )
              }
              coreSkills={jobData?.coreSkills}
              experience={jobData?.experienceRange
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