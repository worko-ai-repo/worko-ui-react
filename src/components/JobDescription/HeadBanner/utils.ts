/* import { JobData, isExternalJob } from './types';

export const getFormattedSalary = (jobData?: JobData): string => {
  if (!jobData) return "Not Disclosed";
  
  if (isExternalJob(jobData)) {
    return "Not Disclosed";
  } else {
    if (jobData.salaryRange?.min && jobData.salaryRange?.max) {
      return `${jobData.salaryRange.min.toLocaleString()} - ${jobData.salaryRange.max.toLocaleString()}`;
    }
    return "Not Disclosed";
  }
};

export const getFormattedExperience = (jobData?: JobData): string => {
  if (!jobData) return "Not Specified";
  
  if (isExternalJob(jobData)) {
    return "Not Specified";
  } else {
    if (jobData.experienceRange?.min && jobData.experienceRange?.max) {
      return `${jobData.experienceRange.min} - ${jobData.experienceRange.max} Years`;
    }
    return "Not Specified";
  }
}; */