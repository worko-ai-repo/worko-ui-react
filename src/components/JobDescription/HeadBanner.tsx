import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import JobCard from './Jobcard';
import GaugeComponent from '@Components/Company/Gauge';

// Import the JobData interface and helper function from the interfaces file
// (We're including the interface definition inline for this example)
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

// Properly type the props
interface HeadBannerProps {
  jobData?: any;
}

const HeadBanner: React.FC<HeadBannerProps> = ({ jobData }) => {
  return (
    <div className="p-6 bg-[#316BFF]">
      {/* Title and social media icons section */}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 h-full">
        
        <div className="lg:col-span-2 max-w-[830px] lg:ml-0 xl:ml-16 flex flex-col gap-6">
          <div className="grid grid-cols-1 mb-0 mt-6">
            <h1 className="text-white text-2xl text-left font-bold md:mb-0">
              {jobData ? 
                `Apply for jobs at ${isExternalJob(jobData) ? 
                  jobData.companyName : 
                  jobData.department}` : 
                'Apply for this position'}
            </h1>
          </div>
          
          {/* Pass the jobData to JobCard */}
          <JobCard jobData={jobData} />
          
          {/* Pass the matchPercentage to MatchMetrics */}
          {/* <MatchMetrics matchPercentage={jobData?.matchPercentage} /> */}
        </div>
      
        <div className="flex flex-col justify-end">
          {/* Pass relevant job data to SkillsCard */}
          <SkillsCard 
            department={isExternalJob(jobData) ? 
              jobData?.companyName : 
              jobData?.department}
            employmentType={jobData?.typeofEmployment}
            salary={getFormattedSalary(jobData)}
            coreSkills={isExternalJob(jobData) ? 
              [jobData?.companyName || '', jobData?.location || ''] : 
              jobData?.coreSkills}
            experience={getFormattedExperience(jobData)}
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to get formatted salary
const getFormattedSalary = (jobData?: JobData): string => {
  if (!jobData) return "Not Disclosed";
  
  if (isExternalJob(jobData)) {
    return "Not Disclosed"; // External jobs might not have salary info
  } else {
    if (jobData.salaryRange?.min && jobData.salaryRange?.max) {
      return `${jobData.salaryRange.min.toLocaleString()} - ${jobData.salaryRange.max.toLocaleString()}`;
    }
    return "Not Disclosed";
  }
};

// Helper function to get formatted experience
const getFormattedExperience = (jobData?: JobData): string => {
  if (!jobData) return "Not Specified";
  
  if (isExternalJob(jobData)) {
    return "Not Specified"; // External jobs might not have experience info
  } else {
    if (jobData.experienceRange?.min && jobData.experienceRange?.max) {
      return `${jobData.experienceRange.min} - ${jobData.experienceRange.max} Years`;
    }
    return "Not Specified";
  }
};

// Extracted social media icons to a separate component
const SocialMediaIcons = () => {
  return (
    <div className="w-32 h-12 flex-shrink-0 bg-white border border-black/5 rounded-md shadow-md flex items-center justify-center space-x-3">
      {/* Social media icons would go here */}
    </div>
  );
};

// Update MatchMetrics to use the matchPercentage
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
    <div className="hidden lg:block w-full bg-[#3EA0F0] max-h-[150px] rounded-[20px] p-6 flex-grow">
      <div className="flex justify-between flex-wrap gap-4">
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
        <div className="w-full h-full rounded-full flex items-center justify-center">
          <GaugeComponent score={value} />
        </div>
      </div>
      <p className="text-sm font-medium text-white">{label}</p>
    </div>
  );
};

// Update SkillsCard to use dynamic data
interface SkillsCardProps {
  department?: string;
  employmentType?: string;
  salary?: string;
  coreSkills?: string[];
  experience?: string;
}

const SkillsCard: React.FC<SkillsCardProps> = ({ department, employmentType, salary, coreSkills, experience }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };
  
  // Parse department to extract skills if coreSkills is not provided
  const displaySkills = useMemo(() => {
    if (coreSkills && coreSkills.length > 0) return coreSkills;
    
    if (!department) return ["Not Specified"];
    
    // If department contains commas, split it into multiple skills
    if (department.includes(',')) {
      return department.split(',').map(skill => skill.trim());
    }
    
    // Otherwise use department as a single skill
    return [department];
  }, [coreSkills, department]);
  
  // Use provided experience or derive from employmentType
  const displayExperience = useMemo(() => {
    if (experience) return experience;
    if (!employmentType) return "Not Specified";
    
    // This is a simple placeholder - you might want to extract real experience from your data
    return employmentType.includes("Senior") ? "3-4 Years" : "1-2 Years";
  }, [experience, employmentType]);
  
  // Format salary or use "Not Disclosed"
  const formattedSalary = useMemo(() => {
    return salary || "Not Disclosed";
  }, [salary]);

  return (
    <div className="bg-transparent lg:bg-white rounded-[20px] lg:p-6">
      {/* Desktop version (lg and above) */}
      <div className="hidden lg:flex text-left lg:flex-col lg:justify-between lg:h-full">
        <div>
          <h2 className="text-xl font-bold mb-4">Core skills</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {displaySkills.map((skill, index) => (
              <SkillTag key={index} label={skill} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Experience</h2>
          <div className="mb-6">
            <SkillTag label={displayExperience} />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">CTC</h2>
          <div>
            <SkillTag label={formattedSalary} />
          </div>
        </div>
      </div>

      {/* Mobile version (below lg) */}
      <div className="lg:hidden w-full">
        <div className="flex flex-col gap-2">
          {/* Core Skills Section */}
          <div className="bg-white rounded-3xl p-4">
            <div className="flex h-[15px] justify-between items-center">
              <h2 className="text-xl font-bold">Core skills</h2>
              <button onClick={() => toggleSection('coreSkills')}>
                {openSection === 'coreSkills' ? 
                  <ChevronUp size={36} className="text-gray-400" /> : 
                  <ChevronDown size={36} className="text-gray-400" />
                }
              </button>
            </div>
            
            {openSection === 'coreSkills' && (
              <div className="flex flex-wrap gap-2 mt-4">
                {displaySkills.map((skill, index) => (
                  <SkillTag key={index} label={skill} />
                ))}
              </div>
            )}
          </div>
          
          {/* Experience Section */}
          <div className="bg-white rounded-3xl p-4">
            <div className="flex h-[15px] justify-between items-center">
              <h2 className="text-xl font-bold">Experience</h2>
              <div className="flex items-center">
                <span className="text-md mr-2">{displayExperience}</span>
                <button onClick={() => toggleSection('experience')}>
                  {openSection === 'experience' ? 
                    <ChevronUp size={36} className="text-gray-400" /> : 
                    <ChevronDown size={36} className="text-gray-400" />
                  }
                </button>
              </div>
            </div>
            
            {openSection === 'experience' && (
              <div className="mt-4">
                <SkillTag label={displayExperience} />
              </div>
            )}
          </div>
          
          {/* CTC Section */}
          <div className="bg-white rounded-3xl p-4">
            <div className="flex h-[15px] justify-between items-center">
              <h2 className="text-xl font-bold">CTC</h2>
              <div className="flex items-center">
                <span className="text-md mr-2">{formattedSalary}</span>
                <button onClick={() => toggleSection('ctc')}>
                  {openSection === 'ctc' ? 
                    <ChevronUp size={36} className="text-gray-400" /> : 
                    <ChevronDown size={36} className="text-gray-400" />
                  }
                </button>
              </div>
            </div>
            
            {openSection === 'ctc' && (
              <div className="mt-4">
                <SkillTag label={formattedSalary} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillTag = ({ label }: { label: string }) => {
  return (
    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-800 inline-block relative w-32">
      <span className="truncate block max-w-[85%]">
        {label}
      </span>
    </span>
  );
};

export default HeadBanner;