import { useAppContext } from "./App.context";
import httpServiceObj from "@Services/ApiHandler.service";
import { filterMetaData } from "@Components/Company/FilterData";
import { useLocation, useSearchParams } from "react-router-dom";
import ErrorWarning from "@Components/Shared/ContextErrorHandler";
import { ContextProviderProps } from "@Interfaces/ContextProvider.dto";
import { CompanyContextType, CompanyPageModeEnum } from "@Interfaces/CompanyContext.dto";
import { generateFilterForRender, invalidateFilterCache } from "@Utils/GenerateFiltersForRender";
import { QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  CompanyShortDto,
  FilterOptionForRender,
  GlobalApiQueryResponseDto,
  JobDto,
  JobFiltersDto,
  JobMatchingScoreDto,
  UserBasicDetailsDto,
} from "@Interfaces/JobsAndCompany.dto";
import { compareResumeWithJD } from "@Utils/CompareResumeWithJD.utils";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";

// Create the context object
export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
const queryClient = new QueryClient();

// Create the provider component
export const CompanyProvider = ({ children }: ContextProviderProps) => {
  // Init useLocations to get the current path
  const { isLoggedIn } = useAppContext();
  const location = useLocation();

  const initialMode = location.pathname.includes("job")
    ? CompanyPageModeEnum.JOB
    : CompanyPageModeEnum.REFERRAL;

  // States
  const [companyPageMode, setCompanyPageMode] = useState<CompanyPageModeEnum>(initialMode);
  const [userBasicDetails, setUserBasicDetails] = useState<UserBasicDetailsDto>();
  const [companyJobData, setCompanyJobData] = useState<JobDto[] | undefined>();
  const [companyRefData, setCompanyRefData] = useState<CompanyShortDto[] | undefined>();
  const [searchText, setSearchText] = useState<string>("");
  const [s3VectorPageNumber, setS3VectorPageNumber] = useState<number>(1);
  const [apiHasData, setApiHasData] = useState<boolean>(false);
  const [isUserDetailsLoading, setIsUserDetailsLoading] = useState<boolean>(false);
  const [isProfileInclomplete, setIsProfileInclomplete] = useState<boolean>(false);
  const [isProfileIncompWithoutCV, setIsProfileIncompWithoutCV] = useState<boolean>(false);
  const [defaultFiltersState, setDefaultFiltersState] = useState<{
    userDesignation: string;
    coreSkills?: any;
    YOE?: any;
  }>();
  const [isInitialFilterSet, setIsInitialFilterSet] = useState<boolean>(false);
  const [defaultCoreSkills, setDefaultCoreSkills] = useState<string[] | undefined>([]);
  const pagesCountRef = useRef<number>(0);

  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI;
  const APP_API_URI = import.meta.env.APP_API_URI;

  const [jobFilters, setJobFilters] = useState<JobFiltersDto>({
    pageSize: 10,
    sortOrder: "descending",
  });

  // Memoized default filters
  const defaultFilters: JobFiltersDto = useMemo(() => {
    return {
      pageSize: 10,
      sortOrder: "descending",
      ...(defaultFiltersState?.userDesignation && {
        jobTitle: defaultFiltersState.userDesignation,
      }),
      ...(defaultFiltersState?.coreSkills && { coreSkills: defaultFiltersState.coreSkills }),
      ...(defaultFiltersState?.YOE !== undefined && { YOE: defaultFiltersState.YOE }),
    };
  }, [defaultFiltersState]);

  const [jobFilterForRender, setJobFilterForRender] = useState<FilterOptionForRender[]>([]);
  const isCorporate = secureStorage
    .getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE)
    ?.includes(UserRole.CORPORATE);

  // useLayoutEffect to check if we are on job page or referral page
  useLayoutEffect(() => {
    const mode = location.pathname.includes("job")
      ? CompanyPageModeEnum.JOB
      : CompanyPageModeEnum.REFERRAL;
    if (location.pathname.includes("job") && isLoggedIn && !isCorporate) {
      fetchUserBasicDetails();
    }

    setCompanyPageMode(mode);
    //Reset data on mode change
    setCompanyJobData([]);
    setCompanyRefData([]);
    resetFiltersValues();
    // Reset s3 pagination on mode change
    setS3VectorPageNumber(1);
    // Reset the filter options cache when mode changes
    invalidateFilterCache();
  }, [location.pathname, companyPageMode]);

  /**
   * resetFiltersValues
   *
   * @description - This function is used to reset the filter values
   */
  const resetFiltersValues = () => {
    if (isLoggedIn && defaultFiltersState && location.pathname.includes("job")) {
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

  // Track loaded pages count for stable pagination computations
  useEffect(() => {
    // data may be undefined before query initialization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyData: any = undefined as unknown as any;
    pagesCountRef.current =
      (anyData && anyData.pages && anyData.pages.length) || pagesCountRef.current;
  }, []);

  // Fetch User Basic Details Function
  const fetchUserBasicDetails = useCallback(async () => {
    if (companyPageMode !== CompanyPageModeEnum.JOB) return;

    setIsUserDetailsLoading(true);
    try {
      const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(
        `${APP_API_URI}/user/basic-details`,
        true,
        {},
        true
      );

      if (error) throw error;

      const designation = response?.candidateExperience?.designation;
      const coreSkills = response?.coreSkills?.map((skill) => skill.skillName);
      setDefaultCoreSkills(coreSkills);
      if (response) setUserBasicDetails(response);

      // If either designation or coreSkills exist, update filters
      if (
        response &&
        "CTC" in response &&
        response?.isCvExtracted === true &&
        (designation || coreSkills?.length || response?.YOE)
      ) {
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
        if ((response && !("CTC" in response)) || !response?.YOE || coreSkills?.length === 0) {
          setIsProfileIncompWithoutCV(true);
        }
        setIsProfileInclomplete(true);
        setDefaultFiltersState({
          userDesignation: "", // Ensure userDesignation is always a string
          ...{ coreSkills },
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
    // Reset pagination for fresh search
    setS3VectorPageNumber(1);
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
    // Reset pagination when clearing search
    setS3VectorPageNumber(1);
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
    async (jobs: JobDto[]) => {
      // Exit early if no jobs to process
      if (!jobs.length) return;
      // console.log("Jobs to fetch matching scores for:", jobs);

      try {
        // Create a copy of the missing job IDs set to track which jobs still need processing
        const updatedMissingJobIdsSet = new Set(missingJobIdsSet);

        // Set batch size to process 25 jobs at a time
        const BATCH_SIZE = 25;
        // Set delay between batches to 50ms for UI responsiveness
        const BATCH_DELAY = 50;

        // Initialize object to store calculated scores for each job ID
        const scoresMap: Record<string, any> = {};

        // Loop through jobs in batches to avoid blocking UI
        for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
          // Get current batch of jobs using slice
          const batch = jobs.slice(i, i + BATCH_SIZE);

          // Process each job in the current batch
          batch.forEach((job) => {
            // Add job ID to the set of jobs being processed
            updatedMissingJobIdsSet.add(job.id);

            // Check if user basic details exist before calculating score
            if (!userBasicDetails) return;
            // Calculate matching score between job and user resume
            const { totalScore } = compareResumeWithJD(job, userBasicDetails);

            // Store the calculated score in the scores map
            scoresMap[job.id] = {
              id: job.id,
              scores: totalScore,
            };
            // console.log("Job ID:", job.id, "Matching Score:", matchingScore);
          });

          // Wait for specified delay before processing next batch
          await new Promise((res) => setTimeout(res, BATCH_DELAY));
        }

        // Update the missing job IDs set state
        setMissingJobIdsSet(updatedMissingJobIdsSet);

        // Update company job data with new matching scores
        setCompanyJobData((prev) => {
          // Return undefined if previous data doesn't exist
          if (!prev) return undefined;

          // Create a map of existing jobs for efficient lookup by ID
          const existingJobsMap = prev.reduce((acc, job) => {
            // Add each job to the accumulator object with job ID as key
            acc[job.id] = job;
            return acc;
          }, {} as Record<string, JobDto>);

          // Loop through all calculated scores to update jobs
          Object.keys(scoresMap).forEach((jobId) => {
            // Get new matching score or fallback to existing score
            const matchingScore = scoresMap[jobId]?.scores ?? existingJobsMap[jobId].matchingScore;

            // Update job object with new matching score
            existingJobsMap[jobId] = {
              ...existingJobsMap[jobId],
              matchingScore,
            };

            // Remove processed job ID from missing jobs set
            setMissingJobIdsSet((prevSet) => {
              // Create new Set instance to avoid mutation
              const newSet = new Set(prevSet);
              // Remove the job ID from the set
              newSet.delete(jobId);
              return newSet;
            });
          });

          // Map original jobs array to updated jobs with new scores
          const updatedJobs = prev.map((job) => existingJobsMap[job.id] || job);

          // Sort jobs with custom sorting logic
          updatedJobs.sort((a, b) => {
            // Check if job 'a' is internal with high matching score (>=10)
            const aInternalHigh = !a.externalJobId && (a.matchingScore ?? 0) >= 50;
            // Check if job 'b' is internal with high matching score (>=10)
            const bInternalHigh = !b.externalJobId && (b.matchingScore ?? 0) >= 50;

            // Prioritize internal high-scoring job 'a' over others
            if (aInternalHigh && !bInternalHigh) return -1;
            // Prioritize internal high-scoring job 'b' over others
            if (!aInternalHigh && bInternalHigh) return 1;

            // Sort remaining jobs by matching score in descending order
            return (b.matchingScore ?? 0) - (a.matchingScore ?? 0);
          });

          // Return the sorted and updated jobs array
          return updatedJobs;

          /*  // Alternative: Simple reconstruction without custom sorting
        return prev.map((job) => existingJobsMap[job.id] || job); */
        });
      } catch (err) {
        // Log any errors that occur during the process
        console.error("Exception in fetchJobMatchingScores:", err);
      }
    },
    // Dependencies array for useCallback hook
    [setCompanyJobData, missingJobIdsSet, userBasicDetails]
  );

  /*   useEffect(() => {
    const coreSkillsFromParams = urlParams.get("coreSkills")?.split(",");
    setJobFilters((prev) => ({
      ...prev,
      coreSkills: coreSkillsFromParams ?? defaultCoreSkills ?? [], // Use coreSkills from URL params or defaultCoreSkills if not available
    }));
    console.info("CoreSkills from URL params used:", coreSkillsFromParams);
  }, []); */
  /**
   * Handle Query Function
   *
   * @description - This function is used to handle the query function for fetching data from the API
   */

  const CompanyQueryHandler = useCallback(
    async ({
      pageParam = null,
      filters,
      fallbackLevel = 1,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pageParam?: any;
      filters: JobFiltersDto;
      fallbackLevel?: 1 | 2 | 3;
    }): Promise<any> => {
      // Check if we are on the job page
      const isJobPage = location.pathname.includes("job");
      // If pageParam is null, it's a new filter request
      const isFiltering = pageParam === null;

      // Create updated filters object
      const updatedFilters: JobFiltersDto = {
        ...filters,
        pageSize: 30,
        // Only attach lastKey for non-job pages; job uses s3VectorPageNumber
        ...(pageParam && ((!isLoggedIn && isJobPage) || !isJobPage) ? { lastKey: pageParam } : {}),
        ...(isJobPage && filters.sortOrder
          ? { sortOrder: filters.sortOrder === "asc" ? "asc" : "desc" }
          : {}),
        ...(!isJobPage && { isVerified: 1 }),
      };

      const urlParams = new URLSearchParams(window.location.search);
      const coreSkillsFromParams = urlParams.get("coreSkills")?.split(",");
      // Determine effective coreSkills priority for job page:
      // explicit filter > URL param > default user core skills (if logged in)
      if (isJobPage) {
        const hasExplicitCoreSkills =
          Array.isArray(filters.coreSkills) && filters.coreSkills.length > 0;
        const hasParamCoreSkills =
          Array.isArray(coreSkillsFromParams) && coreSkillsFromParams.length > 0;
        if (hasExplicitCoreSkills) {
          updatedFilters.coreSkills = filters.coreSkills;
        } else if (hasParamCoreSkills) {
          updatedFilters.coreSkills = coreSkillsFromParams;
        } else if (isLoggedIn) {
          updatedFilters.coreSkills = defaultCoreSkills;
        }
        const { jobTitle, YOE, coreSkills, pageSize, sortOrder, status, lastKey, ...rest } =
          filters;
        console.log("Filters received in Job Page:", filters);
        // Check if rest contains any filter (i.e., any key with a non-null/undefined value)
        const hasAnyOtherFilter = Object.values(rest).some(
          (value) => value !== undefined && value !== null
        );
        //check if rest has searchText or companyId
        const hasSearchOrCompanyId = !!(rest.searchText || rest.companyName);

        if (hasSearchOrCompanyId) {
          //then delete all default filters
          delete updatedFilters.jobTitle;
          delete updatedFilters.YOE;
          delete updatedFilters.coreSkills;
        } else if (hasAnyOtherFilter && !coreSkillsFromParams) {
          delete updatedFilters.jobTitle;
          delete updatedFilters.YOE;
          console.info("Removed default filters because at least one other filter is present.");
        } else if (hasAnyOtherFilter || coreSkillsFromParams) {
          // If coreSkillsFromParams is present, keep it in the updatedFilters
          updatedFilters.coreSkills = coreSkillsFromParams;
          delete updatedFilters.jobTitle;
          delete updatedFilters.YOE;
        }
      }

      const {
        jobTitle,
        YOE,
        coreSkills,
        pageSize,
        sortOrder,
        status,
        lastKey,
        s3VectorPageNumber,
        fromS3Vector,
        includeCompanyDetails,
        ...rest
      } = filters;

      // Persist default jobTitle and YOE unless explicitly overridden.
      // YOE will be removed only if experienceRange is present (handled below).

      // Step 7 → If any filter includes 'experience Range' in its key, remove YOE
      if (filters.experienceRange) {
        delete updatedFilters.YOE;
      }

      // if updatedFilters has salaryRange or experienceRange, then exclude those values
      if (updatedFilters.salaryRange) {
        delete updatedFilters.salaryRange;
      }
      if (updatedFilters.experienceRange) {
        delete updatedFilters.experienceRange;
      }
      if (updatedFilters?.industry) {
        updatedFilters.industryName = updatedFilters.industry;
        delete updatedFilters.industry;
      }
      if (isJobPage) {
        updatedFilters.status = "PUBLISHED";
        updatedFilters.sortOrder = "desc";
      }
      if (isJobPage) {
        updatedFilters.fromS3Vector = isLoggedIn;
        updatedFilters.includeCompanyDetails = true;
        // Derive from pages count ref to avoid race with async setState
        const derivedPageNumber = isFiltering ? 1 : Math.max(1, pagesCountRef.current + 1);
        updatedFilters.s3VectorPageNumber = derivedPageNumber;
      }
      //sanitize the filters by removing null or undefined values
      Object.keys(updatedFilters).forEach((key) => {
        if (updatedFilters[key as keyof JobFiltersDto] === null) {
          delete updatedFilters[key as keyof JobFiltersDto];
        }
        if (updatedFilters[key as keyof JobFiltersDto] === undefined) {
          delete updatedFilters[key as keyof JobFiltersDto];
        }
        if (Array.isArray(updatedFilters[key as keyof JobFiltersDto])) {
          if ((updatedFilters[key as keyof JobFiltersDto] as []).length === 0) {
            delete updatedFilters[key as keyof JobFiltersDto];
          }
        }
      });
      const apiUrl = isJobPage ? `${APP_JOBS_API_URI}/job/` : "/company";
      try {
        const { response, error } = await httpServiceObj.get<
          typeof isJobPage extends true ? GlobalApiQueryResponseDto<JobDto> : any
        >(apiUrl, true, updatedFilters, isJobPage);
        if (error) throw error;
        // Decide the filterMetaData based on the page mode
        const finalFilterMetaData = isJobPage
          ? filterMetaData.jobFilter
          : filterMetaData.referralFilter;
        // recursively fetch job if default Filters were applied and no data was returned
        if (
          response.data.length <= 1 &&
          ("YOE" in updatedFilters ||
            "coreSkills" in updatedFilters ||
            "jobTitle" in updatedFilters) &&
          isJobPage &&
          isFiltering
        ) {
          setCompanyJobData([]); //  Clear stale jobs immediately

          const newFilters = { ...updatedFilters };
          // if (fallbackLevel === 1) {
          //   delete newFilters.YOE;
          //   // delete newFilters.coreSkills;
          //   return CompanyQueryHandler({ pageParam, filters: newFilters, fallbackLevel: 2 });
          // } else if (fallbackLevel === 2) {
          //   delete newFilters.jobTitle;
          //   return CompanyQueryHandler({ pageParam, filters: newFilters, fallbackLevel: 3 });
          // } else if (fallbackLevel === 3) {
          //   generateFilterForRender(
          //     [],
          //     companyPageMode,
          //     finalFilterMetaData,
          //     setJobFilterForRender,
          //     isFiltering
          //   );
          //   return { data: [], nextPage: null };
          // }
        }

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
            fetchJobMatchingScores(response.data.map((job: JobDto) => job));
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
          nextPage:
            isJobPage && isLoggedIn
              ? response.pagination?.s3VectorLastKey
              : response.pagination?.lastKey,
        };
      } catch (error) {
        console.error("Error fetching company/job data:", error);
        throw error;
      }
    },
    [companyPageMode, fetchJobMatchingScores, isLoggedIn, s3VectorPageNumber, defaultCoreSkills]
  );
  const shouldEnableQuery = () => {
    if (!companyPageMode || jobFilters.pageSize! <= 0) return false; // If page mode is not set or pageSize is 0, return false
    if (
      companyPageMode !== CompanyPageModeEnum.REFERRAL &&
      companyPageMode !== CompanyPageModeEnum.JOB
    )
      return false; // If page mode is not valid, return false
    // if(!hasNextPage) return false;
    // @Todo- fix this
    if (isLoggedIn && companyPageMode === CompanyPageModeEnum.REFERRAL) {
      return true;
    }
    if (isLoggedIn && !defaultFiltersState && !isCorporate) return false; // If logged in, ensure userDesignation is present
    if (!isInitialFilterSet && companyPageMode === CompanyPageModeEnum.JOB) return false;
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
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["GET", companyPageMode, jobFilters],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: ({ pageParam }: any) => CompanyQueryHandler({ pageParam, filters: jobFilters }) as any,
    getNextPageParam: (lastPage) => lastPage.nextPage || undefined, // Pass lastKey as nextPageParam
    initialPageParam: null,
    enabled: shouldEnableQuery(),
    retry: 0,
    // Removed keepPreviousData as it is not supported in useInfiniteQuery
    // staleTime: 1000 * 60 , // 5 seconds
  });

  // Keep pagesCountRef in sync with query data
  useEffect(() => {
    pagesCountRef.current = data?.pages?.length ?? 0;
  }, [data?.pages?.length]);

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
      isLoading: isLoading || isFetching || isUserDetailsLoading,
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
      setS3VectorPageNumber,
      isProfileIncompWithoutCV,
      setIsProfileIncompWithoutCV,
    }),
    [
      companyPageMode,
      jobFilterForRender,
      companyJobData,
      searchText,
      isLoading,
      isUserDetailsLoading,
      companyRefData,
      apiHasData,
      isError,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      resetFiltersValues,
      isProfileInclomplete,
      setIsProfileInclomplete,
      setIsInitialFilterSet,
      setS3VectorPageNumber,
      isProfileIncompWithoutCV,
      setIsProfileIncompWithoutCV,
    ]
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
