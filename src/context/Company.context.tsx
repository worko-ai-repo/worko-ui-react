import Loader from '@Components/Loader/Loader';
import { keepPreviousData, QueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import httpServiceObj from '@Services/ApiHandler.service';
import { ContextProviderProps } from '@Interfaces/ContextProvider.dto';
import { CompanyContextType, CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { createContext, useState, useContext, useCallback, useLayoutEffect, useMemo, useEffect } from 'react';
import { CompanyShortDto, FilterOptionForRender, JobDto, JobFiltersDto, JobMatchingScoreDto, UserBasicDetailsDto } from '@Interfaces/JobsAndCompany.dto';
import { filterMetaData } from '@Components/Company/FilterData';
import ErrorWarning from '@Components/Shared/ContextErrorHandler';
import { generateFilterForRender, invalidateFilterCache } from '@Utils/GenerateFiltersForRender';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAppContext } from './App.context';

// Create the context object
export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
const queryClient = new QueryClient();

// Create the provider component
export const CompanyProvider = ({ children }: ContextProviderProps) => {
	// Init useLocations to get the current path
	const {isLoggedIn} = useAppContext();
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const companyId = searchParams.get("compid") || undefined; // Extract `compid` from query

	const initialMode = location.pathname.includes('job') ? CompanyPageModeEnum.JOB : CompanyPageModeEnum.REFERRAL;

	// States
	const [companyPageMode, setCompanyPageMode] = useState<CompanyPageModeEnum>(initialMode);
	const [companyJobData, setCompanyJobData] = useState<JobDto[] | undefined>();
	const [companyRefData, setCompanyRefData] = useState<CompanyShortDto[] | undefined>();
	const [searchText, setSearchText] = useState<string>('');
	const [apiHasData, setApiHasData] = useState<boolean>(false);
	const [userDesignation, setUserDesignation] = useState<string>('');
	const [isUserDetailsLoading, setIsUserDetailsLoading] = useState<boolean>(false);

	const [jobFilters, setJobFilters] = useState<JobFiltersDto>({
		pageSize: 10,
		sortOrder: 'descending',
		searchText: searchText || userDesignation || '',
	});

	const [jobFilterForRender, setJobFilterForRender] = useState<FilterOptionForRender[]>([]);


	// useLayoutEffect to check if we are on job page or referral page
	useLayoutEffect(() => {
		const mode = location.pathname.includes('job') ? CompanyPageModeEnum.JOB : CompanyPageModeEnum.REFERRAL;

		if (location.pathname.includes('job') && isLoggedIn) {
			fetchUserBasicDetails();
		}
		
		setCompanyPageMode(mode);
		//Reset data on mode change
		setCompanyJobData([]);
		setCompanyRefData([]);
		// setJobMatchingScores({}); // Reset matching scores
		setJobFilters({ pageSize: 10, sortOrder: 'descending', searchText: '' }); // Reset filters on mode change
		// Reset the filter options cache when mode changes
		invalidateFilterCache();
		// queryClient.invalidateQueries({ queryKey: ['GET', mode] });
	}, [location.pathname]);

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
			const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(
				'https://api.dev.worko.work/user/basic-details',
				true,
				{},
				true
			);
	
			if (error) throw error;
	
			if (response?.candidateExperience?.designation && response.candidateExperience.designation !== userDesignation) {
				setUserDesignation(response.candidateExperience.designation);
				setJobFilters(prev => ({ ...prev, searchText: response?.candidateExperience?.designation }));
			}
		} catch (err) {
			console.error('Exception in fetchUserBasicDetails:', err);
		} finally {
			setIsUserDetailsLoading(false);
		}
	}, [companyPageMode, userDesignation]);
	

	/**
	 * handleSearch
	 *
	 * @description - This function is used to handle the search functionality
	 */
	const handleSearch = () => {
		setJobFilters(prev => ({ ...prev, searchText }));
		// Reset the filter options cache when searching
		invalidateFilterCache();
		queryClient.invalidateQueries({ queryKey: ['GET', companyPageMode] });
	};

	const resetSearch = () => {
		setSearchText('');
		setJobFilters(prev => ({ ...prev, searchText: '' }));
		// Reset the filter options cache when resetting search
		invalidateFilterCache();
		queryClient.invalidateQueries({ queryKey: ['GET', companyPageMode] });
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
const fetchJobMatchingScores = useCallback(async (jobIds: string[]) => {
    // Step 1: Check if there are any job IDs to process; if not, exit early.
    if (!jobIds.length) return;

    try {
        // Step 2: Format the job IDs as a comma-separated string for the API request.
        const jobIdsParam = jobIds.join(',');
        const pageSize = jobIds.length; // Ensure we get all requested jobs in one response.

        // Step 3: Make an API call to fetch job matching scores.
        const { response, error } = await httpServiceObj.get<{ data: JobMatchingScoreDto[] }>(
            `https://jobs.dev.worko.work/user-matching-score-job/?jobIds=${jobIdsParam}&pageSize=${pageSize}`,
            true,
            {},
            true
        );

        // Step 4: If there's an error in the API call, log it and stop further execution.
        if (error) {
            console.error('Error fetching job matching scores:', error);
            return;
        }

        // Step 5: Store retrieved scores in a map and track received job IDs.
        const scoresMap: Record<string, JobMatchingScoreDto> = {};
        const receivedJobIds = new Set<string>();

        response?.data?.forEach(score => {
            scoresMap[score.jobId] = score;
            receivedJobIds.add(score.jobId);
        });

        // Step 6: Identify which job IDs are missing from the response.
        const missingJobIds = jobIds.filter(id => !receivedJobIds.has(id));

        // Step 8: Update `companyJobData` to include matching scores and applyStatus.
		setCompanyJobData(prev =>
			prev?.map(job => ({
				...job,
				matchingScore: scoresMap[job.id]?.matchingScore ?? undefined,
				applyStatus: scoresMap[job.id] ? 'APPLIED' : 'NOT_APPLIED'
			}))
		);
		

        // Step 9: If there are missing job scores, log them and trigger score generation.
        if (missingJobIds.length > 0) {
            console.log('Missing matching scores for job IDs:', missingJobIds);

            // Step 10: Make a PUT request to trigger job matching score generation for the missing jobs.
            const { response: putResponse, error: putError } = await httpServiceObj.put<{ matchingScoreCalculationStatus: boolean }>(
                'https://jobs.dev.worko.work/user-matching-score-job/',
                { jobIds: missingJobIds },
                true,
                {},
                true
            );

            // Step 11: If there's an error generating the missing scores, log and exit.
            if (putError) {
                console.error('Error generating job matching scores:', putError);
                return;
            }

            // Step 12: If the generation was successful, retry fetching the missing scores after 5 seconds.
            if (putResponse?.matchingScoreCalculationStatus) {
                console.log('Successfully triggered matching score generation, retrying in 5 seconds...');

                // Step 13: Use a timeout to retry fetching scores once after 5 seconds.
             //   setTimeout(() => fetchJobMatchingScores(missingJobIds), 5000);
            } else {
                console.warn('Failed to generate matching scores');
            }
        }
    } catch (err) {
        // Step 14: Handle any unexpected errors that occur during the execution.
        console.error('Exception in fetchJobMatchingScores:', err);
    }
}, [setCompanyJobData]);


	/**
	 * Handle Query Function
	 *
	 * @description - This function is used to handle the query function for fetching data from the API
	 */
	const CompanyQueryHandler = useCallback(
		async ({ pageParam = null, filters }: { pageParam?: string | null; filters: JobFiltersDto }) => {
			const isJobPage = location.pathname.includes('job');
			const isFiltering = !pageParam; // If `pageParam` is null, it's a new filter request
			// Update filters dynamically
			const updatedFilters = {
				...filters,
				lastKey: pageParam,
				...(companyId && isJobPage ? { companyId } : {}),
				...(isJobPage && filters.sortOrder
					? { sortOrder: filters.sortOrder === 'ascending' ? 'asc' : 'desc' }
					: {}),
			};
	
			const apiUrl = isJobPage
				? `https://jobs.dev.worko.work/job/`
				: `/company`;
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
				generateFilterForRender(
					response.data,
					companyPageMode,
					finalFilterMetaData,
					setJobFilterForRender,
					isFiltering
				);
	
				setApiHasData(response.data.length > 0);
	
				if (isJobPage) {
					setCompanyJobData(prev => (isFiltering ? response.data : [...(prev || []), ...response.data]));
	
					if (response.data.length > 0 && isLoggedIn) {
						fetchJobMatchingScores(response.data.map((job: { id: any }) => job.id));
					}
				} else {
					setCompanyRefData(prev => (isFiltering ? response.data : [...(prev || []), ...response.data]));
				}
	
				return {
					data: response,
					nextPage: response.pagination?.lastKey, // Pass lastKey for pagination if available
				};
			} catch (error) {
				console.error('Error fetching company/job data:', error);
				throw error;
			}
		},
		[companyPageMode, companyId, fetchJobMatchingScores, userDesignation]
	);
	
	/**
	 * useInfiniteQuery
	 *
	 * @description - This hook is used to fetch data from the API
	 */
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
		queryKey: ['GET', companyPageMode, companyId, jobFilters],
		queryFn: ({ pageParam }) => CompanyQueryHandler({ pageParam, filters: jobFilters }),
		getNextPageParam: lastPage => lastPage.nextPage || undefined, // Pass lastKey as nextPageParam
		initialPageParam: null, // Set initial page param to null
		// Enable for referrals always, but for jobs only if we have userDesignation
		enabled: (!!companyPageMode && jobFilters.pageSize! > 0) && 
				(companyPageMode === CompanyPageModeEnum.REFERRAL || 
				 (companyPageMode === CompanyPageModeEnum.JOB && (!isUserDetailsLoading))),
		retry: 0
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
			fetchUserBasicDetails
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
		throw new Error('useCompanyContext must be used within an AuthProvider');
	}
	return context;
};