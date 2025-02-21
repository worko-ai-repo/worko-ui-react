// utils/filterUtils.ts

import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { CompanyShortDto, FilterOptionForRender, JobDto } from '@Interfaces/JobsAndCompany.dto';
// Utility function to normalize skills (e.g., converting to uppercase and flattening)
export const normalizeSkills = (skillsArray: string[][]): string[] => {
	return Array.from(new Set(skillsArray.flat().map(skill => skill.toUpperCase())));
};

/**
 * generateFilterForRender
 *
 * @description This function is used to generate filter options for rendering
 *
 * @param data
 * @param companyPageMode
 * @param filterMetaData
 * @param setJobFilterForRender
 */
// utils/filterUtils.ts

export const generateFilterForRender = (data: any, companyPageMode: CompanyPageModeEnum, filterMetaData: any[], setJobFilterForRender: React.Dispatch<React.SetStateAction<FilterOptionForRender[]>>) => {
	try {
		if (!data || data.length === 0) {
			throw new Error('Data is empty or undefined');
		}
		if (!filterMetaData || filterMetaData.length === 0) {
			throw new Error('filterMetaData is empty or undefined');
		}

		const filterParams = companyPageMode === CompanyPageModeEnum.JOB ? ['location', 'department', 'coreSkills', 'softSkills', 'technicalSkills'] : ['teamSize', 'industry'];

		const dynamicFilters: FilterOptionForRender[] = filterParams.map((paramKey: string) => {
			const meta = filterMetaData.find(m => m.paramKey === paramKey);

			if (meta?.options?.length) {
				return meta as FilterOptionForRender;
			}

			let options: string[] = [];
			let value: string[] = [];

			if (companyPageMode === CompanyPageModeEnum.JOB) {
				// Handle JOB mode filtering logic
				if (paramKey === 'coreSkills' || paramKey === 'softSkills' || paramKey === 'technicalSkills') {
					const skillData = data.map((job: JobDto) => job[paramKey]);
					options = normalizeSkills(skillData);
					value = options;
				} else {
					options = Array.from(new Set(data.map((job: any) => job[paramKey]).filter(Boolean)));
					value = options;
				}
			} else if (companyPageMode === CompanyPageModeEnum.REFERRAL) {
				// Handle COMPANY mode filtering logic
				if (paramKey === 'teamSize' || paramKey === 'industry') {
					options = Array.from(new Set(data.map((company: CompanyShortDto) => company[paramKey]).filter(Boolean)));
					value = options;
				}
			}

			return {
				options,
				value,
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
