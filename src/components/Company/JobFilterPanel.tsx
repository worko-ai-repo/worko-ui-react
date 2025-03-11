import { useRef } from 'react';
import { useCompanyContext } from '../../context/Company.context';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { invalidateFilterCache } from '@Utils/GenerateFiltersForRender';
import RequestCompany from './RequestCompany';
import { useAppContext } from '@Context/App.context';

const JobFilterPanel = ({ toggleFilters, companyPageMode }: { toggleFilters: () => void , companyPageMode:CompanyPageModeEnum }) => {
	const { setJobFilters, jobFilterForRender = [] } = useCompanyContext(); // Ensure jobFilterForRender defaults to an empty array
	const {isLoggedIn, userDetails} = useAppContext();

	// Reset all filters
	const resetFilters = () => {
		setJobFilters({ pageSize: 10, sortOrder: 'descending', searchText: '' }); // Reset filters on mode change
		// Reset the filter options cache when resetting filters
		invalidateFilterCache();
	};

	// Create refs for each select input
	const selectRefs = useRef<(HTMLSelectElement | null)[]>([]);

	const handleFilterChange = (key: string, value: string) => {
		setJobFilters(prev => {
			const newFilters: any = { ...prev };
			if (value === '') {
				delete newFilters[key];
			} else if (key.includes('Skills')) {
				// if key has Skills keyword then store the value in lowercase
				newFilters[key] = value.toLowerCase();
			} else if (key.includes('Range')) {
				try {
					const rangeValues = JSON.parse(value); // Convert JSON string to object

					// Extract min & max values dynamically
					const baseKey = key.replace('Range', ''); // Remove "Range" from key name
					const formattedKey = baseKey.charAt(0).toUpperCase() + baseKey.slice(1);
					newFilters[`min${formattedKey}`] = rangeValues.minSalary ?? rangeValues.min;
					newFilters[`max${formattedKey}`] = rangeValues.maxSalary ?? rangeValues.max;

					// Remove the original "Range" key
					delete newFilters[key];
				} catch (error) {
					console.error('Invalid range value:', value);
				}
			} 
			else if (key === 'industry') {
				// Map 'industry' to 'industryName' for API compatibility
				newFilters['industryName'] = value;
			} else {
				newFilters[key] = value;
			}
			return newFilters;
		});
	};

	const handleResetFilters = () => {
		resetFilters();
		// Reset all select elements
		selectRefs.current.forEach(select => {
			if (select) select.value = '';
		});
	};

	return (
		<div className="sticky top-[100px] ">
			<div className="border-[1px] border-gray-100 rounded-2xl p-5 bg-[#FAFAFA]">
				<div className="flex justify-between items-center mb-3">
					<h3 className="text-lg font-semibold">Filters</h3>
					<button onClick={toggleFilters} className="text-xl font-bold text-red-500 sm:hidden">
						&times;
					</button>
				</div>
				<div className="space-y-5">
					{jobFilterForRender.length > 0 ? (
						jobFilterForRender.map((filter, index) => (
							<div key={filter.paramKey} className="flex flex-col mx-auto gap-3">
								<select
									ref={el => (selectRefs.current[index] = el)} // Store refs dynamically
									className="text-xs sm:text-s select_primary cursor-pointer outline-none text-gray-500 bg-transparent w-full max-w-[300px] p-3 border border-gray-200 rounded-xl"
									onChange={e => handleFilterChange(filter.paramKey, e.target.value)}
								>
									<option value="">{filter.placeholder}</option>
									{filter.options.map((option, idx) => (
										<option key={option} value={typeof filter.value[idx] === 'object' ? JSON.stringify(filter.value[idx]) : filter.value[idx]}>
											{option}
										</option>
									))}
								</select>
							</div>
						))
					) : (
						<p className="text-gray-500 text-sm">Loading filters...</p>
					)}
					<div className="resetFilters flex justify-end md:max-w-[90%] mx-auto">
						<button onClick={handleResetFilters} className="btn_t1 logout text-xs text-red-500 font-semibold">
							Reset Filters
						</button>
					</div>
				</div>
			</div>
			{isLoggedIn && (companyPageMode === CompanyPageModeEnum.REFERRAL) ? <RequestCompany userType={userDetails.lastAccessedDash} /> : null}
		</div>
	);
};

export default JobFilterPanel;
