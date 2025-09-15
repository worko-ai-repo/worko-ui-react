import { useEffect, useRef, useState } from 'react';
import { useCompanyContext } from '../../context/Company.context';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { invalidateFilterCache } from '@Utils/GenerateFiltersForRender';
import RequestCompany from './RequestCompany';
import { useAppContext } from '@Context/App.context';
import { MultiSelect } from '@Components/Shared/MultiSelect';
import { useSearchParams } from 'react-router-dom';
import { JobFilterPanelSkeleton, ReferralPageFilterSkeleton } from '@Components/Loader/Skeleton/SkeletonLoader';
import { useJobFilters } from '@Hooks/useJobFilter.hook';
import { AuthLoginForGeneralUserDto } from '@Interfaces/Auth.dto';

export const JobFilterPanel = ({ toggleFilters, companyPageMode }: { toggleFilters: () => void; companyPageMode: CompanyPageModeEnum }) => {
	const { setJobFilters, jobFilterForRender = [], resetFiltersValues,setIsInitialFilterSet } = useCompanyContext();
	const { userDetails } = useAppContext<Partial<AuthLoginForGeneralUserDto>>();
	const [searchParams, setSearchParams] = useSearchParams();
  const { handleFilterChange, resetFilters, selectedValues,setSelectedValues } = useJobFilters();
  
    /**
   * 1. Get the selected values from the URL
   */
	const allowedKeys = new Set([
		'salaryRange',
		'experienceRange',
		'technicalSkills',
		'softSkills',
		'coreSkills',
		'location',
		'typeofEmployment',
		'companyName',
		'industry',
		'workMode',
		'dashboard',
		'teamSize',
		'department'
	  ]);

useEffect(() => {
  const filtersFromUrl: Record<string, string[]> = {};

  searchParams.forEach((value, key) => {
	if (allowedKeys.has(key)) {
		filtersFromUrl[key] = value.split(',');
	  }
  });

  if (JSON.stringify(filtersFromUrl) !== JSON.stringify(selectedValues)) {
    setSelectedValues({ ...filtersFromUrl });

    setJobFilters(prev => ({
      ...prev,
      ...filtersFromUrl,
      ...(filtersFromUrl.salaryRange && {
        minSalary: Number(searchParams.get('minSalary')),
        maxSalary: Number(searchParams.get('maxSalary'))
      }),
      ...(filtersFromUrl.experienceRange && {
        minExperience: Number(searchParams.get('minExperience')),
        maxExperience: Number(searchParams.get('maxExperience'))
      })
    }));
  }
  setIsInitialFilterSet(true);
}, [companyPageMode ,searchParams /* searchParams, selectedValues, setSelectedValues, setJobFilters */]);
    

	return (
		<div className="no-scrl-web sticky top-20 overflow-auto max-h-[60vh] md:max-h-[65vh] lg:max-h-[80vh] xl:max-h-[85vh] 2xl:max-h-[90vh]">
			<div className="border-[1px] border-gray-100 rounded-2xl p-5 bg-[#FAFAFA]">
				<div className="flex justify-between items-center mb-3">
					<h3 className="text-lg font-semibold"
					data-tooltip-id='my-tooltip'
					data-tooltip-content="Filters are pre-filled based on your profile. You can also enter any keyword of your choice and apply it to refine the job list."
					>Filters &nbsp; <i className="fa-solid fa-circle-info animate-pulse cursor-pointer text-xs"></i></h3>
					<button onClick={toggleFilters} className="text-xl font-bold text-red-500 sm:hidden">
						&times;
					</button>
				</div>
				<div className="space-y-4">
					{jobFilterForRender.length > 0 ? (
						jobFilterForRender.map(filter => (
							<div key={filter.paramKey} /* className="flex flex-col mx-auto gap-3" */>
								<MultiSelect
									placeholder={filter.placeholder}
									value={selectedValues[filter.paramKey] || []}
									onChange={values => handleFilterChange(filter.paramKey, values, filter)}
									type={filter.selectType}
									options={filter.options}
									apiValue={filter.value} // Actual API values
								/>
							</div>
						))
					) : (
						companyPageMode === CompanyPageModeEnum.REFERRAL ? <ReferralPageFilterSkeleton /> : <JobFilterPanelSkeleton />
					)}
					<div className="resetFilters flex justify-end md:max-w-[90%] mx-auto">
						<button onClick={resetFilters} className="btn_t1 logout text-xs text-red-500 font-semibold">
							Reset Filters
						</button>
					</div>
				</div>
			</div>
			{companyPageMode === CompanyPageModeEnum.REFERRAL ? <RequestCompany userType={typeof userDetails?.lastAccessedDash === 'object' ? userDetails?.lastAccessedDash : {}} /> : null}{/*  @TODO: ADD APPROPIATE TYE HERE */}
		</div>
	);
};

export default JobFilterPanel;
