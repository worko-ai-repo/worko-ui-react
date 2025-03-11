import React, { useState, useEffect } from 'react';
import httpServiceObj from '@Services/ApiHandler.service';
import JobDetails from './JobDetails';
import SimilarJobs from './SimilarJobs';
import { JobDto } from '@Interfaces/JobsAndCompany.dto';
import { JobDescriptionSubComponentDTO } from '../HeadBanner';

const JobJD: React.FC<JobDescriptionSubComponentDTO>  = ({ jobData, applicationStatus, handleApplyClick }) => {

  const [isApplying, setIsApplying] = useState(false);
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (jobData && jobData.id) {
        setIsLoading(true);
        try {
          // First try to fetch similar jobs from the similar-jobs endpoint
          const { response, error: similarJobsError } = await httpServiceObj.get(
            `https://jobs.dev.worko.work/job/?jobTitle=${jobData.jobTitle}&pageSize=10`,
            true,
            {},
            true
          );
          
          let similarJobsResponse = (response as { data: any[] }).data;
          if (!similarJobsError && Array.isArray(similarJobsResponse) && similarJobsResponse.length > 0) {
            setSimilarJobs(similarJobsResponse);
            console.log(similarJobsResponse)
            setIsLoading(false);
            return;
          }
         
          
        } catch (error) {
          console.error('Error fetching similar jobs:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchSimilarJobs();
  }, []);

  



  // Only use fallback jobs if no similar jobs were found and we're not loading
  const displayedSimilarJobs = isLoading ? [] : (
    similarJobs.length > 0 ? similarJobs : [
      {
        id: jobData.id || "fallback1",
        jobTitle: jobData.jobTitle || jobData.jobTitle,
        companyName: jobData.companyName ,
        location: jobData.location,
        department: jobData.department,
        experienceRange: jobData.experienceRange,
        isNew: true,
        companyLogoUrl: jobData.logoUrl ,
      }
    ]
  );

  

  return (
    <div className="flex flex-col text-left md:flex-row   py-5  gap-2 bg-white min-h-screen max-w-[1280px] mx-auto">
      <JobDetails 
        job={jobData}
        isApplying={isApplying}
        applicationStatus={applicationStatus}
        onApply={() => handleApplyClick()}
      />
      {isLoading ? (
        <div className="w-full md:w-[37%] flex justify-center items-center">
          <p>Loading similar jobs...</p>
        </div>
      ) : (
        <SimilarJobs 
          similarJobs={displayedSimilarJobs}
          onApply={handleApplyClick}
        />
      )}
    </div>
  );
};

export default JobJD;