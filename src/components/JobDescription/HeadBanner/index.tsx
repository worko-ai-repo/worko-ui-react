import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import httpServiceObj from '@Services/ApiHandler.service';
import { JobMatchingScoreDto } from '@Interfaces/JobsAndCompany.dto';
import JobCard from './Jobcard';
import SkillsCard from './SkillsCard';
import { HeadBannerProps, isExternalJob } from './types';
import { getFormattedSalary, getFormattedExperience } from './utils';

const HeadBanner: React.FC<HeadBannerProps> = ({ jobData }) => {
  const { jobid } = useParams();
  const [score, setScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchMatchingScore = async () => {
      if (!jobid) return;
      try {
        const { response, error } = await httpServiceObj.get<{data:[JobMatchingScoreDto], pagination:Object}>(
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

  return (
    <div className="p-6 bg-[#316BFF]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
        <div className="lg:col-span-2 max-w-[830px] lg:ml-0 xl:ml-16 flex flex-col gap-6">
          <div className="grid grid-cols-1 mb-0 mt-6">
            <h1 className="text-white text-2xl text-left font-bold md:mb-0">
              {jobData ? 
                `Apply for jobs at ${isExternalJob(jobData) ? 
                  jobData.companyName : 
                  jobData.department}` : 
                'Apply for this position'}
            </h1>
          </div>
          
          <JobCard jobData={jobData} />
        </div>
      
        <div className="flex flex-col pt-20">
          <SkillsCard 
            department={jobData && isExternalJob(jobData) ? 
              jobData.companyName : 
              jobData?.department}
            employmentType={jobData?.typeofEmployment}
            salary={getFormattedSalary(jobData)}
            coreSkills={jobData && isExternalJob(jobData) ? 
              [jobData?.companyName || '', jobData?.location || ''] : 
              jobData?.coreSkills}
            experience={getFormattedExperience(jobData)}
          />
        </div>
      </div>
    </div>
  );
};

export default HeadBanner;