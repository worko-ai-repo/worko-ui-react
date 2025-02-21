import Loader from '@Components/Loader/Loader';
import { keepPreviousData, QueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import httpServiceObj from '@Services/ApiHandler.service';
import { ContextProviderProps } from '@Interfaces/ContextProvider.dto';
import { CompanyContextType, CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { createContext, useState, useContext, useCallback, useLayoutEffect, useMemo, useEffect } from 'react';
import { CompanyShortDto, FilterOptionForRender, JobDto, JobFiltersDto } from '@Interfaces/JobsAndCompany.dto';
import { filterMetaData } from '@Components/Company/FilterData';
import ErrorWarning from '@Components/Shared/ContextErrorHandler';
import { generateFilterForRender, normalizeSkills } from '@Utils/GenerateFiltersForRender';
import { useLocation } from 'react-router-dom';

// Create the context object
export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);
const queryClient = new QueryClient();

// Create the provider component
export const CompanyProvider = ({ children }: ContextProviderProps) => {
	// Init useLocations to get the current path
	const location = useLocation();
	//debugger;
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


	// useLayoutEffect to check if we are on job page or referral page
	useLayoutEffect(() => {
		const mode = location.pathname.includes('job') ? CompanyPageModeEnum.JOB : CompanyPageModeEnum.REFERRAL;
		setCompanyPageMode(mode);
		//Reset data on mode change
		setCompanyJobData([]);
		setCompanyRefData([]);
		setJobFilters({ pageSize: 10, sortOrder: 'descending', searchText: '' }); // Reset filters on mode change
		queryClient.invalidateQueries({ queryKey: ['GET', mode] });
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
		queryClient.invalidateQueries({ queryKey: ['GET', companyPageMode] });
	};

	const resetSearch = () => {
		setSearchText('');
		setJobFilters(prev => ({ ...prev, searchText: '' }));
		// console.log('🔍 Reset Search Invoked');
		queryClient.invalidateQueries({ queryKey: ['GET', companyPageMode] });
	};

	/**
	 * Handle Query Function
	 *
	 * @description - This function is used to handle the query function for fetching data from the API
	 */
	const CompanyQueryHandler = useCallback(
		async ({ pageParam = null, filters }: { pageParam?: string | null; filters: JobFiltersDto }) => {
			const updatedFilters = { ...filters, lastKey: pageParam }; // Attach lastKey for pagination
	
			const { response, error } = await httpServiceObj.get<any>(
				`/${location.pathname.includes('job') ? 'job' : 'company'}`,
				true,
				updatedFilters
			);
	
			if (error) throw error;
	
			// Generate filters for rendering
			generateFilterForRender(response.data, companyPageMode, filterMetaData, setJobFilterForRender);
	
			// Check if API returned data
			setApiHasData(response.data.length > 0);
	
			// Determine if it's a new filter OR a paginated request
			const isFiltering = !pageParam; // If `pageParam` is null, it's a new filter request
	
			if (location.pathname.includes('job')) {
				setCompanyJobData(prev => (isFiltering ? response.data : [...(prev || []), ...response.data]));
			} else {
				setCompanyRefData(prev => (isFiltering ? response.data : [...(prev || []), ...response.data]));
			}
	
			return {
				data: response,
				nextPage: response.pagination.lastKey ?? undefined, // Pass lastKey for pagination
			};
		},
		[companyPageMode]
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
		queryKey: ['GET', companyPageMode, jobFilters],
		queryFn: ({ pageParam }) => CompanyQueryHandler({ pageParam, filters: jobFilters }),
		getNextPageParam: lastPage => lastPage.nextPage || undefined, // Pass lastKey as nextPageParam
		initialPageParam: null, // Set initial page param to null
		enabled: !!companyPageMode && jobFilters.pageSize! > 0, //@Can Cause Error bc I made pageSize optional
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
		}),
		[companyPageMode, jobFilterForRender, searchText, isLoading, handleSearch, fetchNextPage, isFetchingNextPage]
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
