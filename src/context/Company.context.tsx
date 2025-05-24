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
import { CompanyShortDto, FilterOptionForRender, GlobalApiQueryResponseDto, JobDto, JobFiltersDto, JobMatchingScoreDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";
import { compareResumeWithJD, defaultScoreWeights, ScoreWeightsDto } from "@Utils/CompareResumeWithJD.utils";


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
  const [userBasicDetails, setUserBasicDetails] = useState<UserBasicDetailsDto>();
  const [companyJobData, setCompanyJobData] = useState<JobDto[] | undefined>();
  const [companyRefData, setCompanyRefData] = useState<CompanyShortDto[] | undefined>();
  const [searchText, setSearchText] = useState<string>("");
  const [apiHasData, setApiHasData] = useState<boolean>(false);
  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState<boolean>(false);
  const [isProfileInclomplete, setIsProfileInclomplete] = useState<boolean>(false);
  const [defaultFiltersState, setDefaultFiltersState] = useState<{userDesignation:string,coreSkills?:any,YOE?:any}>();
  const [isInitialFilterSet, setIsInitialFilterSet] = useState<boolean>(false);

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
  }, [location.pathname, companyPageMode]);

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
      if(response)setUserBasicDetails(response);

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
    setJobFilters((prev) => {
      const updatedFilters = { ...prev };
      // Delete searchText from filters
      delete updatedFilters.searchText;
      return updatedFilters;
    });
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

const [missingJobIdsSet, setMissingJobIdsSet] = useState(new Set<string>()); // Persist missing job IDs

/**
 * Custom hook callback to calculate and update matching scores between resumes and job descriptions
 * This function processes jobs in batches to avoid UI blocking and calculates how well a resume
 * matches with each job description.
 * 
 * @param {Array<Object>} jobs - Array of job objects, each with id and jobDescription
 * @returns {Promise<void>}
 */
const fetchJobMatchingScores = useCallback(
  async (jobs:JobDto[]) => {
    // Exit early if there are no jobs to process
    if (!jobs.length) return;
    // console.log("Jobs to fetch matching scores for:", jobs);
    
    try {
      // Create a copy of the missing job IDs set to track which jobs still need processing
      const updatedMissingJobIdsSet = new Set(missingJobIdsSet);

      // Configuration for batch processing to prevent UI freezing
      const BATCH_SIZE = 25;   // Process 25 jobs at a time
      const BATCH_DELAY = 50;  // Wait 50ms between batches

      // Object to store calculated scores for each job ID
      const scoresMap: Record<string, any> = {};

      // Process jobs in batches to avoid blocking the UI
      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);

        // Process each job in the current batch
        batch.forEach((job) => {
          // Mark this job as needing processing
          updatedMissingJobIdsSet.add(job.id);
          
          // Calculate matching score between resume and job description
          if(!userBasicDetails) return;
          const {totalScore} = compareResumeWithJD(job,userBasicDetails );

          // Store the result in our scores map
          scoresMap[job.id] = {
            id: job.id,
            scores: totalScore,
          };
          // console.log("Job ID:", job.id, "Matching Score:", matchingScore);
        });

        // Add a small delay between batches to keep the UI responsive
        await new Promise((res) => setTimeout(res, BATCH_DELAY));
      }

      // Update the set of jobs that still need processing
      setMissingJobIdsSet(updatedMissingJobIdsSet);

      // Update the company job data with the new matching scores
      setCompanyJobData((prev) => {
        // Handle case where previous data doesn't exist
        if (!prev) return undefined;
        
        // Create a map of existing jobs for easy lookup
        const existingJobsMap = prev.reduce((acc, job) => {
          acc[job.id] = job;
          return acc;
        }, {} as Record<string, JobDto>);

        // Update each job with its new matching score
        Object.keys(scoresMap).forEach((jobId) => {
          // Use new matching score if available, otherwise keep existing one
          const matchingScore = scoresMap[jobId]?.scores ?? existingJobsMap[jobId].matchingScore; // ↑ Change to 'scores' to match what you stored

          // Update job data with new score and apply status
          existingJobsMap[jobId] = {
            ...existingJobsMap[jobId],
            matchingScore,
          };

          // Remove this job from the missing jobs set since it's been processed
          setMissingJobIdsSet((prevSet) => {
            const newSet = new Set(prevSet);
            newSet.delete(jobId);
            return newSet;
          });
        });

        // Reconstruct the array with updated job information
        return prev.map((job) => existingJobsMap[job.id] || job);
      });
    } catch (err) {
      console.error("Exception in fetchJobMatchingScores:", err);
    }
  },
  // Dependencies for this callback
  [setCompanyJobData, missingJobIdsSet, userBasicDetails]
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
      const updatedFilters:JobFiltersDto = {
        ...filters,
        pageSize: 100,
        ...(pageParam && { lastKey: pageParam }),
        ...(isJobPage && filters.sortOrder
          ? { sortOrder: filters.sortOrder === "asc" ? "asc" : "desc" }
          : {})
      };
      const { jobTitle, YOE, coreSkills,pageSize,sortOrder,status,lastKey, ...rest } = filters;

      // Check if rest contains any filter (i.e., any key with a non-null/undefined value)
      const hasAnyOtherFilter = Object.values(rest).some(value => value !== undefined && value !== null);
      
      if (hasAnyOtherFilter) {
        delete updatedFilters.jobTitle;
        delete updatedFilters.YOE;
        delete updatedFilters.coreSkills;
      
        console.info("Removed default filters because at least one other filter is present.");
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
      if(isJobPage){
        updatedFilters.status = "PUBLISHED";
      }

      const apiUrl = isJobPage ? `${APP_JOBS_API_URI}/job/` : '/company';
      
      try {
        const { response, error } = await httpServiceObj.get<
          typeof isJobPage extends true ? GlobalApiQueryResponseDto<JobDto> : any
        >(
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
          response.data as JobDto[];
          setCompanyJobData((prevData) => {
            // If filtering, return new data
            if (isFiltering) return response.data;
            // If appending, combine previous and new data
            const existingData = prevData || [];
            return [...existingData, ...response.data];
          });
  
          // Fetch matching scores for new jobs if user is logged in
          if (response.data.length > 0 && isLoggedIn) {
            fetchJobMatchingScores(
              response.data.map((job: JobDto) => (job))
            );
            
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
    if(!isInitialFilterSet && companyPageMode === CompanyPageModeEnum.JOB) return false
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
    setIsProfileInclomplete,
    setIsInitialFilterSet,
    }),
    [companyPageMode, jobFilterForRender, companyJobData, searchText, isLoading, isUserDetailsLoading, companyRefData, apiHasData, isError, hasNextPage, fetchNextPage, isFetchingNextPage,resetFiltersValues,isProfileInclomplete,setIsProfileInclomplete,setIsInitialFilterSet]
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
