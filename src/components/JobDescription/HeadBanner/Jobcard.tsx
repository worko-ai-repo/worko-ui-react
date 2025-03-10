import React, { useState, useMemo, useEffect } from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import GaugeComponent from '@Components/Company/Gauge';
import { useParams } from 'react-router-dom';
import httpServiceObj from '@Services/ApiHandler.service';
import { JobMatchingScoreDto } from '@Interfaces/JobsAndCompany.dto';
import { useAppContext } from '@Context/App.context';

// Include the interface definitions
interface BaseJobData {
  id: string;
  jobTitle?: string;
  jobDescription?: string;
  location?: string;
  status?: string;
  workMode?: string;
  typeofEmployment?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  matchPercentage?: number;
  companyLogoUrl?: string;
  companyName?: string;
}

interface InternalJobData extends BaseJobData {
  companyId?: string;
  otherRequirements?: string;
  experienceRange?: {
    min?: number;
    max?: number;
  };
  noticePeriod?: number;
  numOfOpenings?: number;
  salaryRange?: {
    min?: number;
    max?: number;
  };
  department?: string;
  coreSkills?: string[];
  softSkills?: string[];
  technicalSkills?: string[];
  miscellaneousSkills?: string[];
  createdByUserId?: string;
}

interface ExternalJobData extends BaseJobData {
  externalJobId: string;
  jobPostedDate?: string;
  jobCreatedDate?: string;
  jobUrl?: string;
  companyName?: string;
  companyUrl?: string;
}

type JobData = InternalJobData | ExternalJobData;

function isExternalJob(job: JobData): job is ExternalJobData {
  return 'externalJobId' in job;
}

interface JobCardProps {
  jobData?: JobData;
}

interface MatchMetricsProps {
  matchPercentage?: number;
}

const MatchMetrics: React.FC<MatchMetricsProps> = ({ matchPercentage = 0 }) => {
  // Calculate individual metrics based on the overall matching percentage
  // This is a simple example - you might want to adjust the calculation logic
  const getMetricValue = (baseValue: number, multiplier: number) => {
    return Math.min(100, Math.max(0, Math.round(baseValue * multiplier)));
  };
  
  // Derive individual metrics from the overall match percentage
  const experienceMatch = getMetricValue(matchPercentage, 0.9);
  const skillsMatch = getMetricValue(matchPercentage, 1.1);
  const responsibilityMatch = getMetricValue(matchPercentage, 0.8);
  const industryMatch = getMetricValue(matchPercentage, 1.2);
  const achievementMatch = getMetricValue(matchPercentage, 0.95);

  return (
    <div className="hidden lg:block w-full  max-h-[150px] rounded-[20px] p-2 flex-wrap">
      <div className="flex justify-between text-blue-600 flex-wrap gap-4">
        <MetricGauge value={experienceMatch} label="Experience" />
        <MetricGauge value={skillsMatch} label="Skills" />
        <MetricGauge value={responsibilityMatch} label="Responsibility" />
        <MetricGauge value={industryMatch} label="Industry" />
        <MetricGauge value={achievementMatch} label="Achievement" />
      </div>
    </div>
  );
};

const MetricGauge = ({ value, label }: { value: number, label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 relative mb-2">
        <div className="w-full h-full text-blue-600 rounded-full flex items-center justify-center">
          <GaugeComponent score={value} color={'black'} />
        </div>
      </div>
      <p className="text-sm font-medium text-black">{label}</p>
    </div>
  );
};

const JobCard: React.FC<JobCardProps> = ({ jobData }) => {
  const {isLoggedIn} = useAppContext();
  const { jobid } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ phone: "", email: "" });
  const [matchScore, setMatchScore] = useState<number | undefined>(0);
  const [strengthLabel, setStrengthLabel] = useState<string>("Strong Match");
  const [isLoading, setIsLoading] = useState(false);

  console.log(jobData)
    
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
    
  const handleSubmit = () => {
    alert(`Job shared with: ${formData.phone}, ${formData.email}`);
    setShowModal(false);
  };

  // Fetch real-time matching score data - properly at top level
  useEffect(() => {
    const fetchMatchingScore = async () => {
      if (!jobid) return;
      
      setIsLoading(true);
      try {
        // Assuming httpServiceObj is available globally or passed as prop
        const { response, error } = await httpServiceObj.get<{data:[JobMatchingScoreDto], pagination:Object}>(
          `https://jobs.dev.worko.work/user-matching-score-job/?jobIds=${jobid}&pageSize=1`,
          true,
          {},
          true
        );
        
        if (response && response.data && response.data.length > 0) {
          const matchingData = response.data[0].matchingScore;
          console.log(matchingData);
          setMatchScore(matchingData);
        }
      } catch (err) {
        console.error("Error fetching matching score:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatchingScore();
  }, [jobid]);

  useEffect(() => {
    // Update the strength label based on the match score
    if (matchScore !== undefined && matchScore < 40) {
      setStrengthLabel("Poor Match");
    } else if ((matchScore ?? 0) < 60) {
      setStrengthLabel("Moderate Match");
    } else if ((matchScore ?? 0) < 80) {
      setStrengthLabel("Good Match");
    } else {
      setStrengthLabel("Strong Match");
    }
  }, [matchScore]);

  // Get company name based on job type
  const companyName = useMemo(() => {
    if (!jobData) return 'Company';
    return isExternalJob(jobData) ? jobData.companyName : 'Company';
  }, [jobData]);

  // Get company logo URL
  const companyLogoUrl = useMemo(() => {
    if (!jobData) return 'placeholder-logo.png';
    return isExternalJob(jobData) ? 
      `/logos/${jobData.companyName?.toLowerCase().replace(/\s+/g, '-')}.png` : 
      'placeholder-logo.png';
  }, [jobData]);

  // Determine if the job posting is recent
  const isEarlyApplicant = useMemo(() => {
    if (!jobData) return false;
    
    const createdDate = new Date(
      isExternalJob(jobData) ? 
        jobData.jobCreatedDate || jobData.createdAt || '' : 
        jobData.createdAt || ''
    );
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate >= threeDaysAgo;
  }, [jobData]);

  // Format the time since posting
  const timeAgo = useMemo(() => {
    if (!jobData) return "Recently posted";
    
    const postedDate = jobData.createdAt
    
    if (!postedDate) return "Recently posted";
    
    const now = new Date();
    const posted = new Date(postedDate);
    const diffMinutes = Math.floor((now.getTime() - posted.getTime()) / 1000 / 60);
    
    if (diffMinutes < 60) {
      return `${diffMinutes} mins ago`;
    } else if (diffMinutes < 1440) { // Less than 24 hours
      const diffHours = Math.floor(diffMinutes / 60);
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffDays = Math.floor(diffMinutes / 1440); // 1440 = 60 mins * 24 hours
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
  }, [jobData]);

  // Get department or employment type based on job type
  const departmentOrType = useMemo(() => {
    if (!jobData) return 'Department';
    
    return isExternalJob(jobData) ? 
      jobData.typeofEmployment || 'Full Time' : 
      jobData.department || 'Department';
  }, [jobData]);

  // Get location based on job type
  const jobLocation = useMemo(() => {
    if (!jobData) return 'Location';
    return jobData.location || 'Location';
  }, [jobData]);

  // Get employment type based on job type
  const employmentType = useMemo(() => {
    if (!jobData) return 'Employment Type';
    return jobData.typeofEmployment || 'Full Time';
  }, [jobData]);

  return (
    <div className="w-full bg-white rounded-[20px] md:rounded-[15px] border border-black/5 shadow-[0px_4px_16px_rgba(0,0,0,0.05)] md:shadow-[0px_3px_12px_rgba(0,0,0,0.05)] p-6 md:p-4">
      <div className="flex flex-col mt-6 md:mx-4 gap-4">
        {/* Header Section - Changed to flex-col on mobile */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          {/* Left section with image, title, and tags - Full width on mobile */}
          <div className="flex flex-col w-full md:max-w-[70%] gap-2">
            {/* Top row with image, title, department, and salary */}
            <div className="flex w-full gap-4">
              {/* Image column */}
              <div className="relative flex-shrink-0">
              {jobData?.companyLogoUrl ? (
                    <img 
                      src={jobData.companyLogoUrl}  
                      className="w-[60px] object-contain border h-[60px] sm:w-20 sm:h-20 rounded-[6.75px] sm:rounded-[9px]"
                    />
                  ) : (
                    <div className="w-[60px] object-contain text-xs border text-blue-500 font-semibold h-[60px] sm:w-20 sm:h-20 rounded-[6.75px] sm:rounded-[9px] flex items-center justify-center">
                      {jobData?.companyName}
                    </div>
                  )}
              </div>
              
              {/* Content column */}
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-md text-left sm:text-lg md:text-[24px] font-poppins font-semibold text-[#0D0D0D] mb-1">
                  {companyName} - {jobData?.jobTitle || 'Job Title'}
                </h2>
                <p className="text-xs text-left md:text-[12px] text-[#313131] mb-1">
                  {departmentOrType}
                </p>
              </div>
            </div>
            
            {/* Mobile layout: Arrange tags and gauge on same row */}
            <div className="flex flex-row justify-between mt-2 md:mt-1">
              {/* Tags - Flex-wrap on mobile */}
              <div className="flex flex-wrap gap-1 overflow-hidden">
                <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">
                  16 candidates
                </span>
                <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">
                  {timeAgo}
                </span>
                {isEarlyApplicant && (
                  <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">
                    Be an early applicant
                  </span>
                )}
                
              </div>
              
              {/* Gauge on mobile only */}
              <div className=" md:hidden flex-shrink-0 box-content rounded-xl w-[80px] h-[70px] 
                bg-gradient-to-b from-[#316BFF] to-[#316BFF] 
                overflow-hidden text-white p-5 flex flex-col items-center justify-center">
                
                {/* Gauge Component */}
                <div className="w-full h-full rounded-full border-3 border-[#6DE5E5] 
                  bg-[#367BFB] flex items-center justify-center">
                  {isLoading ? (
                    <div className="animate-pulse w-8 h-8 bg-blue-300 rounded-full"></div>
                  ) : (
                    <GaugeComponent score={matchScore || 0} />
                  )}
                </div>

                {isLoggedIn ? (
                  <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">{strengthLabel}</p>
                ) : (
                  <div className="flex  items-center w-[120%] justify-center gap-2 text-center cursor-pointer "  data-tooltip-id="my-tooltip" data-tooltip-content="Please login to view scores" >
                    <i className="fa-solid text-yellow-500 fa-triangle-exclamation cursor-pointer text-xs sm:text-sm"></i>
                    <small className="text-[8px] sm:text-xs">Account Required</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Score - Moved inside the flex container */}
          <div className="hidden md:flex py-4 box-content ml-auto rounded-xl w-[91.5px] h-[75px] sm:w-[122px] sm:h-[100px] 
            flex-shrink-0 bg-gradient-to-b from-blue-500 to-blue-600
            overflow-hidden text-white p-3 sm:p-4 flex flex-col items-center justify-end scale-90">

            {/* Gauge Component */}
            <div className="w-full pt-2 h-full border-3 border-[#6DE5E5] 
              flex items-center justify-center sm:scale-90">
              {isLoading ? (
                <div className="animate-pulse w-12 h-12 bg-blue-300 rounded-full"></div>
              ) : (
                <GaugeComponent score={matchScore || 0} />
              )}
            </div>
                    
            {/* Text Below Gauge */}
            {isLoggedIn ? (
                  <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">{strengthLabel}</p>
                ) : (
                  <div className="flex  items-center w-[120%] justify-center gap-2 text-center cursor-pointer "  data-tooltip-id="my-tooltip" data-tooltip-content="Please login to view scores" >
                    <i className="fa-solid text-yellow-500 fa-triangle-exclamation cursor-pointer text-xs sm:text-sm"></i>
                    <small className="text-[8px] sm:text-xs">Account Required</small>
                  </div>
                )}
          </div>
        </div>
        {/* Pass the matchPercentage to MatchMetrics */}
        <MatchMetrics matchPercentage={matchScore} />
        <div style={{width: '100%', height: '100%', border: '0.50px #454545 solid'}}></div>
        
        {/* Location, Job Type, and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Location and Job Type */}
          <div className="flex flex-wrap gap-6 md:gap-4 text-xs md:text-[12px] text-[#313131]">
            <div className="flex items-center gap-1">
              <MapPin size={16} className="md:w-3 md:h-3" />
              <span className='text-[12px] font-semibold'>{jobLocation}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="md:w-3 md:h-3" />
              <span className='text-[12px] font-semibold'>{employmentType}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-start md:justify-end">
            <button className="flex-1 flex-initial w-[140px] md:w-[140px] px-6 py-2 bg-[#4B7EFF] text-white rounded-lg text-sm md:text-xs font-bold h-auto sm:h-9">
              View Details
            </button>
            {/* <button className="flex-1 flex-initial w-[140px] md:w-[140px] px-2 py-2 text-red-500 border border-black rounded-lg text-sm md:text-xs font-bold h-auto sm:h-9">
              View Feedback
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;