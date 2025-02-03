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
  }
  
  /**
   * @interface JobDto
   * 
   * @description This interface is used to define the structure of the JobDto object
   */
  export interface JobDto extends CompanyDto {
    id: string;
    jobTitle: string;
    jobDescription: string;
    workMode: string;
    location: string;
    salaryRange: { min: number; max: number };
    experienceRange: { min: number; max: number };
    noticePeriod: number;
    numOfOpenings: number;
    department: string;
    typeofEmployment: string;
    technicalSkills: string[];
    coreSkills: string[];
    softSkills: string[];
    mislaneiousSkills: string[];
    otherRequirements: string;
    status: string;
    isDeleted: boolean;
    createdByUserId: string;
    createdAt: string;
    updatedAt: string;
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    companyDetails: CompanyDto;
  }
  
  /**
   * @interface JobFiltersDto
   * 
   * @description This interface is used to define the structure of the JobFiltersDto object
   */
  export interface JobFiltersDto extends BaseApiFiltersDto {
    experienceRange?: { min: number; max: number };
    location?: string;
    salaryRange?: { min: number; max: number };
    workMode?: string;
    department?: string;
    coreSkills?: string[];
    softSkills?: string[];
    technicalSkills?: string[];
  }

  /**
   * FilterOptionForRender
   * 
   * @description This interface is used to define the structure of the FilterOptionForRender object
   */
  
 export interface FilterOptionForRender {
    options: string[];
    value: string[] | { minSalary?: number; maxSalary?: number; minExperience?: number; maxExperience?: number }[];
    paramKey: string;
    placeholder: string;
}

  /**
   * @interface BaseApiFiltersDto
   * 
   * @description This interface is used to define the structure of the BaseApiFiltersDto object
   */
    export interface BaseApiFiltersDto {
        pageSize: number | 50; // Default page size is 50
        sortOrder: 'ascending' | 'descending'
        lastKey?: string;
        searchText?: string;
    }