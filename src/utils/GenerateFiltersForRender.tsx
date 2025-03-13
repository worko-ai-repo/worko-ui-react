
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
    isFiltering: boolean = false // Only resets cache if explicitly required
) => {
    try {
        if (!data || data.length === 0) {
            throw new Error('Data is empty or undefined');
        }
        if (!filterMetaData || filterMetaData.length === 0) {
            throw new Error('filterMetaData is empty or undefined');
        }

        // Step 1: Reset cache only when explicitly requested
        if (isFiltering) {
            invalidateFilterCache();
        }

        // Step 2: Define relevant filter parameters
        const filterParams = companyPageMode === CompanyPageModeEnum.JOB
            ? ['location', 'coreSkills', 'softSkills', 'technicalSkills','company'] 
            : ['teamSize', 'industry','company'];

        // Step 3: Ensure cache exists for each parameter
        filterParams.forEach(param => {
            if (!filterOptionsCache[param]) {
                filterOptionsCache[param] = new Set();
            }
        });

        // Step 4: Extract filter options dynamically & update cache
        filterParams.forEach(paramKey => {
            let newOptions: string[] = [];

            if (companyPageMode === CompanyPageModeEnum.JOB) {
                // Extract options based on the parameter key
                if (['coreSkills', 'softSkills', 'technicalSkills'].includes(paramKey)) {
                    const skillData = data.map((job: JobDto) => 'externalJobId' in job ? [] : job[paramKey as keyof JobDto]);
                    newOptions = normalizeSkills(skillData.filter((skills): skills is string[] => skills !== undefined));
                }
                else if (paramKey === 'company') {
                    newOptions = Array.from(new Set(data.map((job: JobDto) => job.companyDetails?.name || '').filter(name => name)));
                }
                else if (paramKey === 'location') {
                    newOptions = Array.from(new Set(data.flatMap((job: JobDto) => job.location?.city || [])));
                } else {
                    newOptions = Array.from(new Set(data.map((job: any) => job[paramKey]).filter(Boolean)));
                }
            } else if (companyPageMode === CompanyPageModeEnum.REFERRAL) {
                if (paramKey === 'teamSize' || paramKey === 'industry') {
                    newOptions = Array.from(new Set(
                        data.map((company: CompanyShortDto) => 
                            paramKey === 'teamSize' ? String(company[paramKey]) : company[paramKey]
                        ).filter(Boolean)
                    ));
                }
                else if (paramKey === 'company') {
                    newOptions = Array.from(new Set(data.map((company: CompanyShortDto) => company.name).filter(Boolean)));
                }
            }

            // Merge with existing cache
            newOptions.forEach(option => filterOptionsCache[paramKey].add(option));
        });

        // Step 5: Create dynamic filters from cache
        const dynamicFilters: FilterOptionForRender[] = filterParams.map(paramKey => {
            const meta = filterMetaData.find(m => m.paramKey === paramKey);

            return {
                options: Array.from(filterOptionsCache[paramKey]), // Persisted + New
                value: Array.from(filterOptionsCache[paramKey]),  // Persisted + New
                paramKey,
                placeholder: meta?.placeholder || paramKey.charAt(0).toUpperCase() + paramKey.slice(1),
                selectType: meta?.selectType || 'normal',
            };
        });

        // Step 6: Preserve static filters (only for JOB mode)
        let staticFilters: FilterOptionForRender[] = [];
        if (companyPageMode === CompanyPageModeEnum.JOB) {
            staticFilters = filterMetaData.filter(meta => 
                !dynamicFilters.some(filter => filter.paramKey === meta.paramKey)
            ) as FilterOptionForRender[];
        }

        // Step 7: Merge and update UI
        const finalFilters = [...dynamicFilters, ...staticFilters];
        console.log('Updated Filter Options:', finalFilters);
        setJobFilterForRender([...finalFilters]); // Ensure UI gets updated

    } catch (error) {
        console.error('Error in generating filter options:', error);
    }  
};

