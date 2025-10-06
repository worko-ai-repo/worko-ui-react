import React, { useEffect, useMemo, useRef, useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import httpServiceObj from "@Services/ApiHandler.service";
import { GlobalApiQueryResponseDto, JobDto } from "@Interfaces/JobsAndCompany.dto";
import { DaysFormatter } from "@Utils/DaysFormatter.utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { generateJobSlug } from "@Utils/JobUriSlug.utils";
import { useNavigate } from "react-router-dom";

interface JobCardDto {
  id: string;
  title: string;
  type: string;
  department: string;
  salary: string;
  company: string;
  logo: string;
  logoColor: string;
  employees: string;
  jobCount: string;
  timeAgo: string;
  featured: boolean;
  isLogoAvailable: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location?: any;
  experience?: string;
}

interface JobCategoryDto {
  name: string;
  count: number;
  logo?: string;
}

interface LatestJobOpportunitiesProps {
  IsCompanyModemode?: boolean;
}

const LatestJobOpportunities: React.FC<LatestJobOpportunitiesProps> = ({
  IsCompanyModemode = false,
}) => {
  const nav = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [failedCategoryLogos, setFailedCategoryLogos] = useState<Record<string, boolean>>({});
  const [failedJobLogos, setFailedJobLogos] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const uri = import.meta.env.APP_JOBS_API_URI || "https://jobs.worko.ai";
  const filters = {
    pageSize: 25,
    sortOrder: "desc",
    dashboard: "USER",
    includeCompanyDetails: true,
    status:'PUBLISHED'
  };
  
  const { data: allJobs = [], isLoading } = useQuery({
    queryKey: ["jobs", "all"],
    queryFn: async () => {
      const { response, error } = await httpServiceObj.get<GlobalApiQueryResponseDto<JobDto>>(
        `${uri}/job`,
        true,
        filters,
        true
      );
      if (error) {
        toast.error(`Error fetching jobs: ${error.message}`, getToastOptions({}));
        return [];
      }
      return (
        response?.data.map((job) => {
          const finalLogoUrl = job?.logo
            ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${job?.companyDetails?.logo}`
            : job?.companyDetails?.logoUrl;
          const jobType = job.typeofEmployment ? job.typeofEmployment.replace(/_/g, " ") : "N/A";
          const companyLogoUrl = job?.externalJobId ? job?.companyLogoUrl : finalLogoUrl;
          const isLogoAvailable = finalLogoUrl && finalLogoUrl.trim() !== "";

          return {
            id: job.id,
            location: job.location || "Not specified",
            experience: `${job.experienceRange?.min || 0} - ${job.experienceRange?.max || 0} years`,
            featured: !!job.externalJobId,
            title: job.jobTitle || "N/A",
            type: jobType,
            department: job.department || "N/A",
            salary:
              job.salaryRange?.min && job.salaryRange?.max
                ? `${job.salaryRange.min}L - ${job.salaryRange.max}L`
                : "Not Disclosed",
            company: job.companyDetails?.name || job.companyName || "Unknown",
            logo: companyLogoUrl || "U",
            logoColor: "bg-blue-500",
            employees: `${job.companyDetails?.teamSize || "N/A"}`,
            jobCount: `${job.numOfOpenings || 0} Jobs`,
            timeAgo: DaysFormatter(job.externalJobId ? job?.jobPostedDate : job?.createdAt),
            isLogoAvailable: isLogoAvailable ? true : false,
          } as JobCardDto;
        }) || []
      );
    },
    enabled: !!filters,
  });

  const { groupedJobs, jobCategories } = useMemo(() => {
    const groups: Record<string, JobCardDto[]> = {};
    const categoriesAccumulator: Record<string, JobCategoryDto> = {};
    for (const job of allJobs as JobCardDto[]) {
      const key = IsCompanyModemode
        ? (job.company || "Unknown").trim()
        : (job.department || "N/A").trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(job);
      if (!categoriesAccumulator[key]) {
        categoriesAccumulator[key] = {
          name: key,
          count: 0,
          logo: IsCompanyModemode ? job.logo : undefined,
        };
      }
      categoriesAccumulator[key].count += 1;
    }
    const categories: JobCategoryDto[] = Object.values(categoriesAccumulator).sort(
      (a, b) => b.count - a.count
    );
    return { groupedJobs: groups, jobCategories: categories };
  }, [allJobs, IsCompanyModemode]);

  useEffect(() => {
    if (!selectedCategory && jobCategories.length > 0) {
      setSelectedCategory(jobCategories[0].name);
    }
  }, [jobCategories, selectedCategory]);

  const displayedJobs: JobCardDto[] = useMemo(() => {
    const list =
      selectedCategory && groupedJobs[selectedCategory] ? groupedJobs[selectedCategory] : [];
    return list;
  }, [groupedJobs, selectedCategory]);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const handleReferralNav = (jobId: string) => {
    const fullJob = displayedJobs.find((job) => job.id === jobId);
    const slug: any = generateJobSlug({
      title: fullJob?.title || "Unknown Job",
      company: fullJob?.company ?? "comp",
      location: Array.isArray(fullJob?.location?.city)
        ? fullJob?.location?.city.join(", ")
        : fullJob?.location?.city ||
          (Array.isArray(fullJob?.location?.fullLocation)
            ? fullJob?.location?.fullLocation.join(", ")
            : fullJob?.location?.fullLocation) ||
          "Not specified",
      experience: fullJob?.experience || "0-2 years",
      jobId: fullJob?.id ?? "Unknown",
    });
    nav(slug);
  };

  return (
    <div className="flex-grow overflow-hidden no-scrl  no-scrl-web">
      <div className="flex items-center justify-between mb-6 no_scrll">
        <h2 className="max-sm:text-xl text-4xl sm:ml-2 font-bold ">
         {IsCompanyModemode === false ? (
           <><span className="text-blue-500">Latest</span> Job Opportunities</>
         ) : (
           <>Apply Directly to <span className="text-blue-500">Companies</span></>
         )}
        </h2>
        <div
          className={`flex space-x-2 ${
            displayedJobs.length > 2 ? "" : "opacity-30 pointer-events-none"
          }`}>
          <button
            onClick={() => scroll("left")}
            className="rounded-full bg-gray-100 hover:bg-gray-200 p-2">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full bg-blue-500 hover:bg-blue-600 p-2 text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className=" flex gap-4 max-sm:flex-col">
        {/* Categories */}
        <div className="shrink-0 min-w-[22rem] max-w-[22rem]">
          {/* Desktop view - vertical list */}
          <div className="hidden sm:block space-y-2 max-h-[350px] overflow-auto ">
        {jobCategories.map((category, index) => (
          <div
            key={index}
            className={`flex capitalize gap-4 items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${
          selectedCategory === category.name ? "bg-blue-100" : ""
            }`}
            onClick={() => setSelectedCategory(category.name)}>
            <div className="flex items-center gap-3 min-w-0">
          {IsCompanyModemode && category.logo && !failedCategoryLogos[category.name] ? (
            <img
              src={category.logo}
              onError={() => setFailedCategoryLogos((prev) => ({ ...prev, [category.name]: true }))}
              alt={category?.name}
              className="w-10 h-10 object-contain border rounded-[9px]"
            />
          ) : (
            <Building2 
              className="w-10 h-10 p-2 border rounded-lg text-gray-500"
            />
          )}
          <span className="text-gray-900 font-medium truncate max-w-[250px]">{category.name}</span>
            </div>
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
          {category.count}
            </div>
          </div>
        ))}
          </div>
          
          {/* Mobile view - horizontal chips */}
          <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {jobCategories.map((category, index) => (
          <div
            key={index}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer text-sm whitespace-nowrap ${
          selectedCategory === category.name 
            ? "bg-blue-500 text-white" 
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedCategory(category.name)}>
            {IsCompanyModemode && category.logo && !failedCategoryLogos[category.name] ? (
          <img
            src={category.logo}
            onError={() => setFailedCategoryLogos((prev) => ({ ...prev, [category.name]: true }))}
            alt={category?.name}
            className="w-4 h-4 object-contain rounded"
          />
            ) : (
          <Building2 className="w-4 h-4" />
            )}
            <span className="capitalize font-medium">{category.name}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
          selectedCategory === category.name 
            ? "bg-white/20 text-white" 
            : "bg-blue-100 text-blue-700"
            }`}>
          {category.count}
            </span>
          </div>
        ))}
          </div>
        </div>
        <div
          ref={scrollRef}
          className={`flex gap-6 overflow-x-auto scroll-smooth pb-4 no-scrl no-scrl-web ${
            displayedJobs.length > 5 ? "" : "hide-scrollbar"
          }`}>
          {isLoading ? (
            <p>Loading jobs...</p>
          ) : (
            [...displayedJobs]
              .sort((a, b) => {
                const aNum = parseInt(String(a.jobCount).replace(/\D/g, "")) || 0;
                const bNum = parseInt(String(b.jobCount).replace(/\D/g, "")) || 0;
                return bNum - aNum;
              })
              .map((job, index) => (
                <div
                  key={index}
                  onClick={() => handleReferralNav(job.id)}
                  className={`
                    relative min-w-[320px] max-w-[320px] max-h-[350px] flex-shrink-0 rounded-2xl
                    transition-all duration-300 border-0 shadow-sm cursor-pointer
                    bg-gradient-to-br from-blue-300 to-cyan-100 text-gray-800
                    hover:from-blue-500 hover:to-blue-600 hover:text-white hover:shadow-lg
                  `}>
                  <div className="py-6 px-4 gap-6 flex flex-col h-full items-start">
                    <h3 className="text-2xl capitalize max-w-[300px] truncate font-semibold mb-3">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={`px-3 py-2 text-base capitalize font-medium rounded-3xl bg-gray-100 text-blue-700 group-hover:bg-white/20 group-hover:text-white`}>
                        {job.type.toLowerCase()}
                      </div>
                      <div
                        className={`px-3 py-2 text-base capitalize font-medium rounded-3xl bg-blue-50 text-blue-700 group-hover:bg-white/20 group-hover:text-white`}>
                        {job.department}
                      </div>
                    </div>
                    <div className="text-2xl text-teal-500 group-hover:text-teal-300 mb-6">
                      {job.salary}
                    </div>
                    <div className="absolute flex items-center justify-between gap-2 text-nowrap bottom-20 text-xs w-[90%]">
                      <hr className=" border-gray-400 w-[300px] " />
                      {job.timeAgo}
                    </div>
                    <div className="mt-auto flex justify-between items-center gap-1 w-full">
                      <div className="flex items-center justify-between gap-2 w-2/3">
                        <div
                          data-tooltip-id="my-tooltip"
                          data-tooltip-content={job.company}
                          className="relative cursor-pointer flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center border overflow-hidden">
                          {job.isLogoAvailable && !failedJobLogos[job.id] ? (
                            <img
                              src={job.logo}
                              onError={() => setFailedJobLogos((prev) => ({ ...prev, [job.id]: true }))}
                              alt={job?.company}
                              className="w-[60px] object-contain border h-[60px] sm:w-20 sm:h-20 rounded-[6.75px] sm:rounded-[9px]"
                            />
                          ) : (
                            <Building2 />
                          )}
                        </div>
                        <div className="max-w-[120px] truncate">
                          <div className="font-medium text-left text-xs truncate">{job.company}</div>
                          <div className="flex gap-1 mt-1 items-center">
                            <Users className="w-4 h-4 " />
                            <div className="text-xs ">{job.employees}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-start w-[110%]">
                        <div
                          className={`text-xs w-fit font-medium text-center px-2 py-1 rounded bg-green-100 text-green-700 justify-self-end group-hover:bg-white/20 group-hover:text-white`}>
                          {job.jobCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestJobOpportunities;
