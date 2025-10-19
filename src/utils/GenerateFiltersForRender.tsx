import { CompanyPageModeEnum } from "@Interfaces/CompanyContext.dto";
import { CompanyShortDto, FilterOptionForRender, JobDto } from "@Interfaces/JobsAndCompany.dto";

// Utility function to normalize skills (e.g., converting to uppercase and flattening)
export const normalizeSkills = (skillsArray: string[][]): string[] => {
  return Array.from(new Set(skillsArray.flat().map((skill) => skill.toUpperCase())));
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
  let customOrder = ["location", "coreSkills", "experienceRange", "department", "technicalSkills", "softSkills", "companyName", "salaryRange", /* "typeofEmployment", "workMode", */ "dashboard"];
  const jobPageParams = ["location", "coreSkills", "softSkills", "technicalSkills", "companyName", "department"];
  const companyPageParam = ["industry", "companyName"];
  try {
    if (!Array.isArray(data) || !Array.isArray(filterMetaData)) {
      console.warn("Data or filterMetaData is not valid array");
      return;
    }
    if (data.length === 0 || filterMetaData.length === 0) {
      // Step 1: Extract static filters (those NOT in filterParams)
      const filterParams = companyPageMode === CompanyPageModeEnum.JOB ? jobPageParams : companyPageParam;

      const defaultEmptyFilters = filterMetaData.map((meta) => ({
        options: filterParams.includes(meta.paramKey) ? [] : meta.options || [],
        value: meta.value ?? [],
        paramKey: meta.paramKey,
        placeholder: meta.placeholder || meta.paramKey.charAt(0).toUpperCase() + meta.paramKey.slice(1),
        selectType: meta.selectType || "normal",
      }));

      // Sort final filters by custom order
      const orderedFilters = customOrder.map((key) => defaultEmptyFilters.find((f) => f.paramKey === key)).filter((f): f is FilterOptionForRender => !!f); // Remove undefined

      setJobFilterForRender(orderedFilters);
      return;
    }

    // Step 1: Reset cache only when explicitly requested
    if (isFiltering) {
      invalidateFilterCache();
    }

    // Step 2: Define relevant filter parameters
    const filterParams = companyPageMode === CompanyPageModeEnum.JOB ? jobPageParams : companyPageParam;

    // Step 3: Ensure cache exists for each parameter
    filterParams.forEach((param) => {
      if (!filterOptionsCache[param]) {
        filterOptionsCache[param] = new Set();
      }
    });

    // Step 4: Extract filter options dynamically & update cache
    filterParams.forEach((paramKey) => {
      let newOptions: string[] = [];

      if (companyPageMode === CompanyPageModeEnum.JOB) {
        switch (paramKey) {
          case "coreSkills":
          case "softSkills":
          case "technicalSkills":
          case "department": {
            const skillData = data.map((job: JobDto) => ("externalJobId" in job ? [] : job[paramKey as keyof JobDto]));
            newOptions = normalizeSkills(skillData.filter((skills): skills is string[] => skills !== undefined));
            break;
          }

          case "companyName": {
            newOptions = Array.from(new Set(data.map((job: JobDto) => job.companyDetails?.name || "").filter((name) => name)));
            break;
          }

          case "location": {
            newOptions = Array.from(new Set(data.flatMap((job: JobDto) => job.location?.city || [])));
            break;
          }

          default: {
            newOptions = Array.from(new Set(data.map((job: any) => job[paramKey]).filter(Boolean)));
          }
        }
      } else if (companyPageMode === CompanyPageModeEnum.REFERRAL) {
        if (paramKey === "industry") {
          newOptions = Array.from(new Set(data.map((company: CompanyShortDto) => company[paramKey]).filter(Boolean)));
        } else if (paramKey === "companyName") {
          newOptions = Array.from(new Set(data.map((company: CompanyShortDto) => company.name).filter(Boolean)));
        }
      }
      // CHANGED: Add empty fallback to avoid adding `undefined`
      if (!Array.isArray(newOptions)) newOptions = [];

      // Merge with existing cache
      newOptions.forEach((option) => filterOptionsCache[paramKey].add(option));
    });

    // Step 5: Create dynamic filters from cache
    const dynamicFilters: FilterOptionForRender[] = filterParams.map((paramKey) => {
      const meta = filterMetaData.find((m) => m.paramKey === paramKey);

      return {
        options: Array.from(filterOptionsCache[paramKey]), // Persisted + New
        value: Array.from(filterOptionsCache[paramKey]), // Persisted + New
        paramKey,
        placeholder: meta?.placeholder || paramKey.charAt(0).toUpperCase() + paramKey.slice(1),
        selectType: meta?.selectType || "normal",
      };
    });

    // Step 6: Preserve static filters (only for JOB mode)
    let staticFilters: FilterOptionForRender[] = [];
    staticFilters = filterMetaData.filter((meta) => !dynamicFilters.some((filter) => filter.paramKey === meta.paramKey)) as FilterOptionForRender[];

    // Step 7: Merge and update UI
    const finalFilters = [...dynamicFilters, ...staticFilters];
    // console.log("Updated Filter Options:", finalFilters);
    // Step 7: Merge and update UI with custom order

    // Sort final filters by custom order
    const orderedFilters = customOrder.map((key) => finalFilters.find((f) => f.paramKey === key)).filter((f): f is FilterOptionForRender => !!f); // Remove undefined

    // Optionally include any leftover filters that weren't in custom order
    const unorderedFilters = finalFilters.filter((f) => !customOrder.includes(f.paramKey));
    // Final list: Ordered + leftover
    setJobFilterForRender([...orderedFilters, ...unorderedFilters]);
    // console.log([...orderedFilters, ...unorderedFilters]);
  } catch (error) {
    console.error("Error in generating filter options:", error);
  }
};
