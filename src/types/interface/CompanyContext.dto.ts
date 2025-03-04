import { CompanyShortDto, FilterOptionForRender, JobDto, JobFiltersDto, JobMatchingScoreDto } from "./JobsAndCompany.dto";

/**
 * Company page mode
 */
export enum CompanyPageModeEnum {
    JOB = 'JOB',
    REFERRAL = 'REFERRAL',
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

    jobMatchingScores: Record<string, JobMatchingScoreDto>;


    fetchNextPage: () => void;
    handleSearch: () => void;
    resetSearch: () => void;
}