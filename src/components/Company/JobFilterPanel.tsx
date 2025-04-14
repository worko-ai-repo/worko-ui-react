import { useEffect, useRef, useState } from 'react';
import { useCompanyContext } from '../../context/Company.context';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { invalidateFilterCache } from '@Utils/GenerateFiltersForRender';
import RequestCompany from './RequestCompany';
import { useAppContext } from '@Context/App.context';
import { MultiSelect } from '@Components/Shared/MultiSelect';
import { useSearchParams } from 'react-router-dom';
import { JobFilterPanelSkeleton, ReferralPageFilterSkeleton } from '@Components/Loader/Skeleton/SkeletonLoader';

const JobFilterPanel = ({ toggleFilters, companyPageMode }: { toggleFilters: () => void; companyPageMode: CompanyPageModeEnum }) => {
	const { setJobFilters, jobFilterForRender = [], resetFiltersValues } = useCompanyContext();
	const { isLoggedIn, userDetails } = useAppContext();
	const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
	const [searchParams, setSearchParams] = useSearchParams();
	const resetFilters = () => {
		resetFiltersValues();
		setSelectedValues({});
		invalidateFilterCache();
		setSearchParams({}); // Reset URL
	};

  const handleFilterChange = (key: string, values: string[], filter: any) => {
    // if(!searchParams) return;
    console.log(`key: ${key}, values: ${values}, filter: ${JSON.stringify(filter)}`);
    setSelectedValues(prev => ({ ...prev, [key]: values }));
  
    setJobFilters(prev => {
      const newFilters: any = { ...prev };
      const updatedParams = new URLSearchParams(searchParams);
    
      if (values.length === 0) {
        delete newFilters[key];
        updatedParams.delete(key);
    
        if (key === 'salaryRange') {
          delete newFilters['minSalary'];
          delete newFilters['maxSalary'];
          updatedParams.delete('minSalary');
          updatedParams.delete('maxSalary');
        } else if (key === 'experienceRange') {
          delete newFilters['minExperience'];
          delete newFilters['maxExperience'];
          updatedParams.delete('minExperience');
          updatedParams.delete('maxExperience');
        }
      } else {
        if (key.includes('Skills') || key === 'location' || key === 'typeofEmployment' || key === 'teamSize' || key === 'companyName') {
          newFilters[key] = values.join(',');
          updatedParams.set(key, newFilters[key]);
        } else if (key.includes('Range') && values.length > 0) {
          const selectedOptionIndex = filter.value.findIndex((v: string) => v === values[0]);
          if (selectedOptionIndex !== -1) {
            const [min, max] = filter.value[selectedOptionIndex].split('-').map(Number);
            if (key === 'salaryRange') {
              newFilters['minSalary'] = min;
              newFilters['maxSalary'] = max;
              newFilters[key] = values[0];
              updatedParams.set('minSalary', min.toString());
              updatedParams.set('maxSalary', max.toString());
              updatedParams.set(key, values[0]);
            } else {
              newFilters['minExperience'] = min;
              newFilters['maxExperience'] = max;
              newFilters[key] = values[0];
              updatedParams.set('minExperience', min.toString());
              updatedParams.set('maxExperience', max.toString());
              updatedParams.set(key, values[0]);
            }
          }
        } else if (key === 'industry') {
          newFilters['industry'] = values[0];
          updatedParams.set('industry', values[0]);
        } else if (key === 'workMode') {
          newFilters[key] = values.join(',');
          updatedParams.set(key, values.join(','));
        } else {
          const selectedOptionIndex = filter.value.findIndex((v: string) => v === values[0]);
          newFilters[key] = filter.options[selectedOptionIndex] || values[0];
          updatedParams.set(key, newFilters[key]);
        }
      }
    
      setSearchParams(updatedParams);
      return newFilters;
    });
    
  };
  

    /**
   * 1. Get the selected values from the URL
   */
useEffect(() => {
  const filtersFromUrl: Record<string, string[]> = {};

  searchParams.forEach((value, key) => {
    if (!key.startsWith('min') && !key.startsWith('max')) {
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
}, [companyPageMode/* searchParams, selectedValues, setSelectedValues, setJobFilters */]);
    

	return (
		<div className="sticky top-[100px]">
			<div className="border-[1px] border-gray-100 rounded-2xl p-5 bg-[#FAFAFA]">
				<div className="flex justify-between items-center mb-3">
					<h3 className="text-lg font-semibold">Filters</h3>
					<button onClick={toggleFilters} className="text-xl font-bold text-red-500 sm:hidden">
						&times;
					</button>
				</div>
				<div className="space-y-2">
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
			{isLoggedIn && companyPageMode === CompanyPageModeEnum.REFERRAL ? <RequestCompany userType={userDetails.lastAccessedDash} /> : null}
		</div>
	);
};

export default JobFilterPanel;
