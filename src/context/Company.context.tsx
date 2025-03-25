import { useAppContext } from "./App.context";
import httpServiceObj from "@Services/ApiHandler.service";
import { filterMetaData } from "@Components/Company/FilterData";
import { useLocation, useSearchParams } from "react-router-dom";
import ErrorWarning from "@Components/Shared/ContextErrorHandler";
import { ContextProviderProps } from "@Interfaces/ContextProvider.dto";
import { CompanyContextType, CompanyPageModeEnum } from "@Interfaces/CompanyContext.dto";
import { generateFilterForRender, invalidateFilterCache } from "@Utils/GenerateFiltersForRender";
import { QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { createContext, useState, useContext, useCallback, useLayoutEffect, useMemo, useEffect } from "react";
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
 // Step 1: Define interface for detailed score information

// Step 3: Initialize state to track jobs that are currently being processed for score generation
const [pendingScoreGenerations, setPendingScoreGenerations] = useState<Set<string>>(new Set());

// Step 4: Define function to fetch job matching scores
const fetchJobMatchingScores = useCallback(
  async (jobIds: string[]) => {
    // Step 4.1: Check if there are any job IDs to process
    if (!jobIds.length) return;

    try {
      // Step 4.2: Make API call to get matching scores for specified jobs
      const { response, error } = await httpServiceObj.put<{data:JobMatchingScoreDto[] , pagination:object}>(
        `${APP_JOBS_API_URI}/user-matching-score-job/`, 
        { jobIds },                        // Step 4.3: Pass array of job IDs in request body
        true,                              // Step 4.4: Flag for authentication requirement
        {},                                // Step 4.5: Empty options object
        true                               // Step 4.6: Flag for additional behavior (possibly error handling)
      );

      // Step 4.7: Handle API call errors
      if (error) {
        console.error("Error fetching job matching scores:", error);
        return;
      }

      // Step 5: Process response data
      const scoresMap: Record<string, JobMatchingScoreDto> = {};        // Step 5.1: Initialize map to store scores by job ID
      const receivedJobIds = new Set<string>();                         // Step 5.2: Track which job IDs we received scores for
      const alreadyTriggeredJobIds = new Set<string>();                 // Step 5.3: Track jobs that were triggered but don't have scores yet

      // Step 5.4: Process each score in the response
      response?.data?.forEach((score:JobMatchingScoreDto) => {
        scoresMap[score.jobId] = score;                                 // Step 5.5: Add score to map keyed by job ID
        receivedJobIds.add(score.jobId);                                // Step 5.6: Mark this job ID as received
        if (score.isTriggered && !score.matchingScore) {                // Step 5.7: Check if score generation is in progress
          alreadyTriggeredJobIds.add(score.jobId);                      // Step 5.8: Mark job as already triggered but not complete
        }
      });

      // Step 6: Identify missing job IDs that need score generation
      const missingJobIds = jobIds.filter(
        (id) => !receivedJobIds.has(id) && !pendingScoreGenerations.has(id)  // Step 6.1: Find jobs not in response and not already pending
      );
      const jobIdsForPutRequest = missingJobIds.filter(
        (id) => !alreadyTriggeredJobIds.has(id)                         // Step 6.2: Filter out jobs already triggered on server
      );

      // Step 7: Update state with fetched scores
      setCompanyJobData((prev) => {
        // Step 7.1: Handle case where previous data doesn't exist
        if (!prev) return undefined;

        // Step 7.2: Create map of existing jobs for efficient lookup
        const existingJobsMap = prev.reduce((acc, job) => {
          acc[job.id] = job;
          return acc;
        }, {} as Record<string, JobDto>);

        // Step 7.3: Update job data with matching scores
        jobIds.forEach((jobId) => {
          if (existingJobsMap[jobId]) {
            existingJobsMap[jobId] = {
              ...existingJobsMap[jobId],                                 // Step 7.4: Preserve existing job data
              matchingScore: scoresMap[jobId]?.matchingScore ?? existingJobsMap[jobId].matchingScore,  // Step 7.5: Update score if available
              applyStatus: scoresMap[jobId] ? "APPLIED" : existingJobsMap[jobId].applyStatus || "NOT_APPLIED",  // Step 7.6: Update application status
            };
          }
        });

        // Step 7.7: Return updated jobs array
        return prev.map((job) => existingJobsMap[job.id] || job);
      });

      // Step 8: Handle missing job scores generation
      if (jobIdsForPutRequest.length > 0) {
        // Step 8.1: Update pending generations set with new job IDs
        setPendingScoreGenerations((prev) => {
          const newSet = new Set(prev);
          jobIdsForPutRequest.forEach(id => newSet.add(id));             // Step 8.2: Mark each job as pending
          return newSet;
        });

        // Step 8.3: Set timeout to retry after delay (and clean up pending state)
        setTimeout(() => {
          // Step 8.4: Remove job IDs from pending set after timeout
          setPendingScoreGenerations((prev) => {
            const newSet = new Set(prev);
            jobIdsForPutRequest.forEach(id => newSet.delete(id));        // Step 8.5: Remove each job from pending set
            return newSet;
          });
          // Step 8.6: Retry fetching scores for these job IDs
          fetchJobMatchingScores(jobIdsForPutRequest);
        }, 5000);  // Step 8.7: Wait 5 seconds before retrying
      }

      // Step 9: Retry fetching for already triggered jobs after delay
      const jobIdsAlreadyTriggered = missingJobIds.filter(id => alreadyTriggeredJobIds.has(id));  // Step 9.1: Get list of jobs already in progress
      if (jobIdsAlreadyTriggered.length > 0) {
        // Step 9.2: Set longer timeout for jobs already in progress on server
        setTimeout(() => {
          // Step 9.3: Retry fetching these scores after longer delay
          fetchJobMatchingScores(jobIdsAlreadyTriggered);
        }, 10000);  // Step 9.4: Wait 10 seconds before checking already triggered jobs
      }

    } catch (err) {
      // Step 10: Handle unexpected exceptions
      console.error("Exception in fetchJobMatchingScores:", err);
      // Step 10.1: Instead of clearing everything, errors are handled per batch
    }
  },
  // Step 11: Dependency array for useCallback
  [setCompanyJobData, pendingScoreGenerations]
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
  
      // List of filters that should be considered for filtering
      const filteringKeys: (keyof JobFiltersDto)[] = [
        "experienceRange",
        "location",
        "salaryRange",
        "workMode",
        "department",
        'searchText',
        "softSkills",
        "technicalSkills",
        "companyId",
      ];
  
      // Check if any of the filtering keys have values
      const hasRelevantFilters = filteringKeys.some(
        (key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== ''
      );
  
      // Create updated filters object
      const updatedFilters = {
        ...filters,
        lastKey: pageParam ?? undefined,
        ...(isJobPage && filters.sortOrder
          ? { sortOrder: filters.sortOrder === "asc" ? "asc" : "desc" }
          : {})
      };
  
      // Remove jobTitle if other relevant filters are present
      if (hasRelevantFilters && 'jobTitle' in updatedFilters) {
        delete updatedFilters.jobTitle;
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
