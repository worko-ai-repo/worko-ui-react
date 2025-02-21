import { FilterOptionForRender } from '@Interfaces/JobsAndCompany.dto';
import { SmilePlus } from 'lucide-react';

// filter.ts (static metadata)
export const filterMetaData = [
	{ paramKey: 'location', placeholder: 'Location' },
	{ paramKey: 'department', placeholder: 'Department' },
	{
		options: ['Internship', 'Full Time', 'Part Time'],
		value: ['INTERNSHIP', 'FULL_TIME', 'PART_TIME'],
		paramKey: 'typeofEmployment',
		placeholder: 'Employment Type',
	},
	{
		options: ['Remote', 'Hybrid', 'Onsite'],
		value: ['WFH', 'HYBRID', 'WFO'],
		paramKey: 'workMode',
		placeholder: 'Work Mode',
	},
	{ paramKey: 'coreSkills', placeholder: 'Core Skills' },
	{ paramKey: 'softSkills', placeholder: 'Soft Skills' },
	{ paramKey: 'technicalSkills', placeholder: 'Technical Skills' },
	{
		options: ['0-5L', '5-10L', '10-15L', '15-20L', '20-25L', '25-30L', '30-35L', '35-40L', '40-45L', '45-50L'],
		value: [
			{ minSalary: 0, maxSalary: 5 },
			{ minSalary: 5, maxSalary: 10 },
			{ minSalary: 10, maxSalary: 15 },
			{ minSalary: 15, maxSalary: 20 },
			{ minSalary: 20, maxSalary: 25 },
			{ minSalary: 25, maxSalary: 30 },
			{ minSalary: 30, maxSalary: 35 },
			{ minSalary: 35, maxSalary: 40 },
			{ minSalary: 40, maxSalary: 45 },
			{ minSalary: 45, maxSalary: 50 },
		],
		paramKey: 'salaryRange',
		placeholder: 'Salary Range',
	},
	{
		options: ['0-1 years', '1-3 years', '3-6 years', '6-9 years', '9-12 years', '12-15 years', '15-20 years', '20-25 years', '25+ years'],
		value: [
			{ minExperience: 0, maxExperience: 1 },
			{ minExperience: 1, maxExperience: 3 },
			{ minExperience: 3, maxExperience: 6 },
			{ minExperience: 6, maxExperience: 9 },
			{ minExperience: 9, maxExperience: 12 },
			{ minExperience: 12, maxExperience: 15 },
			{ minExperience: 15, maxExperience: 20 },
			{ minExperience: 20, maxExperience: 25 },
			{ minExperience: 25, maxExperience: 100 },
		],
		paramKey: 'experienceRange',
		placeholder: 'Experience Range',
	},
];
