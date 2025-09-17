import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import secureStorage from "@Utils/SecureStorage.utils";
import httpServiceObj from "@Services/ApiHandler.service";
import { GlobalApiQueryResponseDto, JobDto } from "@Interfaces/JobsAndCompany.dto";


export type DropDownSelectedJobData = {
  id: string;
  jobTitle: string;
  status: string;
  jobDescription: string;
};

type JobListDropdownProps = {
  onSelect: (job: DropDownSelectedJobData) => void;
  placeholder?: string;
};

const fetchJobs = async (search: string, dashboard: "CORPORATE" | "ADMIN" = "CORPORATE"): Promise<DropDownSelectedJobData[]> => {
  try {
    const userCognitoDetails = secureStorage.getItem<any>(SecureStorageKeyEnum.COGNITOUSERDETAILS);
    const userType = userCognitoDetails?.["cognito:groups"]?.[0];
    const uri = import.meta.env.APP_JOBS_API_URI || "https://jobs.worko.ai";
    const payload = {
      pageSize: 25,
      sortOrder: "desc",
      searchText: search.trim(),
    };

    const { response, error } = await httpServiceObj.get<GlobalApiQueryResponseDto<JobDto>>(`${uri}/job`, true, payload, true);
    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
    return response?.data || [];
  } catch (err) {
    console.error("Unexpected error while fetching jobs:", err);
    return [];
  }
};

const JobListDropdown: React.FC<JobListDropdownProps> = ({ onSelect, placeholder = "Search jobs..." }) => {
  const [searchText, setSearchText] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobsPopup", searchText],
    queryFn: () => fetchJobs(searchText),
    enabled: true,
    staleTime: 5 * 60 * 1000,
  });

  const handleSelectJob = (job: DropDownSelectedJobData) => {
    setSearchText(job.jobTitle);
    setDropdownVisible(false);
    onSelect(job);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (         
      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setDropdownVisible(true);
          }}
          onFocus={() => setDropdownVisible(true)}
          className={`shadow-[3px_4px_0px_#316bff] w-full h-14 pl-6 pr-14 text-lg border-2 bg-white rounded-2xl focus:border-blue-500 focus:outline-none ${
            dropdownVisible ? "rounded-b-none" : ""
          }`}
        />
        <button className="absolute right-2 top-2 h-10 w-16 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors duration-200" onClick={() => console.log("")}>
          <Search className="h-18 w-8" />
        </button>

        {dropdownVisible && (
          <div className="no-scrl no-scrl-web cursor-pointer absolute mt-0 w-full z-10 max-h-60 overflow-y-auto bg-white border  border-t-0 shadow-[3px_4px_0px_#316bff] border-blue-500 outline-none rounded-b ">
            {isLoading && <div className="p-3 text-sm text-gray-500 text-center">Loading...</div>}

            {!isLoading && (!jobs || jobs.length === 0) && <div className="p-3 text-sm text-gray-500 text-center ">{searchText ? `No jobs found for "${searchText}"` : "No jobs available"}</div>}

            {!isLoading && Array.isArray(jobs) && jobs.length > 0 && (
              <>
                {jobs.map((job) => (
                  <div key={job.id} onClick={() => handleSelectJob(job)} className="p-3  group px-3 hover:bg-blue-50   cursor-pointer capitalize">
                    <div className="text-lg text-gray-500 group-hover:text-blue-500 font-medium text-left">{job.jobTitle}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
  );
}

export default JobListDropdown;
