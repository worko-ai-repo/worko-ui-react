import { useCompanyContext } from "@Context/Company.context";
import { invalidateFilterCache } from "@Utils/GenerateFiltersForRender";
import { useState } from "react";
import { set } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

export const useJobFilters = () => {
    const { setJobFilters, resetFiltersValues,resetSearch } = useCompanyContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedValues, setSelectedValues] = useState<Record<string, string[]>>({});
    const resetFilters = () => {
      resetFiltersValues();
      setSelectedValues({});
      invalidateFilterCache();
      setSearchParams({}); // Reset URL
    };
  

    const handleFilterChange = (key: string, values: string[], filter: any) => {
  // Update the UI selected values state
  setSelectedValues(prev => ({ ...prev, [key]: values }));
  
  // Update job filters and URL search parameters
  setJobFilters(prev => {
    // Create a copy of previous filters to avoid direct state mutation
    const newFilters: any = { ...prev };
    // Create a new URLSearchParams object based on current search parameters
    const updatedParams = new URLSearchParams(searchParams);
    
    // Case 1: When filter values are cleared/emptied
    if (values.length === 0) {
      // Remove the filter from both state and URL parameters
      delete newFilters[key];
      updatedParams.delete(key);
      
      // Handle special range filters that need to clear their min/max values
      if (key === 'salaryRange') {
        // Clear salary range min/max values
        delete newFilters['minSalary'];
        delete newFilters['maxSalary'];
        updatedParams.delete('minSalary');
        updatedParams.delete('maxSalary');
      } else if (key === 'experienceRange') {
        // Clear experience range min/max values
        delete newFilters['minExperience'];
        delete newFilters['maxExperience'];
        updatedParams.delete('minExperience');
        updatedParams.delete('maxExperience');
      }
    } 
    // Case 2: When filter values are added/modified
    else {
      // Handle multi-select filters that use comma-separated values
      if (key.includes('Skills') || key === 'location' || key === 'typeofEmployment' || 
          key === 'teamSize' || key === 'companyName' || key === 'department' ) {
        // Join multiple selected values with commas
        newFilters[key] = values.join(',');
        updatedParams.set(key, newFilters[key]);
      } 
      // Handle range filters (salary, experience) that have min-max values
      else if (key.includes('Range') && values.length > 0) {
        // Find the selected option in the filter values
        const selectedOptionIndex = filter?.value?.findIndex?.((v: string) => v === values[0]);
        
        if (selectedOptionIndex !== -1) {
          // Extract min and max values from the range (format: "min-max")
          const [min, max] = filter?.value?.[selectedOptionIndex]?.split('-')?.map(Number) || [];
          
          if (key === 'salaryRange') {
            // Update salary range values
            newFilters['minSalary'] = min;
            newFilters['maxSalary'] = max;
            newFilters[key] = values[0]; // Keep the original range value
            
            // Update URL parameters
            updatedParams.set('minSalary', min.toString());
            updatedParams.set('maxSalary', max.toString());
            updatedParams.set(key, values[0]);
          } else {
            // Update experience range values
            newFilters['minExperience'] = min;
            newFilters['maxExperience'] = max;
            newFilters[key] = values[0]; // Keep the original range value
            
            // Update URL parameters
            updatedParams.set('minExperience', min.toString());
            updatedParams.set('maxExperience', max.toString());
            updatedParams.set(key, values[0]);
          }
        }
      } 
      // Handle industry filter (single select)
      else if (key === 'industry') {
        newFilters['industry'] = values[0];
        updatedParams.set('industry', values[0]);
      } 
      // Handle work mode or dashboard filters (comma-separated)
      else if (key === 'workMode') {
        newFilters[key] = values.join(',');
        updatedParams.set(key, values.join(','));
      }
      else if (key === 'dashboard') {
        // Clear all other filters from both state and URL, except for the dashboard filter
        for (const paramKey of Array.from(updatedParams.keys())) {
          if (paramKey !== 'dashboard') {
            updatedParams.delete(paramKey);
          }
        }
      
        resetSearch();
        for (const stateKey in newFilters) {
          if (stateKey !== 'dashboard') {
            delete newFilters[stateKey];
          }
        }
      
        // Set the new dashboard filter value
        newFilters[key] = values.join(',');
        updatedParams.set(key, values.join(','));
      }
      // Handle all other filter types
      else {
        // Find the display text for the selected value
        const selectedOptionIndex = filter?.value?.findIndex?.((v: string) => v === values[0]);
        // Use the option text if available, otherwise use the raw value
        newFilters[key] = filter?.options?.[selectedOptionIndex] || values[0];
        updatedParams.set(key, newFilters[key]);
      }
    }
    
    // Update URL search parameters
    setSearchParams(updatedParams);
    
    // Return updated filters
    return newFilters;
  });
    };
  
    return { handleFilterChange, resetFilters, selectedValues,setSelectedValues  };
  };
  