
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { CompanyShortDto, FilterOptionForRender, JobDto } from '@Interfaces/JobsAndCompany.dto';

// Utility function to normalize skills (e.g., converting to uppercase and flattening)
export const normalizeSkills = (skillsArray: string[][]): string[] => {
    return Array.from(new Set(skillsArray.flat().map(skill => skill.toUpperCase())));
};

// Create a cache to store accumulated filter options
let filterOptionsCache: Record<string, Set<string>> = {};

// Function to reset the cache when needed (e.g., when mode changes)
export const invalidateFilterCache = () => {
    filterOptionsCache = {};
};

/**
 * generateFilterForRender
 * 
 * @description This function generates filter options for rendering, accumulating options from new data.
 * It resets the cache when a new filtering request is made (not for pagination).
 *
 * @param data - Job or Company data array
 * @param companyPageMode - Determines if filtering is for JOB or REFERRAL mode
 * @param filterMetaData - Metadata for filters
 * @param setJobFilterForRender - Function to update the filter state
 * @param isFiltering - If true, resets the cache before applying new filters
 */
export const generateFilterForRender = (
    data: any[],
    companyPageMode: CompanyPageModeEnum,
    filterMetaData: any[],
    setJobFilterForRender: React.Dispatch<React.SetStateAction<FilterOptionForRender[]>>,
    isFiltering: boolean = false // Reset cache if it's a new filter request
) => {
    try {
        if (!data || data.length === 0) {
            throw new Error('Data is empty or undefined');
        }
        if (!filterMetaData || filterMetaData.length === 0) {
            throw new Error('filterMetaData is empty or undefined');
        }

        // Step 1: Reset cache if this is a new filter request (not pagination)
        if (isFiltering) {
            invalidateFilterCache();
        }

        // Step 2: Define filter parameters based on mode
		const filterParams = companyPageMode === CompanyPageModeEnum.JOB
		? ['location', 'department', 'coreSkills', 'softSkills', 'technicalSkills'] 
		: ['teamSize', 'industry'];

        // Step 3: Initialize cache entries for each filter parameter if they don't exist
        filterParams.forEach(param => {
            if (!filterOptionsCache[param]) {
                filterOptionsCache[param] = new Set();
            }
        });

        // Step 4: Process data and extract filter options dynamically
		const dynamicFilters: FilterOptionForRender[] = filterParams.map((paramKey: string) => {
			const meta = filterMetaData.find(m => m.paramKey === paramKey);
			
			if (meta?.options?.length) {
				return meta as FilterOptionForRender;
			}
			
			let newOptions: string[] = [];
			
			if (companyPageMode === CompanyPageModeEnum.JOB) {
				if (paramKey === 'coreSkills' || paramKey === 'softSkills' || paramKey === 'technicalSkills') {
					const skillData = data.map((job: JobDto) => 'externalJobId' in job ? [] : job[paramKey]);
					newOptions = normalizeSkills(skillData.filter((skills): skills is string[] => skills !== undefined));
				} else if (paramKey === 'location') {
					// Extract location directly instead of city
                    newOptions = Array.from(new Set(data.flatMap((job: JobDto) => job.location?.fullLocation || [])));
				} else {
					newOptions = Array.from(new Set(data.map((job: any) => job[paramKey]).filter(Boolean)));
				}
			} else if (companyPageMode === CompanyPageModeEnum.REFERRAL) {
				if (paramKey === 'teamSize' || paramKey === 'industry') {
					newOptions = Array.from(new Set(data.map((company: CompanyShortDto) => company[paramKey]).filter((value): value is string => typeof value === 'string')));
				}
			}
			
			newOptions.forEach(option => filterOptionsCache[paramKey].add(option));
			const allOptions = Array.from(filterOptionsCache[paramKey]);
			
			return {
				options: allOptions,
				value: allOptions,
				paramKey,
				placeholder: meta?.placeholder || paramKey.charAt(0).toUpperCase() + paramKey.slice(1),
			};
		});

        // Step 7: Only include static filters if in JOB mode
        let staticFilters: FilterOptionForRender[] = [];
        if (companyPageMode === CompanyPageModeEnum.JOB) {
            staticFilters = filterMetaData.filter(meta => !dynamicFilters.some(filter => filter.paramKey === meta.paramKey)) as FilterOptionForRender[];
        }

        // Step 8: Merge dynamic and static filters
        const finalFilters = [...dynamicFilters, ...staticFilters];

        console.log('Final Filter Options:', finalFilters);
        setJobFilterForRender(finalFilters);
    } catch (error) {
        console.error('Error in generating filter options:', error);
    }
};