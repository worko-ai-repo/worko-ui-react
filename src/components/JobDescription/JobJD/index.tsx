import React, { useState, useEffect } from 'react';
import httpServiceObj from '@Services/ApiHandler.service';
import JobDetails from './JobDetails';
import SimilarJobs from './SimilarJobs';

const JobJD = (jobData: any) => {
  const job = jobData || {};
  const similarJob = job.jobData
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (similarJob && similarJob.id) {
        setIsLoading(true);
        try {
          // First try to fetch similar jobs from the similar-jobs endpoint
          const { response, error: similarJobsError } = await httpServiceObj.get(
            `https://jobs.dev.worko.work/job/?jobTitle=${similarJob.jobTitle}&pageSize=10`,
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

  const handleApplyJob = async (jobToApply = job.jobData) => {
    try {
      setIsApplying(true);
      setApplicationStatus(null);
      console.log(jobToApply);
      
      const payload = {
        jobId: jobToApply.id,
        jobUrl: window.location.href,
        jobPortal: jobToApply.jobPortal || undefined,
        matchingScore: jobToApply.matchingScore || undefined,
        ...((!jobToApply.externalJobId && { companyName: jobToApply.companyName || jobToApply.company }))
      };
      
      const endpoint = jobToApply.externalJobId 
        ? 'https://jobs.dev.worko.work/external-job-application/' 
        : 'https://jobs.dev.worko.work/job-application/';
      
      const { response, error } = await httpServiceObj.post(
        endpoint,
        payload,
        true,
        {},
        true
      );
      
      if (error) {
        throw new Error(error.message || 'Failed to submit application');
      }
      
      setApplicationStatus({
        success: true,
        message: 'Application submitted successfully!',
      });
    } catch (error) {
      console.error('Application error:', error);
      setApplicationStatus({
        success: false,
        message: 'Failed to submit application. Please try again.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Only use fallback jobs if no similar jobs were found and we're not loading
  const displayedSimilarJobs = isLoading ? [] : (
    similarJobs.length > 0 ? similarJobs : [
      {
        id: job.id || "fallback1",
        jobTitle: job.title || job.jobTitle,
        companyName: job.companyName || job.company,
        location: job.location,
        department: job.department,
        experienceRange: job.experienceRange,
        isNew: true,
        companyLogoUrl: job.companyLogo || job.companyLogoUrl,
      }
    ]
  );

  return (
    <div className="flex flex-col text-left md:flex-row   py-5  gap-2 bg-white min-h-screen max-w-[1280px] mx-auto">
      <JobDetails 
        job={job}
        isApplying={isApplying}
        applicationStatus={applicationStatus}
        onApply={() => handleApplyJob()}
      />
      {isLoading ? (
        <div className="w-full md:w-[37%] flex justify-center items-center">
          <p>Loading similar jobs...</p>
        </div>
      ) : (
        <SimilarJobs 
          similarJobs={displayedSimilarJobs}
          onApply={handleApplyJob}
        />
      )}
    </div>
  );
};

export default JobJD;