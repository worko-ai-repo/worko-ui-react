import Loader from '@Components/Loader/Loader';
import { keepPreviousData, QueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import httpServiceObj from '@Services/ApiHandler.service';
import { ContextProviderProps } from '@Interfaces/ContextProvider.dto';
import { CompanyContextType, CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { createContext, useState, useContext, useCallback, useLayoutEffect, useMemo, useEffect } from 'react';
import { CompanyShortDto, FilterOptionForRender, JobDto, JobFiltersDto, JobMatchingScoreDto } from '@Interfaces/JobsAndCompany.dto';
import { filterMetaData } from '@Components/Company/FilterData';
import ErrorWarning from '@Components/Shared/ContextErrorHandler';
import { generateFilterForRender, invalidateFilterCache } from '@Utils/GenerateFiltersForRender';
import { useLocation, useSearchParams } from 'react-router-dom';

// Create the context object
export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
const queryClient = new QueryClient();

// Create the provider component
export const CompanyProvider = ({ children }: ContextProviderProps) => {
	// Init useLocations to get the current path
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

	const [jobFilters, setJobFilters] = useState<JobFiltersDto>({
		pageSize: 10,
		sortOrder: 'descending',
		searchText: searchText,
		//	companyId: location.state.id || '',
	});

	const [jobFilterForRender, setJobFilterForRender] = useState<FilterOptionForRender[]>([]);

	// New state for job matching scores
	const [jobMatchingScores, setJobMatchingScores] = useState<Record<string, JobMatchingScoreDto>>({});

	// useLayoutEffect to check if we are on job page or referral page
	useLayoutEffect(() => {
		const mode = location.pathname.includes('job') ? CompanyPageModeEnum.JOB : CompanyPageModeEnum.REFERRAL;
		setCompanyPageMode(mode);
		//Reset data on mode change
		setCompanyJobData([]);
		setCompanyRefData([]);
		setJobMatchingScores({}); // Reset matching scores
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

	// Functions

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
	 */
	const fetchJobMatchingScores = useCallback(async (jobIds: string[]) => {
		if (!jobIds.length) return;
		
		try {
			const { response, error } = await httpServiceObj.put<JobMatchingScoreDto[]>(
				'https://jcsi3qfp9g.execute-api.ap-south-1.amazonaws.com/dev/user-matching-score-job/',
				{ jobIds },
				true,
				{}, //not sure about this param
				true,
				
			);
			
			if (error) {
				console.error('Error fetching job matching scores:', error);
				return;
			}
			
			if (response) {
				// Convert the array to a map with jobId as the key for easy lookup
				const scoreMap: Record<string, JobMatchingScoreDto> = {};
				console.log(response);
				response.forEach(score => {
					scoreMap[score.jobId] = score;
				});
				
				setJobMatchingScores(prev => ({
					...prev,
					...scoreMap
				}));
			}
		} catch (err) {
			console.error('Exception in fetchJobMatchingScores:', err);
		}
	}, []);

	/**
	 * Handle Query Function
	 *
	 * @description - This function is used to handle the query function for fetching data from the API
	 */
	const CompanyQueryHandler = useCallback(
		async ({ pageParam = null, filters }: { pageParam?: string | null; filters: JobFiltersDto }) => {
			const updatedFilters = {
				...filters,
				lastKey: pageParam,
				...((companyId && location.pathname.includes('job')) ? { companyId } : {}), // Only add companyId if it's defined
			};
			const company_path = companyId ? "company/"+companyId : 'company'; 
			

			let response, error;

        if (location.pathname.includes('job')) {
			if(updatedFilters.sortOrder) {
				updatedFilters.sortOrder=='ascending' ? updatedFilters.sortOrder='asc' : updatedFilters.sortOrder='desc'
			}
            ({ response, error } = await httpServiceObj.get<any>(
                'https://jcsi3qfp9g.execute-api.ap-south-1.amazonaws.com/dev/job',
                true,
                updatedFilters,
                true // Use fullUri for 'job'
            ))
			//console.log(response);
        } else {
            ({ response, error } = await httpServiceObj.get<any>(
                `/${company_path}`,
                true,
                updatedFilters,
                false // Do not use fullUri
            ));
        }


			if (error) throw error;
			// Normalize response when `companyId` is provided
			const normalizedResponse =( location.pathname.includes('referral') && companyId )
			? {
				data: [response[0]], // Wrap single object in an array
				pagination: { count: 1, pageSize: 10, lastKey: null }, // Adjust pagination to match the expected format
				}
			: response; // Use API response directly if no companyId
			console.log(normalizedResponse.data)
			// Determine if it's a new filter OR a paginated request
			const isFiltering = !pageParam; // If `pageParam` is null, it's a new filter request
			
			// Generate filters for rendering, indicating if this is a filter request or pagination
			generateFilterForRender(normalizedResponse.data, companyPageMode, filterMetaData, setJobFilterForRender, isFiltering);

			// Check if API returned data
			setApiHasData(normalizedResponse.data.length > 0);

			if (location.pathname.includes('job')) {
				setCompanyJobData(prev => (isFiltering ? normalizedResponse.data : [...(prev || []), ...normalizedResponse.data]));
				// Fetch matching scores for job IDs if we have jobs
				if (normalizedResponse.data.length > 0) {
					const jobIds = normalizedResponse.data.map((job: { id: any; }) => job.id);
					fetchJobMatchingScores(jobIds);
				}
			} else {
				setCompanyRefData(prev => (isFiltering ? normalizedResponse.data : [...(prev || []), ...normalizedResponse.data]));
			}

			return {
				data: normalizedResponse,
				nextPage: normalizedResponse.pagination.lastKey ?? undefined, // Pass lastKey for pagination
			};
		},
		[companyPageMode,companyId, fetchJobMatchingScores]
	);

	/**
	 * useInfiniteQuery
	 *
	 * @description - This hook is used to fetch data from the API
	 *	* Handles fetching more data using infinite pagination.
	 *	* - When `fetchNextPage()` is called, React Query executes `getNextPageParam`.
	 *	* - `getNextPageParam: lastPage => lastPage.nextPage || undefined` extracts `nextPage` from the last fetched page.
	 *	* - The `lastPage.nextPage` contains `lastKey`, which is returned from the API response.
	 *	* - React Query automatically injects this `nextPage` value as `pageParam` into the next request.
	 *	*
	 *	* This ensures seamless infinite scrolling or paginated data fetching.
	 */
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
		queryKey: ['GET', companyPageMode,companyId, jobFilters],
		queryFn: ({ pageParam }) => CompanyQueryHandler({ pageParam, filters: jobFilters }),
		getNextPageParam: lastPage => lastPage.nextPage || undefined, // Pass lastKey as nextPageParam
		initialPageParam: null, // Set initial page param to null
		enabled: !!companyPageMode && jobFilters.pageSize! > 0, //@Can Cause Error bc I made pageSize optional
		retry: 0,

	});

	/**
	 * Context Value
	 *
	 * This object contains the values and functions that will be available to the components
	 * that are children of the provider and useMemo is used to memoize the context value
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
			isLoading,
			companyRefData,
			apiHasData,
			isError,
			hasNextPage,
			isFetchingNextPage,
			fetchNextPage,
			jobMatchingScores
		}),
		[companyPageMode, jobFilterForRender, searchText, isLoading, handleSearch, fetchNextPage, isFetchingNextPage, jobMatchingScores]
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
