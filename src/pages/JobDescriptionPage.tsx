import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import HeadBanner from '@Components/JobDescription/HeadBanner/index';
import JobJD from '@Components/JobDescription/JobJD';
import httpServiceObj from '@Services/ApiHandler.service';
import MainLoader from '@Components/Loader/Loader';

const JobDescription = () => {
  const { jobid } = useParams();
  const [jobDataState, setJobDataState] = useState<any>(null);
  
  const { data: jobData, isLoading, error, refetch } = useQuery({
    queryKey: ['jobData', jobid],
    queryFn: async () => {
      const { response, error } = await httpServiceObj.get(
        `https://jobs.dev.worko.work/job/${jobid}`,
        true,
        {},
        true
      );
      
      if (error) throw new Error(error.message);
      return response;
    },
    enabled: !!jobid // Enable the query when jobId exists
  });
  
  useEffect(() => {
    console.log(jobid);
    if (jobData) {
      setJobDataState(jobData);
    }
  }, [jobData, jobid]); // Only depend on jobData changes
  
  if (isLoading) return <MainLoader />;
  
  if (error) return <div>Error loading job: {error instanceof Error ? error.message : 'Unknown error'}</div>;

  // Use jobDataState which will be updated from the useEffect
  const displayData = jobDataState || jobData;
  
  if (!displayData) return <div>Loading job data...</div>;

  return (
    <div className='w-full'>
      <HeadBanner jobData={displayData} />
      <JobJD jobData={displayData} />
    </div>
  );
};

export default JobDescription;