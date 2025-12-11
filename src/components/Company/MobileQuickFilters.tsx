import { useCompanyContext } from '../../context/Company.context';
import { useJobFilters } from '@Hooks/useJobFilter.hook';

interface MobileQuickFiltersProps {
  onFilterClick: (paramKey: string) => void;
}

/**
 * MobileQuickFilters
 *
 * Horizontal, scrollable list of filter chips shown below the search bar on mobile.
 * - No dropdown inside this component.
 * - Clicking a chip opens the main filter panel and auto-opens that specific filter dropdown there.
 */
export const MobileQuickFilters = ({ onFilterClick }: MobileQuickFiltersProps) => {
  const { jobFilterForRender = [] } = useCompanyContext();
  const { selectedValues } = useJobFilters();

  if (jobFilterForRender.length === 0) return null;

  return (
    <div className="w-full px-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto no-scrl-web py-1">
        {jobFilterForRender.map((filter) => {
          const count = (selectedValues[filter.paramKey] || []).length;

          return (
            <button
              key={filter.paramKey}
              type="button"
              onClick={() => onFilterClick(filter.paramKey)}
              className={`relative flex-shrink-0 px-3 py-2 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${
                count > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              <span className="pr-4">{filter.placeholder}</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileQuickFilters;


