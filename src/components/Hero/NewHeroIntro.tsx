import React, { useState, useRef, useEffect } from "react";
import { Search, Upload, ChevronLeft, ChevronRight, User, Users } from "lucide-react";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import { cloudUpload, dash_lines } from "@Assets";
import { floatingStats } from "./data";
import httpServiceObj from "@Services/ApiHandler.service";
import { GlobalApiQueryResponseDto, JobDto } from "@Interfaces/JobsAndCompany.dto";
import { DaysFormatter } from "@Utils/DaysFormatter.utils";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { generateJobSlug } from "@Utils/JobUriSlug.utils";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@Context/App.context";
import JobListDropdown, { DropDownSelectedJobData } from "./JobListDropdown";

interface jobOpportunitiesDto {
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
}
interface JobCategories {
  name: "Product Management" | "Design" | "Development" | "Marketing" | "Customer Service";
  count: number | null;
}

export default function SmoothHeroIntro() {
  const nav = useNavigate();
  const { setTempCvFile,isLoggedIn } = useAppContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<JobCategories["name"]>("Design"); // default category
  const floatingRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const uri = import.meta.env.APP_JOBS_API_URI || "https://jobs.worko.ai";

  // --- React Query for jobs ---
  const { data: jobOpportunities = [], isLoading } = useQuery({
    queryKey: ["jobs", selectedCategory],
    queryFn: async () => {
      const filters = {
        pageSize: 10,
        searchText: selectedCategory,
        sortOrder: "desc",
      };
      const { response, error } = await httpServiceObj.get<GlobalApiQueryResponseDto<JobDto>>(`${uri}/job`, true, filters, true);
      if (error) {
        toast.error(`Error fetching jobs: ${error.message}`, getToastOptions({}));
        return [];
      }
      return (
        response?.data.map((job) => {
          const finalLogoUrl = job?.logo ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${job?.companyDetails?.logo}` : job?.companyDetails?.logoUrl;
          const jobType = job.typeofEmployment ? job.typeofEmployment.replace(/_/g, " ") : "N/A";
          const companyLogoUrl = job?.externalJobId ? job?.companyLogoUrl : finalLogoUrl;
          console.log("Company Logo URL:", jobType);
          const isLogoAvailable = companyLogoUrl && companyLogoUrl.trim() !== "";
          return {
            id: job.id,
            location: job.location || "Not specified",
            experience: `${job.experienceRange?.min || 0} - ${job.experienceRange?.max || 0} years`,
            featured: !!job.externalJobId,
            title: job.jobTitle || "N/A",
            type: jobType,
            department: job.department || "N/A",
            salary: job.salaryRange?.min && job.salaryRange?.max ? `${job.salaryRange.min}L - ${job.salaryRange.max}L` : "Not Disclosed",
            company: job.companyDetails?.name || job.companyName || "Unknown",
            logo: companyLogoUrl || "U",
            logoColor: "bg-blue-500",
            employees: `${job.companyDetails?.teamSize || "N/A"}`,
            jobCount: `${job.numOfOpenings || 0} Jobs`,
            timeAgo: DaysFormatter(job.externalJobId ? job?.jobPostedDate : job?.createdAt),
            isLogoAvailable: isLogoAvailable ? true : false,
          };
        }) || []
      );
    },
    staleTime: 60_000,
  });

  const jobCategories: JobCategories[] = [
    { name: "Product Management", count: 21 },
    { name: "Design", count: 92 },
    { name: "Development", count: 25 },
    { name: "Marketing", count: 89 },
    { name: "Customer Service", count: 54 },
  ];

  // --- Floating animation ---
  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      animationFrameId = requestAnimationFrame(() => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xPercent = (clientX - innerWidth / 2) / (innerWidth / 2);
        const yPercent = (clientY - innerHeight / 2) / (innerHeight / 2);

        floatingRefs.current.forEach((ref, index) => {
          if (ref) {
            const multiplier = 20 + index * 10;
            const moveX = -xPercent * multiplier;
            const moveY = -yPercent * multiplier;
            ref.style.transform = `translate(${moveX}px, ${moveY}px) rotate(12deg)`;
          }
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Resume Upload (both drag-drop & button) ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed", getToastOptions({}));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB", getToastOptions({}));
      return;
    }
    setTempCvFile(file);
    nav("/auth/signup");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed", getToastOptions({}));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB", getToastOptions({}));
      return;
    }
    setTempCvFile(file);
    nav("/auth/signup");
  };

  // --- Scroll buttons ---
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const handleReferralNav = (JobId: string) => {
    //find job in the response
    const FullJob = jobOpportunities.find((job) => job.id === JobId);
    const slug: any = generateJobSlug({
      title: FullJob?.title || "Unknown Job",
      company: FullJob?.company ?? "comp",
      location: Array.isArray(FullJob?.location?.city) ? FullJob?.location?.city.join(", ") : FullJob?.location?.city || Array.isArray(FullJob?.location?.fullLocation) ? FullJob?.location?.fullLocation.join(", ") : FullJob?.location?.fullLocation || "Not specified",
      experience: FullJob?.experience || "0-2 years",
      jobId: FullJob?.id ?? "Unknown",
    });

    nav(slug);
  };

  return (
    <div ref={containerRef} className=" min-h-screen bg-white relative rounded-b-[40px] overflow-hidden">
      {floatingStats.map((stat, index) => (
        <Reveal key={index} IsDual={false} CName="scale_up" threshold={0.5} PCName="mb-7 mx-auto text-4xl lg:text-[64px] h-auto">
          <div ref={(el) => (floatingRefs.current[index] = el)} className={`max-lg:hidden absolute ${stat.position} bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg transition-transform duration-75 ease-out`} style={{ transform: "rotate(12deg)" }}>
            {stat.text.split("\n").map((line, i) => (
              <React.Fragment key={i}>
                <div className="text-base font-bold">{line}</div>
                <div className="text-xs font-light text-gray-200">{stat.subText}</div>
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      ))}

      <div className="container mx-auto px-4 py-0">
      <img src={dash_lines} className=" bg-repeat z-0 absolute  " alt="" />

        {/* Hero Text */}
        <div className="text-center mb-12">
          <div className="section-wrapper max-sm:!pt-10  !pb-0 text-sm  font-bold ">
            <Reveal IsDual={false} CName="scale_up" threshold={0.5} PCName="mb-7 mx-auto text-4xl lg:text-[64px] md:w-2/3 h-auto">
              <h1 className="  text-center leading-[1.2]  ">Increase your chances of getting a job by</h1>
            </Reveal>
            <Reveal IsDual={false} CName="slide_up" threshold={0.5} PCName="mx-auto w-fit">
              <p className="font-bold text-4xl sm:text-4xl md:text-4xl lg:text-5xl text-[#005EC2] px-6 py-1 sm:px-4 sm:py-2 tracking-wide rounded-lg bg-[#6DE5E5] w-min mx-auto">10X</p>
            </Reveal>
            <h2 className="text-gray-600 max-w-[300px] sm:max-w-[500px] mx-auto mb-8  mt-5">Preparing yourself for success in the interview.</h2>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <JobListDropdown onSelect={(job: DropDownSelectedJobData) => {const encodedTitle = encodeURI(job.jobTitle) ; nav(`/jobs/${encodedTitle}/${job.id}`)}} />
          </div>

          {/* Upload CV */}
          {!isLoggedIn && 
                    <div className="max-w-2xl mx-auto relative  ">
            <div className="border-2  border-gray bg-[#F0F4FF] z-10 rounded-lg">
              <div className="p-8 relative ">
                <div className="text-center">
                  <div className="absolute top-0 left-0 right-0 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg text-sm font-medium mb-6 inline-block">Upload your cv for instant job matches</div>

                  <div className={` flex justify-end max-sm:justify-center border rounded-xl mt-8 p-8 ${dragActive ? "border-dashed border-blue-500 bg-blue-100" : "border-none"}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                    <img src={cloudUpload} alt="Upload Cv" className=" h-60 absolute top-5 left-14 max-sm:hidden " />
                    <div>
                      <p className="text-gray-600 mb-4">Drop & drag your resume or</p>
                      <button className=" hover:bg-blue-600 btn_primary text-white px-6 py-3 rounded-lg flex items-center mx-auto" onClick={() => fileInputRef.current?.click()}>
                        Upload Resume
                      </button>
                      <input type="file" ref={fileInputRef} accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          }
        </div>

        {/* Categories + Jobs */}
        <div className="flex  max-w-[100%]  p-12 flex-col lg:flex-row gap-8 relative">
          {/* Categories */}
          <div className=" shrink-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2 ">
              {jobCategories.map((category, index) => (
                <div key={index} className={`flex gap-4 items-center justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${selectedCategory === category.name ? "bg-blue-100" : ""}`} onClick={() => setSelectedCategory(category.name)}>
                  <span className="text-gray-700">{category.name}</span>
                  {<div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{category.count}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Jobs */}
          <div className="flex-grow  overflow-hidden no-scrl  no-scrl-web">
            <div className="flex items-center justify-between mb-6 no_scrll">
              <h2 className="text-2xl font-bold">
                <span className="text-blue-500">Latest</span> Job Opportunities
              </h2>
              <div className="flex space-x-2">
                <button onClick={() => scroll("left")} className="rounded-full bg-gray-100 hover:bg-gray-200 p-2">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => scroll("right")} className="rounded-full bg-blue-500 hover:bg-blue-600 p-2 text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex gap-6 overflow-x-auto scroll-smooth  pb-4 no-scrl  no-scrl-web hide-scrollbar">
              {isLoading ? (
                <p>Loading jobs...</p>
              ) : (
                jobOpportunities.map((job, index) => {
                  return (
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
                        {/* Title */}
                        <h3 className="text-2xl capitalize max-w-[300px] truncate font-semibold mb-3">{job.title}</h3>

                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-4">
                          <div
                            className={`
                              px-3 py-2 text-base capitalize font-medium rounded-3xl
                              bg-gray-100 text-blue-700
                              group-hover:bg-white/20 group-hover:text-white
                            `}>
                            {job.type.toLowerCase()}
                          </div>
                          <div
                            className={`
                              px-3 py-2 text-base capitalize font-medium rounded-3xl
                              bg-blue-50 text-blue-700
                              group-hover:bg-white/20 group-hover:text-white
                            `}>
                            {job.department}
                          </div>
                        </div>

                        {/* Salary */}
                        <div className="text-2xl text-teal-500 group-hover:text-teal-300 mb-6">{job.salary}</div>

                        <div className="absolute flex items-center justify-between gap-2 text-nowrap  bottom-20  text-xs w-[90%]">
                          <hr className=" border-gray-400 w-[300px] " />
                          {job.timeAgo}
                        </div>
                        {/* Bottom Section */}
                        <div className="mt-auto  flex justify-between items-center gap-1 w-full">
                          <div className="flex items-center justify-between gap-2 w-2/3">
                            <div data-tooltip-id="my-tooltip" data-tooltip-content={job.company} className="relative cursor-pointer flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center border overflow-hidden">
                              {job.isLogoAvailable && !imgError ? <img src={job.logo} onError={() => setImgError(true)} alt={job.title} className="w-[60px] h-[60px] object-contain sm:w-20 sm:h-20 rounded-full" /> : <div className="w-full text-wrap truncate text-[60%] font-extrabold text-sky-400">{job.company}</div>}
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
                              className={`
                                text-xs w-fit font-medium text-center px-2 py-1 rounded 
                                bg-green-100 text-green-700  justify-self-end
                                group-hover:bg-white/20 group-hover:text-white
                              `}>
                              {job.jobCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
