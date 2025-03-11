export interface BaseJobData {
    id: string;
    jobTitle?: string;
    jobDescription?: string;
    location?: string;
    status?: string;
    workMode?: string;
    typeofEmployment?: string;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
    matchPercentage?: number;
    companyLogoUrl?: string;
    companyName?: string;
  }
  
  export interface InternalJobData extends BaseJobData {
    companyId?: string;
    otherRequirements?: string;
    experienceRange?: {
      min?: number;
      max?: number;
    };
    noticePeriod?: number;
    numOfOpenings?: number;
    salaryRange?: {
      min?: number;
      max?: number;
    };
    department?: string;
    coreSkills?: string[];
    softSkills?: string[];
    technicalSkills?: string[];
    miscellaneousSkills?: string[];
    createdByUserId?: string;
  }
  
  export interface ExternalJobData extends BaseJobData {
    externalJobId: string;
    jobPostedDate?: string;
    jobCreatedDate?: string;
    jobUrl?: string;
    companyName?: string;
    companyUrl?: string;
  }
  
  export type JobData = InternalJobData | ExternalJobData;
  
  
  export interface HeadBannerProps {
    jobData?: JobData;
  }