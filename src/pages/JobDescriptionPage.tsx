import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HeadBanner from '@Components/JobDescription/HeadBanner/index';
import JobJD from '@Components/JobDescription/JobJD';
import httpServiceObj from '@Services/ApiHandler.service';
import MainLoader from '@Components/Loader/Loader';
import { CompanyDto, JobDto } from '@Interfaces/JobsAndCompany.dto';

const JobDescription = () => {
  const { jobid } = useParams();
  const [jobDataState, setJobDataState] = useState<JobDto | undefined>(undefined);

const { data: jobData, isLoading, error } = useQuery({
  queryKey: ['jobData', jobid],
  queryFn: async () => {
    const { response, error } = await httpServiceObj.get<JobDto>(
      `https://jobs.dev.worko.work/job/${jobid}`,
      true,
      {},
      true
    );
    
    if (error) throw new Error(error.message);
    return response;
  },
  enabled: !!jobid, // Enable the query when jobId exists
  retry: 0
});

useEffect(() => {
  if (jobData && !jobData.externalJobId) {
    const fetchCompanyDetails = async () => {
      try {
        const { response, error } = await httpServiceObj.get<CompanyDto>(
          `/company/${jobData.companyId}`,
          true,
        );
        
        if (error) throw new Error(error.message);
        if(response)
        setJobDataState({
          ...jobData,
          companyDetails: response
        });
      } catch (fetchError) {
        console.error('Error fetching company details:', fetchError);
      }
    };

    fetchCompanyDetails();
  }
}, [jobData]);

  if (isLoading) return <MainLoader />;
  
  if (error) return <div>Error loading job: {error instanceof Error ? error.message : 'Unknown error'}</div>;

  // Use jobDataState which will be updated from the useEffect
  const displayData = jobDataState || jobData;
  
  if (!displayData) return <div>Loading job data...</div>;

  return (
    <div className='w-full '>
      <HeadBanner {...displayData} />
      <JobJD {...displayData} />
    </div>
  );
};

export default JobDescription;