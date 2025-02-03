import { useRef } from 'react';
import { useCompanyContext } from '../../context/CompanyContext';

const JobFilterPanel = ({ toggleFilters }: { toggleFilters: () => void }) => {
	const { setJobFilters, jobFilterForRender } = useCompanyContext();

	// Reset all filters
	const resetFilters = () => {
		setJobFilters({ pageSize: 10, sortOrder: 'descending', searchText: '' }); // Reset filters on mode change
	}
	
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
		<div className="sticky top-[20px]">
			<div className="flex justify-between items-center mb-3">
				<h3 className="text-lg font-semibold">Filters</h3>
				<button onClick={toggleFilters} className="text-xl font-bold text-red-500 sm:hidden">
					&times;
				</button>
			</div>
			<div className="space-y-5">
				{jobFilterForRender?.map((filter, index) => (
					<div key={filter.paramKey} className="max-w-[200px] flex flex-col mx-auto gap-3 md:max-w-[90%]">
						<select
							ref={el => (selectRefs.current[index] = el)} // Store refs dynamically
							className="text-xs sm:text-s select_primary cursor-pointer outline-none text-gray-500 bg-transparent w-full max-w-[300px] p-2 border border-gray-300 rounded-lg"
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
				))}
				<div className="resetFilters flex justify-end md:max-w-[90%] mx-auto">
					<button onClick={handleResetFilters} className="btn_t1 logout text-xs text-red-500 font-semibold">
						Reset Filters
					</button>
				</div>
			</div>
		</div>
	);
};

export default JobFilterPanel;
