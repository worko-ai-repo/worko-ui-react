export type JobFormSchema = {
  jobTitle: string;
  company: string;
  offerings: string;
  gradeLevel?: string;
  department?: string;
  workMode: string;
  location: string;
  experienceFrom: string;
  experienceTo: string;
  creatorName?: string;
  salaryFrom: string;
  salaryTo: string;
  coreSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  goodSkills: string[];
  otherRequirements?: string;
  typeOfEmployment: string;
  description: string;
};

export interface JobApiResponse {
  data: JobData[];
  pagination: {
    count: number;
    pageSize: number;
    key: string;
  };
}

export interface JobData {
  status: string;
  companyId: string;
  coreSkills: string[];
  department: string;
  experienceRange: {
    min: number;
    max: number;
  };
  jobTitle: string;
  htmlJobDescription: string;
  location: {
    city: string[];
    fullLocation: string[];
    state: string[];
    country: string[];
  };
  miscellaneousSkills: string[];
  numOfOpenings: number;
  noticePeriod: number;
  otherRequirements: string;
  salaryRange: {
    min: number;
    max: number;
  };
  softSkills: string[];
  technicalSkills: string[];
  typeofEmployment: string;
  workMode: string;
  jobDescription: string;
  createdByCorporateUserId: string;
  companyName: string;
  companyUrl: string;
  companyLogoUrl: string;
  id: string;
  jobUrl: string;
  sourcedFrom: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  updatedByCorporateUserId: string;
  companyDetails: CompanyDetails;
}

interface CompanyDetails {
  website: string;
  linkedIn: string;
  industry: string;
  logoUrl: string;
  createdAt: string;
  isDeleted: boolean;
  GSI1SK: string;
  logo: string;
  carrierPage: string;
  name: string;
  isVerified: boolean;
  teamSize: number;
  GSI1PK: string;
  updatedAt: string;
  aboutCompany: string;
  SK: string;
  PK: string;
  id: string;
}

export interface JobDetails {
  jobTitle: string;
  salaryRange: {
    min: string;
    max: string;
  };
  experienceRange: {
    min: string;
    max: string;
  };
  numberOfOpenings: string;
  workMode: string;
  location: string;
  noticePeriod: string;
  typeOfEmployment: string;
  department: string;
  coreSkills: string[];
  softSkills: string[];
  technicalSkills: string[];
  goodToHaveSkills: string[];
  formattedHTML: string;
}
