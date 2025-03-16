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

  const [defaultFiltersState, setDefaultFiltersState] = useState<{userDesignation:string,coreSkills?:any}>();

  const [jobFilters, setJobFilters] = useState<JobFiltersDto>({
    pageSize: 10,
    sortOrder: "descending",
    searchText: searchText,
  });

  // Memoized default filters
  const defaultFilters: JobFiltersDto = useMemo(() => {
	return {
	  pageSize: 10,
	  sortOrder: "descending",
	  searchText,
	  jobTitle: defaultFiltersState?.userDesignation, // Ensure jobTitle is included
	  coreSkills: defaultFiltersState?.coreSkills, // Ensure coreSkills persist
	};
  }, [defaultFiltersState, searchText]);

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
		if (isLoggedIn && defaultFiltersState) {
		  setJobFilters({
			...defaultFilters, // Ensures default user filters persist
		  });
		} else {
		  setJobFilters({
			pageSize: 10,
			sortOrder: "descending",
			searchText: searchText,
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
      const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>("https://api.dev.worko.work/user/basic-details", true, {}, true);

      if (error) throw error;

      if (response?.candidateExperience?.designation && response.candidateExperience.designation !== defaultFiltersState?.userDesignation) {
		const coreSkills = response?.coreSkills?.map(skill => skill.skillName);

        setDefaultFiltersState({userDesignation:response.candidateExperience.designation,coreSkills:coreSkills});
        // Extract coreSkills as a comma-separated string
		setJobFilters((prev) => ({ 
			...prev, 
			jobTitle: response?.candidateExperience?.designation, 
			coreSkills: coreSkills  
		  }));
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
  const fetchJobMatchingScores = useCallback(
    async (jobIds: string[]) => {
      // Step 1: Check if there are any job IDs to process; if not, exit early.
      if (!jobIds.length) return;

      try {
        // Step 2: Format the job IDs as a comma-separated string for the API request.
        const jobIdsParam = jobIds.join(",");
        const pageSize = jobIds.length; // Ensure we get all requested jobs in one response.

        // Step 3: Make an API call to fetch job matching scores.
        const { response, error } = await httpServiceObj.get<{ data: JobMatchingScoreDto[] }>(`https://jobs.dev.worko.work/user-matching-score-job/?jobIds=${jobIdsParam}&pageSize=${pageSize}`, true, {}, true);

        // Step 4: If there's an error in the API call, log it and stop further execution.
        if (error) {
          console.error("Error fetching job matching scores:", error);
          return;
        }

        // Step 5: Store retrieved scores in a map and track received job IDs.
        const scoresMap: Record<string, JobMatchingScoreDto> = {};
        const receivedJobIds = new Set<string>();

        response?.data?.forEach((score) => {
          scoresMap[score.jobId] = score;
          receivedJobIds.add(score.jobId);
        });

        // Step 6: Identify which job IDs are missing from the response.
        const missingJobIds = jobIds.filter((id) => !receivedJobIds.has(id));

        // Step 8: Update job data with scores, but MAINTAIN SCORES FOR PREVIOUS JOBS
        setCompanyJobData((prev) => {
          if (!prev) return undefined;

          // Create a map of existing jobs with their scores
          const existingJobsMap = prev.reduce((acc, job) => {
            acc[job.id] = job;
            return acc;
          }, {} as Record<string, JobDto>);

          // Update with new scores
          jobIds.forEach((jobId) => {
            if (existingJobsMap[jobId]) {
              existingJobsMap[jobId] = {
                ...existingJobsMap[jobId],
                matchingScore: scoresMap[jobId]?.matchingScore ?? existingJobsMap[jobId].matchingScore,
                applyStatus: scoresMap[jobId] ? "APPLIED" : existingJobsMap[jobId].applyStatus || "NOT_APPLIED",
              };
            }
          });

          // Convert map back to array while preserving order
          return prev.map((job) => existingJobsMap[job.id] || job);
        });

        // Step 9: If there are missing job scores, log them and trigger score generation.
        if (missingJobIds.length > 0) {
          console.log("Missing matching scores for job IDs:", missingJobIds);

          // Step 10: Make a PUT request to trigger job matching score generation for the missing jobs.
          const { response: putResponse, error: putError } = await httpServiceObj.put<{ matchingScoreCalculationStatus: boolean }>("https://jobs.dev.worko.work/user-matching-score-job/", { jobIds: missingJobIds }, true, {}, true);

          // Step 11: If there's an error generating the missing scores, log and exit.
          if (putError) {
            console.error("Error generating job matching scores:", putError);
            return;
          }

          // Step 12: If the generation was successful, retry fetching the missing scores after 5 seconds.
          if (putResponse?.matchingScoreCalculationStatus) {
            console.log("Successfully triggered matching score generation, retrying in 5 seconds...");

            // Step 13: Use a timeout to retry fetching scores once after 5 seconds.
            //   setTimeout(() => fetchJobMatchingScores(missingJobIds), 5000);
          } else {
            console.warn("Failed to generate matching scores");
          }
        }
      } catch (err) {
        // Step 14: Handle any unexpected errors that occur during the execution.
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
    // If `pageParam` is null, it's a new filter request
	const isFiltering = !pageParam; 
     
	// Check extract all keys except jobTitle from dto
	// Destructuring an object to extract all keys except jobTitle
	// const { jobTitle, ...otherFilters } = filters;
	// Now, 'otherFilters' contains all properties of filters except 'jobTitle'

	// Alternatively, create a type that omits jobTitle from JobFiltersDto
	// List of filters that should trigger jobTitle removal
    const filteringKeys: (keyof JobFiltersDto)[] = [
		"experienceRange",
		"location",
		"salaryRange",
		"workMode",
		"department",
		'searchText',
		// "coreSkills",
		"softSkills",
		"technicalSkills",
		"companyId",
	  ];
	
	 // Check if any of the filtering keys exist in filters
	 const hasRelevantFilters = filteringKeys.some((key) => filters[key] !== undefined);

	 // Destructure and remove jobTitle if relevant filters are used
	 const updatedFilters = hasRelevantFilters
	   ? (({ jobTitle, ...rest }) => rest)(filters)
	   : filters;
 
   updatedFilters.lastKey = pageParam ?? undefined;
	 if (isJobPage && filters.sortOrder) {
	   updatedFilters.sortOrder = filters.sortOrder === "asc" ? "asc" : "desc";
	 }
 
      const apiUrl = isJobPage ? `https://jobs.dev.worko.work/job/` : `/company`;
      // console.log('API URL:', apiUrl);
      try {
        const { response, error } = await httpServiceObj.get<any>(
          apiUrl,
          true,
          updatedFilters,
          isJobPage // Use full URI for 'job', false otherwise
        );

        if (error) throw error;

        // Decide the filterMetaData based on the page mode
        const finalFilterMetaData = isJobPage ? filterMetaData.jobFilter : filterMetaData.referralFilter;
        // Generate filters for rendering
        generateFilterForRender(response.data, companyPageMode, finalFilterMetaData, setJobFilterForRender, isFiltering);

        setApiHasData(response.data.length > 0);

        if (isJobPage) {
          setCompanyJobData((prev) => (isFiltering ? response.data : [...(prev || []), ...response.data]));

          if (response.data.length > 0 && isLoggedIn) {
            fetchJobMatchingScores(response.data.map((job: { id: any }) => job.id));
          }
        } else {
          setCompanyRefData((prev) => (isFiltering ? response.data : [...(prev || []), ...response.data]));
        }

        return {
          data: response,
          nextPage: response.pagination?.lastKey, // Pass lastKey for pagination if available
        };
      } catch (error) {
        console.error("Error fetching company/job data:", error);
        throw error;
      }
    },
    [companyPageMode, fetchJobMatchingScores, defaultFilters]
  );

  const shouldEnableQuery = () => {
	if (!companyPageMode || jobFilters.pageSize! <= 0) return false; // If page mode is not set or pageSize is 0, return false
	if (companyPageMode !== CompanyPageModeEnum.REFERRAL && companyPageMode !== CompanyPageModeEnum.JOB) return false; // If page mode is not valid, return false
	if (isLoggedIn && !defaultFiltersState) return false; // If logged in, ensure userDesignation is present
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
    enabled: shouldEnableQuery(),
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
      handleSearch,
      resetSearch,
      isLoading: isLoading || isUserDetailsLoading,
      companyRefData,
      apiHasData,
      isError,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      fetchUserBasicDetails,
	  resetFiltersValues,
    }),
    [companyPageMode, jobFilterForRender, companyJobData, searchText, isLoading, isUserDetailsLoading, companyRefData, apiHasData, isError, hasNextPage, fetchNextPage, isFetchingNextPage,resetFiltersValues]
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
