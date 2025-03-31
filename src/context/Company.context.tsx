import { useAppContext } from "./App.context";
import httpServiceObj from "@Services/ApiHandler.service";
import { filterMetaData } from "@Components/Company/FilterData";
import { useLocation, useSearchParams } from "react-router-dom";
import ErrorWarning from "@Components/Shared/ContextErrorHandler";
import { ContextProviderProps } from "@Interfaces/ContextProvider.dto";
import { CompanyContextType, CompanyPageModeEnum } from "@Interfaces/CompanyContext.dto";
import { generateFilterForRender, invalidateFilterCache } from "@Utils/GenerateFiltersForRender";
import { QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createContext, useState, useContext, useCallback, useLayoutEffect, useMemo, useEffect, useRef } from "react";
import { BaseApiFiltersDto, CompanyShortDto, FilterOptionForRender, JobDto, JobFiltersDto, JobMatchingScoreDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";

// Create the context object
export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
const queryClient = new QueryClient();

// Create the provider component
export const CompanyProvider = ({ children }: ContextProviderProps) => {
  // Init useLocations to get the current path
  const { isLoggedIn } = useAppContext();
  const location = useLocation();
 

  const initialMode = location.pathname.includes("job") ? CompanyPageModeEnum.JOB : CompanyPageModeEnum.REFERRAL;

  // States
  const [companyPageMode, setCompanyPageMode] = useState<CompanyPageModeEnum>(initialMode);
  const [companyJobData, setCompanyJobData] = useState<JobDto[] | undefined>();
  const [companyRefData, setCompanyRefData] = useState<CompanyShortDto[] | undefined>();
  const [searchText, setSearchText] = useState<string>("");
  const [apiHasData, setApiHasData] = useState<boolean>(false);
  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState<boolean>(false);
  const [isProfileInclomplete, setIsProfileInclomplete] = useState<boolean>(false);
  const [defaultFiltersState, setDefaultFiltersState] = useState<{userDesignation:string,coreSkills?:any,YOE?:any}>();

  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI
  const APP_API_URI = import.meta.env.APP_API_URI

  const [jobFilters, setJobFilters] = useState<JobFiltersDto>({
    pageSize: 10,
    sortOrder: "descending",
    
  });

  // Memoized default filters
  const defaultFilters: JobFiltersDto = useMemo(() => {
	return {
	  pageSize: 10,
	  sortOrder: "descending",
	  
    ...(defaultFiltersState?.userDesignation && { jobTitle: defaultFiltersState.userDesignation }),
    ...(defaultFiltersState?.coreSkills && { coreSkills: defaultFiltersState.coreSkills }),
    ...(defaultFiltersState?.YOE !== undefined && { YOE: defaultFiltersState.YOE })
	};
  }, [defaultFiltersState]);

  const [jobFilterForRender, setJobFilterForRender] = useState<FilterOptionForRender[]>([]);

  // useLayoutEffect to check if we are on job page or referral page
  useLayoutEffect(() => {
    const mode = location.pathname.includes("job") ? CompanyPageModeEnum.JOB : CompanyPageModeEnum.REFERRAL;

    if (location.pathname.includes("job") && isLoggedIn) {
      fetchUserBasicDetails();
    }

    setCompanyPageMode(mode);
    //Reset data on mode change
    setCompanyJobData([]);
    setCompanyRefData([]);
	resetFiltersValues();
    // Reset the filter options cache when mode changes
    invalidateFilterCache();
  }, [location.pathname]);

    /**
   * resetFiltersValues
   * 
   * @description - This function is used to reset the filter values
   */
	const resetFiltersValues = () => {
		if (isLoggedIn && defaultFiltersState && location.pathname.includes("job")	) {
		  setJobFilters({
			...defaultFilters, // Ensures default user filters persist
		  });
		} else {
		  setJobFilters({
			pageSize: 10,
			sortOrder: "descending",
		  });
		}
	  };

  // useEffect to reset the queryClient when the component unmounts
  useEffect(() => {
    return () => {
      queryClient.resetQueries();
    };
  }, []);

  // Fetch User Basic Details Function
  const fetchUserBasicDetails = useCallback(async () => {
    if (companyPageMode !== CompanyPageModeEnum.JOB) return;

    setIsUserDetailsLoading(true);
    try {
      const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(`${APP_API_URI}/user/basic-details`, true, {}, true);

      if (error) throw error;
      
      const designation = response?.candidateExperience?.designation;
      const coreSkills = response?.coreSkills?.map(skill => skill.skillName);
      
      // If either designation or coreSkills exist, update filters
      if (designation || coreSkills?.length || response?.YOE) {
        setDefaultFiltersState({
          userDesignation: designation || "", // Ensure userDesignation is always a string
          ...(coreSkills?.length && { coreSkills }),
          ...(response?.YOE && { YOE: response.YOE }), // Ensure YOE is always a string
        });
      
        setJobFilters((prev) => ({
          ...prev,
          ...(designation && { jobTitle: designation }),
          ...(coreSkills?.length && { coreSkills }),
          ...(response?.YOE && { YOE: response.YOE }),
        }));
      } else {
        setIsProfileInclomplete(true);
        setDefaultFiltersState({
          userDesignation: "", // Ensure userDesignation is always a string
          ...({ coreSkills }),

        });
      }

    } catch (err) {
      console.error("Exception in fetchUserBasicDetails:", err);
    } finally {
      setIsUserDetailsLoading(false);
    }
  }, [companyPageMode, setDefaultFiltersState]);


  /**
   * handleSearch
   *
   * @description - This function is used to handle the search functionality
   */
  const handleSearch = () => {
    setJobFilters((prev) => ({ ...prev, searchText }));
    // Reset the filter options cache when searching
    invalidateFilterCache();
    queryClient.invalidateQueries({ queryKey: ["GET", companyPageMode] });
  };

  const resetSearch = () => {
    setSearchText("");
    setJobFilters((prev) => ({ ...prev, searchText: "" }));
    // Reset the filter options cache when resetting search
    invalidateFilterCache();
    queryClient.invalidateQueries({ queryKey: ["GET", companyPageMode] });
  };

  /**
 * fetchJobMatchingScores
 * 
 * @description - Fetches matching scores for a list of job IDs
 * If scores don't exist for some jobs, it triggers score generation via PUT 
 * 
 * Check if job IDs exist – If not, return early.
 * Send a PUT API request to fetch job scores for the given job IDs.
 * Store the retrieved scores in a map and track received job IDs.
 * Filter out job IDs that already have scores, are pending generation, or are already triggered.
 * Update job data with scores while maintaining existing data.
 * keep the missing job IDs in a pending set before making the PUT request.
 * wait 10 seconds before retrying the PUT request if it fails.
 * Handle PUT request errors and successful score generation requests.
 * Update the state with the retrieved job scores.
 * Handle unexpected errors gracefully with try-catch.

 */
  const MAX_RETRIES = 5; // Limit the number of retries per job
  const pendingJobRetries = new Map<string, number>(); // Track retries per job
  
  const fetchJobMatchingScores = useCallback(
    async (jobIds: string[]) => {
      if (!jobIds.length) return;
  
      try {
        const { response, error } = await httpServiceObj.put<{
          data: JobMatchingScoreDto[];
          pagination: object;
        }>(
          `${APP_JOBS_API_URI}/user-matching-score-job/`,
          { jobIds },
          true,
          {},
          true
        );
  
        if (error) {
          console.error("Error fetching job matching scores:", error);
          return;
        }
  
        const scoresMap: Record<string, JobMatchingScoreDto> = {};
        const receivedJobIds = new Set<string>();
        const alreadyTriggeredJobIds = new Set<string>();
  
        response?.data?.forEach((score) => {
          scoresMap[score.jobId] = score;
          receivedJobIds.add(score.jobId);
  
          if (score.isTriggered && !score.matchingScore) {
            alreadyTriggeredJobIds.add(score.jobId);
          }
        });
  
        const missingJobIds = jobIds.filter(
          (jobId) =>
            !receivedJobIds.has(jobId) || // If we never got the job back
            (alreadyTriggeredJobIds.has(jobId) && !scoresMap[jobId]?.matchingScore) // If job was triggered but score is still missing
        );
  
        // Increment retry count for missing jobs
        const retryJobIds = missingJobIds.filter((jobId) => {
          const retries = pendingJobRetries.get(jobId) || 0;
          if (retries >= MAX_RETRIES) {
            console.warn(`Max retries reached for job ${jobId}, skipping.`);
            return false;
          }
          pendingJobRetries.set(jobId, retries + 1);
          return true;
        });
  
        setCompanyJobData((prev) => {
          if (!prev) return undefined;
  
          const existingJobsMap = prev.reduce((acc, job) => {
            acc[job.id] = job;
            return acc;
          }, {} as Record<string, JobDto>);
  
          jobIds.forEach((jobId) => {
            if (existingJobsMap[jobId]) {
              existingJobsMap[jobId] = {
                ...existingJobsMap[jobId],
                matchingScore:
                  scoresMap[jobId]?.matchingScore ??
                  existingJobsMap[jobId].matchingScore,
                applyStatus: scoresMap[jobId]
                  ? "APPLIED"
                  : existingJobsMap[jobId].applyStatus || "NOT_APPLIED",
              };
            }
          });
  
          return prev.map((job) => existingJobsMap[job.id] || job);
        });
  
        if (retryJobIds.length > 0) {
          // console.log("Retrying missing jobs:", retryJobIds);
          setTimeout(() => fetchJobMatchingScores(retryJobIds), 5000); // Retry after 20 seconds
        }
      } catch (err) {
        console.error("Exception in fetchJobMatchingScores:", err);
      }
    },
    [setCompanyJobData]
  );
  


  /**
   * Handle Query Function
   *
   * @description - This function is used to handle the query function for fetching data from the API
   */  
  
  const CompanyQueryHandler = useCallback(
    async ({ pageParam = null, filters }: { pageParam?: string | null; filters: JobFiltersDto }) => {
      // Check if we are on the job page
      const isJobPage = location.pathname.includes("job");
      // If pageParam is null, it's a new filter request
      const isFiltering = pageParam === null;
  
      // Create updated filters object
      const updatedFilters = {
        ...filters,
        lastKey: pageParam ?? undefined,
        ...(isJobPage && filters.sortOrder
          ? { sortOrder: filters.sortOrder === "asc" ? "asc" : "desc" }
          : {})
      };

      // Step 6 → If searchText is present, remove jobTitle, experienceRange, and coreSkills
      if (filters.searchText) {
        delete updatedFilters.jobTitle;
        delete updatedFilters.experienceRange;
        delete updatedFilters.coreSkills;
      }

      // Step 7 → If any filter includes 'experience Range' in its key, remove YOE
      if (filters.experienceRange) {
        delete updatedFilters.YOE;
      }

      // if updatedFilters has salaryRange or experienceRange, then exclude those values 
      if(updatedFilters.salaryRange){
        delete updatedFilters.salaryRange;
      }
      if(updatedFilters.experienceRange){
        delete updatedFilters.experienceRange;
      }
      if(updatedFilters?.industry){
        updatedFilters.industryName =  updatedFilters.industry;
        delete updatedFilters.industry;
      }

      const apiUrl = isJobPage ? `${APP_JOBS_API_URI}/job/` : '/company';
  
      try {
        const { response, error } = await httpServiceObj.get<any>(
          apiUrl,
          true,
          updatedFilters,
          isJobPage
        );
  
        if (error) throw error;
  
        // Decide the filterMetaData based on the page mode
        const finalFilterMetaData = isJobPage 
          ? filterMetaData.jobFilter 
          : filterMetaData.referralFilter;
  
        // Generate filters for rendering
        generateFilterForRender(
          response.data,
          companyPageMode,
          finalFilterMetaData,
          setJobFilterForRender,
          isFiltering
        );
  
        // Update API data status
        setApiHasData(response.data.length > 0);
  
        if (isJobPage) {
          setCompanyJobData((prevData) => {
            // If filtering, return new data
            if (isFiltering) return response.data;
            // If appending, combine previous and new data
            const existingData = prevData || [];
            return [...existingData, ...response.data];
          });
  
          // Fetch matching scores for new jobs if user is logged in
          if (response.data.length > 0 && isLoggedIn) {
            fetchJobMatchingScores(response.data.map((job: { id: any }) => job.id));
          }
        } else {
          setCompanyRefData((prevData) => {
            if (isFiltering) return response.data;
            const existingData = prevData || [];
            return [...existingData, ...response.data];
          });
        }
  
        return {
          data: response,
          nextPage: response.pagination?.lastKey,
        };
      } catch (error) {
        console.error("Error fetching company/job data:", error);
        throw error;
      }
    },
    [companyPageMode, fetchJobMatchingScores, isLoggedIn]
  );
  const shouldEnableQuery = () => {
    if (!companyPageMode || jobFilters.pageSize! <= 0) return false; // If page mode is not set or pageSize is 0, return false
    if (companyPageMode !== CompanyPageModeEnum.REFERRAL && companyPageMode !== CompanyPageModeEnum.JOB) return false; // If page mode is not valid, return false
    // if(!hasNextPage) return false;
    // @Todo- fix this
     if(isLoggedIn && companyPageMode === CompanyPageModeEnum.REFERRAL) {return true}
    if (isLoggedIn && !defaultFiltersState) return false; // If logged in, ensure userDesignation is present
    return true;
    // enabled:!!companyPageMode && jobFilters.pageSize! > 0 &&
    // (companyPageMode === CompanyPageModeEnum.REFERRAL || companyPageMode === CompanyPageModeEnum.JOB) &&
    // Object.keys(jobFilters).length > 0 ,// Ensure filters are fully set,
    };
  

  /**
   * useInfiniteQuery
   *
   * @description - This hook is used to fetch data from the API
   */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
    queryKey: ["GET", companyPageMode, jobFilters],
    queryFn: ({ pageParam }) => CompanyQueryHandler({ pageParam, filters: jobFilters }),
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined, // Pass lastKey as nextPageParam
    initialPageParam: null,
     enabled: shouldEnableQuery(),
    retry: 0,
    // Removed keepPreviousData as it is not supported in useInfiniteQuery
    // staleTime: 1000 * 60 , // 5 seconds
  });

  /**
   * Context Value
   *
   * This object contains the values and functions that will be available to the components
   * that are children of the provider
   */
  const contextValue: CompanyContextType = useMemo(
    () => ({
      companyPageMode,
      setCompanyPageMode,
      setJobFilters,
      jobFilterForRender,
      companyJobData,
      setSearchText,
      searchText,
      resetSearch,
      handleSearch,
      isLoading: isLoading || isUserDetailsLoading,
      companyRefData,
      apiHasData,
      isError,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      fetchUserBasicDetails,
	  resetFiltersValues,
    isProfileInclomplete,
    }),
    [companyPageMode, jobFilterForRender, companyJobData, searchText, isLoading, isUserDetailsLoading, companyRefData, apiHasData, isError, hasNextPage, fetchNextPage, isFetchingNextPage,resetFiltersValues,isProfileInclomplete]
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      <div className="relative">
        {children}
        {isError && error ? <ErrorWarning isError={isError} error={error} /> : null}
      </div>
    </CompanyContext.Provider>
  );
};

/**
 *  useCompanyContext hook
 *
 * This hook is used to access the context object
 *
 * @returns {CompanyContextType} The context object
 */
export const useCompanyContext = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanyContext must be used within an AuthProvider");
  }
  return context;
};
