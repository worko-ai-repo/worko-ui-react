// utils/filterUtils.ts

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
 * @description This function is used to generate filter options for rendering,
 * accumulating options from new data rather than replacing them
 *
 * @param data
 * @param companyPageMode
 * @param filterMetaData
 * @param setJobFilterForRender
 * @param isFiltering - Indicates if this is a new filter request (not pagination)
 */
export const generateFilterForRender = (
	data: any, 
	companyPageMode: CompanyPageModeEnum, 
	filterMetaData: any[], 
	setJobFilterForRender: React.Dispatch<React.SetStateAction<FilterOptionForRender[]>>,
	isFiltering: boolean = false // New parameter to determine if we should reset cache
) => {
	try {
		if (!data || data.length === 0) {
			throw new Error('Data is empty or undefined');
		}
		if (!filterMetaData || filterMetaData.length === 0) {
			throw new Error('filterMetaData is empty or undefined');
		}

		// Reset cache if this is a new filter request (not pagination)
		if (isFiltering) {
			invalidateFilterCache();
		}

		const filterParams = companyPageMode === CompanyPageModeEnum.JOB 
			? ['location', 'department', 'coreSkills', 'softSkills', 'technicalSkills'] 
			: ['teamSize', 'industry'];

		// Initialize cache entries for each filter parameter if they don't exist
		filterParams.forEach(param => {
			if (!filterOptionsCache[param]) {
				filterOptionsCache[param] = new Set();
			}
		});

		const dynamicFilters: FilterOptionForRender[] = filterParams.map((paramKey: string) => {
			const meta = filterMetaData.find(m => m.paramKey === paramKey);
		
			if (meta?.options?.length) {
				return meta as FilterOptionForRender;
			}
		
			let newOptions: string[] = [];
		
			if (companyPageMode === CompanyPageModeEnum.JOB) {
				// Handle JOB mode filtering logic
				if (paramKey === 'coreSkills' || paramKey === 'softSkills' || paramKey === 'technicalSkills') {
					// Check if jobs have externalJobId
					const skillData = data.map((job: JobDto) => {
						// If job has externalJobId, return empty array for skills
						if ('externalJobId' in job) {
							return [];
						}
						return job[paramKey];
					});
					newOptions = normalizeSkills(skillData);
				} else {
					newOptions = Array.from(new Set(data.map((job: any) => job[paramKey]).filter(Boolean)));
				}
			} else if (companyPageMode === CompanyPageModeEnum.REFERRAL) {
				// Handle COMPANY mode filtering logic
				if (paramKey === 'teamSize' || paramKey === 'industry') {
					newOptions = Array.from(new Set(data.map((company: CompanyShortDto) => company[paramKey]).filter(Boolean)));
				}
			}
		
			// Add new options to the cache
			newOptions.forEach(option => filterOptionsCache[paramKey].add(option));
			
			// Get all accumulated options from cache
			const allOptions = Array.from(filterOptionsCache[paramKey]);
		
			return {
				options: allOptions,
				value: allOptions,
				paramKey,
				placeholder: meta?.placeholder || paramKey.charAt(0).toUpperCase() + paramKey.slice(1),
			};
		});

		// Only include static filters if in JOB mode
		let staticFilters: FilterOptionForRender[] = [];
		if (companyPageMode === CompanyPageModeEnum.JOB) {
			staticFilters = filterMetaData.filter(meta => !dynamicFilters.some(filter => filter.paramKey === meta.paramKey)) as FilterOptionForRender[];
		}

		const finalFilters = [...dynamicFilters, ...staticFilters];

		console.log('Final Filter Options:', finalFilters);
		setJobFilterForRender(finalFilters);
	} catch (error) {
		console.error('Error in generating filter options:', error);
	}
};
