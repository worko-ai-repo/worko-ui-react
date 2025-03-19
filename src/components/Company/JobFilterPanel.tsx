import { useEffect, useRef, useState } from "react";
import { useCompanyContext } from "../../context/Company.context";
import { CompanyPageModeEnum } from "@Interfaces/CompanyContext.dto";
import { invalidateFilterCache } from "@Utils/GenerateFiltersForRender";
import RequestCompany from "./RequestCompany";
import { useAppContext } from "@Context/App.context";
import { MultiSelect } from "@Components/Shared/MultiSelect";
import { useSearchParams } from "react-router-dom";

const JobFilterPanel = ({ toggleFilters, companyPageMode }: { toggleFilters: () => void; companyPageMode: CompanyPageModeEnum }) => {
  const { setJobFilters, jobFilterForRender = [] ,resetFiltersValues} = useCompanyContext();
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
    setSelectedValues((prev) => ({ ...prev, [key]: values }));
  
    setJobFilters((prev) => {
      const newFilters: any = { ...prev };
      const updatedParams = new URLSearchParams(searchParams); // Copy current URL params
  
      if (values.length === 0) {
        //  If values are empty, remove the filter from both state & URL
        delete newFilters[key];
        updatedParams.delete(key);
      } else {
        //  Add valid filters
        if (key.includes("Skills") || key === "location" || key === "typeofEmployment" || key === "teamSize" || key === "companyName") {
          newFilters[key] = values.map((v) => v.toLowerCase()).join(",");
        } else if (key.includes("Range") && values[0]) {
          const [min, max] = values[0].split("-").map(Number);
          const baseKey = key.replace("Range", "");
          const formattedKey = baseKey.charAt(0).toUpperCase() + baseKey.slice(1);
          newFilters[`min${formattedKey}`] = min;
          newFilters[`max${formattedKey}`] = max;
          delete newFilters[key];
        } else if (key === "industry") {
          newFilters["industryName"] = values[0];
        } else if (key === "workMode") {
          newFilters[key] = values.map((v) => v.toUpperCase()).join(",");
        } else {
          const selectedOption = filter.options.findIndex((opt: any) => opt === values[0]);
          newFilters[key] = filter.value ? filter.value[selectedOption] : values[0];
        }
  
        //  Set only if the filter has a value
        updatedParams.set(key, newFilters[key]);
      }
  
      setSearchParams(updatedParams); //  Apply new query params without "undefined"
      return newFilters;
    });
  };

  /**
   * 1. Get the selected values from the URL
   */
  useEffect(() => {
    const filtersFromUrl: Record<string, string[]> = {};

    searchParams.forEach((value, key) => {
      filtersFromUrl[key] = value.split(",");
    });

   
    if (JSON.stringify(filtersFromUrl) !== JSON.stringify(selectedValues)) {
      setSelectedValues(filtersFromUrl);
      setJobFilters(filtersFromUrl);
    }
  }, []); 

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
            jobFilterForRender.map((filter) => (
              <div key={filter.paramKey} /* className="flex flex-col mx-auto gap-3" */>
                <MultiSelect
                  placeholder={filter.placeholder}
                  value={selectedValues[filter.paramKey] || []}
                  onChange={(values) => handleFilterChange(filter.paramKey, values, filter)}
                  type={filter.selectType}
                  options={filter.options}
                  apiValue={filter.value} // Actual API values
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Loading filters...</p>
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
