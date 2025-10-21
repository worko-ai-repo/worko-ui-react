import { SelectType } from "@Components/Company/FilterData";

/**
 * @interface CompanyDto
 *
 * @description This interface is used to define the structure of the CompanyDto object
 */
export interface CompanyDto {
  id: string;
  name: string;
  industry: string;
  linkedIn: string;
  carrierPage: string;
  aboutCompany: string;
  logoUrl: string;
  logo: string;
  isVerified: boolean;
  teamSize: number;
  createdAt: string;
  updatedAt: string;
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
}

/**
 * @interface CompanyShortDto
 *
 * @description This interface is used to define the structure of the CompanyShortDto object and for CompanyPageCard
 */
export interface CompanyShortDto {
  teamSize: number;
  name: string;
  updatedAt: string;
  logoUrl: string;
  logo: string;
  linkedIn: string;
  isVerified: boolean;
  industry: string;
  carrierPage: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id?: string;
}

/**
 * @interface CompanyByIdDto
 *
 * @description This interface is used to define the structure of the CompanyByIdDto object that fetches the company details by ID
 */
export interface CompanyByIdDto extends CompanyDto {
  website: string;
  aboutCompany: string;
}

/**
 * @interface JobDto
 *
 * @description This interface is used to define the structure of the JobDto object
 */
export interface JobDto extends CompanyDto {
  id: string;
  companyId?: string;
  externalJobId?: string;
  jobTitle: string;
  jobDescription: string;
  otherRequirements?: string;
  experienceRange?: {
    min: number;
    max: number;
  };
  initialMatchingScoreDetails:{
    finalScore:number;
    jobId:string;
    matchRank:number;
  }
  noticePeriod?: number;
  numOfOpenings?: number;
  salaryRange?: {
    min: number;
    max: number;
  };
  department?: string;
  location: {
    city: string[];
    state: string[];
    country: string[];
    fullLocation: string[];
  };
  // @ Typo bug
  workMode: string;
  typeofEmployment?: string;
  typeOfEmployment:string; 
  coreSkills?: string[];
  softSkills?: string[];
  technicalSkills?: string[];
  miscellaneousSkills?: string[];
  status: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  updatedByUserId?: string;
  companyDetails?: CompanyDto;
  htmlJobDescription?: string;
  jobPostedDate?: string;
  displaySalaryRange?: boolean;
  jobCreatedDate?: string;
  jobUrl?: string;
  companyName?: string;
  applyStatus?: "APPLIED" | "NOT_APPLIED";
  matchingScore?: number;
  isNew?: boolean;
  companyLogoUrl?: string;
  badJob?: boolean;
}

/**
 * @interface JobFiltersDto
 *
 * @description This interface is used to define the structure of the JobFiltersDto object
 */
export interface JobFiltersDto extends BaseApiFiltersDto {
  s3VectorPageNumber ?: number; // For pagination in s3 vector search,
  fromS3Vector?:boolean;
  includeCompanyDetails?: boolean;
  experienceRange?: { min: number; max: number };
  location?: string;
  salaryRange?: { min: number; max: number };
  workMode?: string;
  department?: string;
  coreSkills?: string[];
  softSkills?: string[];
  technicalSkills?: string[];
  companyId?: string;
  companyName?: string[];
  jobTitle?: string;
  YOE?: number;
  industry?: string;
  industryName?: string;
  status?: string;
  // fromS3Vector?:boolean;
  // includeCompanyDetails?:boolean;
}

/**
 * FilterOptionForRender
 *
 * @description This interface is used to define the structure of the FilterOptionForRender object
 */

export interface FilterOptionForRender {
  options: string[];
  value: string[] /* | { minSalary?: string; maxSalary?: string; minExperience?: string; maxExperience?: string }[]; */
  paramKey: string;
  placeholder: string;
  selectType: SelectType;
}

/**
 * @interface BaseApiFiltersDto
 *
 * @description This interface is used to define the structure of the BaseApiFiltersDto object
 */
export interface BaseApiFiltersDto {
  pageSize?: number | 50; // Default page size is 50
  sortOrder?: "ascending" | "descending" | "asc" | "desc";
  lastKey?: string;
  searchText?: string;
}

export interface JobApplicationExternalDto {
  id: string;
  applicantUserId: string;
  jobId: string;
  companyName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  jobPortal: string;
  statusTracker?: Array<{
    userType: string;
    newStatus: string;
    oldStatus: string;
    actionDate: string;
    userId: string;
  }>;
  PK?: string; // User ID
  SK?: string; // Job ID
  GSI1PK?: string; // Job Application ID
  GSI1SK?: string; // Job Application ID
}

export interface JobApplicationInternalDto {
  PK: string;
  SK: string;
  companyId: string;
  companyName: string;
  createdAt: number;
  followUpRequest?: {
    actionDate: string;
  }[];
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  id: string;
  jdMatchErrorCode: number;
  jdMatchErrorDesc: string;
  jobId: string;
  jobPortal: string;
  matchingScore: number;
  rejectedByUserId?: {
    actionDate: string;
    reason: string;
    userComment: string;
    userId: string;
  };
  rejectionFeedbackBySystem?: string;
  scoreDetails: string;
  scoreFetchedDate: string;
  status: string;
  statusTracker: {
    actionDate: string;
    newStatus: string;
    oldStatus: string;
    userId: string;
    userType: string;
  }[];
  updatedAt: number;
}



export interface JobMatchingScoreDto {
  id: string;
  userId: string;
  jobId: string;
  jdMatchErrorCode: number;
  jdMatchErrorDesc: string;
  matchingScore: number;
  scoreDetails:any, 
  createdAt: string;
  updatedAt: string;
  isTriggered: boolean;
  status?: string;
}

export interface cvExtractParsed {
    personalDetails?: {
      name: string;
      phone: string;
      email: string;
    };
    roleAndResponsibilities?: Array<{
      role: string;
      responsibilities: string[];
      achievements?: string[];
      teamLeadership?: string[];
    }>;
    industryExperience?: Array<{
      industryType: string;
      industryDomain: string;
      details: string[];
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year: string;
      certifications?: string[];
    }>;
    professionalExperience?: Array<{
      company: string;
      period: string;
      role: string;
      workExperience: string[];
    }>;
  };
export interface UserBasicDetailsDto {
  CTC: number;
  ECTC: number;
  isCvExtracted?: boolean;
  location: string;
  userType: string[];
  noticePeriod: number;
  isCandidateFresher: boolean;
  PK: string;
  country: string;
  YOE: number;
  candidateExperience?: {
    department: string;
    companyName: string;
    designation: string;
  };
  cvExtract?: string;
  cvExtractParsed?: cvExtractParsed;
  coreSkills: Array<{
    skillName: string;
    years: number;
    timestamps: {
      createdAt: string;
      updatedAt: string;
    };
  }>;
  softSkills: Array<{
    skillName: string;
    timestamps: {
      createdAt: string;
    };
  }>;
  certifications?: Array<{
    completionDate: string;
    certName: string;
    issuedInstitution: string;
    timestamps: {
      createdAt: string;
    };
  }>;
}


export interface GlobalApiQueryResponseDto<T>{
  data:[T];
  pagination:{
    count:number;
    pageSize:number;
    lastKey:string;
  }
}