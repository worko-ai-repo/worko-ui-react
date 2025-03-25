import { CompanyShortDto, FilterOptionForRender, JobDto, JobFiltersDto } from "./JobsAndCompany.dto";

/**
 * Company page mode
 */
export enum CompanyPageModeEnum {
    JOB = 'JOB',
    REFERRAL = 'REFERRAL',
    GUIDANCE = "GUIDANCE", //For Guidance page Banner.
}
/**
 * Type of the company context
 */
export type CompanyContextType = {
    companyPageMode: CompanyPageModeEnum;

    setCompanyPageMode: React.Dispatch<React.SetStateAction<CompanyPageModeEnum>>;

    setJobFilters: React.Dispatch<React.SetStateAction<JobFiltersDto>>;
    
    jobFilterForRender: FilterOptionForRender[]

    companyJobData: JobDto[] | undefined;

    companyRefData: CompanyShortDto[] | undefined;

    setSearchText: React.Dispatch<React.SetStateAction<string>>;

    searchText: string;

    isLoading: boolean;
    
    isError: boolean;

    hasNextPage: boolean;

    isFetchingNextPage: boolean;

    isProfileInclomplete: boolean;

    fetchNextPage: () => void;
    handleSearch: () => void;
    resetSearch: () => void;
    resetFiltersValues : () => void;
}