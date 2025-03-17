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
  const [defaultFiltersState, setDefaultFiltersState] = useState<{userDesignation:string,coreSkills?:any}>();

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
	  
	  jobTitle: defaultFiltersState?.userDesignation, // Ensure jobTitle is included
	  coreSkills: defaultFiltersState?.coreSkills, // Ensure coreSkills persist
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
      if (designation || coreSkills?.length) {
        setDefaultFiltersState({
          userDesignation: designation || "", // Ensure userDesignation is always a string
          ...(coreSkills?.length && { coreSkills }),
        });
      
        setJobFilters((prev) => ({
          ...prev,
          ...(designation && { jobTitle: designation }),
          ...(coreSkills?.length && { coreSkills }),
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
 * Send an API request to fetch job scores for the given job IDs.
 * Handle errors in the request – If there's an issue, log and stop.
 * Verify if all requested job scores are returned:
 * If some are missing, identify those job IDs.
 * Trigger a PUT request to generate missing job scores.
 * Once generated, make another GET request to fetch the missing scores.
 * Update the state with the retrieved job scores.
 * Handle unexpected errors gracefully with try-catch.

 */

  const [pendingScoreGenerations, setPendingScoreGenerations] = useState<Set<string>>(new Set());

const fetchJobMatchingScores = useCallback(
  async (jobIds: string[]) => {
    // Step 1: Check if there are any job IDs to process; if not, exit early
    if (!jobIds.length) return;

    try {
      // Step 2: Format the job IDs as a comma-separated string and set page size for API request
      const jobIdsParam = jobIds.join(",");
      const pageSize = jobIds.length;

      // Step 3: Make an API call to fetch existing job matching scores
      const { response, error } = await httpServiceObj.get<{ data: JobMatchingScoreDto[] }>(
        `${APP_JOBS_API_URI}/user-matching-score-job/?jobIds=${jobIdsParam}&pageSize=${pageSize}`, 
        true, 
        {}, 
        true
      );

      // Step 4: If there's an error in the API call, log it and stop further execution
      if (error) {
        console.error("Error fetching job matching scores:", error);
        return;
      }

      // Step 5: Store retrieved scores in a map and track received job IDs
      const scoresMap: Record<string, JobMatchingScoreDto> = {};
      const receivedJobIds = new Set<string>();
      const alreadyTriggeredJobIds = new Set<string>();

      response?.data?.forEach((score) => {
        scoresMap[score.jobId] = score;
        receivedJobIds.add(score.jobId);
        
        // Track jobs that have already been triggered but don't have scores yet
        if (score.isTriggered === true && !score.matchingScore) {
          alreadyTriggeredJobIds.add(score.jobId);
        }
      });

      // Step 6: Filter out job IDs that already have scores, are pending generation, or are already triggered
      const missingJobIds = jobIds.filter(
        (id) => !receivedJobIds.has(id) && !pendingScoreGenerations.has(id)
      );
      
      // Filter out already triggered jobs from PUT request
      const jobIdsForPutRequest = missingJobIds.filter(
        (id) => !alreadyTriggeredJobIds.has(id)
      );

      // Step 7: Update job data with scores while maintaining existing data
      setCompanyJobData((prev) => {
        if (!prev) return undefined;

        // Step 7a: Create a map of existing jobs with their scores
        const existingJobsMap = prev.reduce((acc, job) => {
          acc[job.id] = job;
          return acc;
        }, {} as Record<string, JobDto>);

        // Step 7b: Update jobs with new scores while preserving existing data
        jobIds.forEach((jobId) => {
          if (existingJobsMap[jobId]) {
            existingJobsMap[jobId] = {
              ...existingJobsMap[jobId],
              matchingScore: scoresMap[jobId]?.matchingScore ?? existingJobsMap[jobId].matchingScore,
              applyStatus: scoresMap[jobId] ? "APPLIED" : existingJobsMap[jobId].applyStatus || "NOT_APPLIED",
            };
          }
        });

        // Step 7c: Convert map back to array while preserving order
        return prev.map((job) => existingJobsMap[job.id] || job);
      });

      // Step 8: Handle missing job scores generation
      if (jobIdsForPutRequest.length > 0) {
        // Step 8a: Add missing job IDs to pending set before making the PUT request
        setPendingScoreGenerations((prev) => {
          const newSet = new Set(prev);
          jobIdsForPutRequest.forEach(id => newSet.add(id));
          return newSet;
        });

        // Step 8b: Make PUT request to trigger score generation for missing jobs
        const { response: putResponse, error: putError } = await httpServiceObj.put<{ matchingScoreCalculationStatus: boolean }>(
          `${APP_JOBS_API_URI}/user-matching-score-job/`, 
          { jobIds: jobIdsForPutRequest }, 
          true, 
          {}, 
          true
        );
      
        // Step 8c: Handle PUT request error
        if (putError) {
          console.error("Error generating job matching scores:", putError);
          // Remove failed jobs from pending set
          setPendingScoreGenerations((prev) => {
            const newSet = new Set(prev);
            jobIdsForPutRequest.forEach(id => newSet.delete(id));
            return newSet;
          });
          return;
        }

        // Step 8d: Handle successful score generation request
        if (putResponse?.matchingScoreCalculationStatus) {
          // Step 8e: Set timeout to retry fetching scores after 5 seconds
          setTimeout(() => {
            // Remove completed jobs from pending set
            setPendingScoreGenerations((prev) => {
              const newSet = new Set(prev);
              jobIdsForPutRequest.forEach(id => newSet.delete(id));
              return newSet;
            });
            // Retry fetching scores for these jobs
            fetchJobMatchingScores(jobIdsForPutRequest);
          }, 5000);
        } else {
          // Step 8f: Handle failed score generation
          console.warn("Failed to generate matching scores");
          // Remove failed jobs from pending set
          setPendingScoreGenerations((prev) => {
            const newSet = new Set(prev);
            jobIdsForPutRequest.forEach(id => newSet.delete(id));
            return newSet;
          });
        }
      }
      
      // For already triggered jobs, retry after timeout without sending another PUT request
      const jobIdsAlreadyTriggered = missingJobIds.filter(id => alreadyTriggeredJobIds.has(id));
      if (jobIdsAlreadyTriggered.length > 0) {
        setTimeout(() => {
          fetchJobMatchingScores(jobIdsAlreadyTriggered);
        }, 5000);
      }
      
    } catch (err) {
      // Step 9: Handle any unexpected errors in the entire process
      console.error("Exception in fetchJobMatchingScores:", err);
      // Clear all pending jobs in case of unexpected error
      setPendingScoreGenerations(new Set());
    }
  },
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
  if(!hasNextPage) return false;
  // @Todo- fix this
  // if(isLoggedIn && companyPageMode === CompanyPageModeEnum.REFERRAL) {return true}
	// if (isLoggedIn && !defaultFiltersState) return false; // If logged in, ensure userDesignation is present
	return true;
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
     enabled:  !!companyPageMode && jobFilters.pageSize! > 0 &&
     (companyPageMode === CompanyPageModeEnum.REFERRAL || companyPageMode === CompanyPageModeEnum.JOB),
    retry: 0,
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
