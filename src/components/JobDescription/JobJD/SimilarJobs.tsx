import React, { useState } from 'react';
import { Share2, Briefcase, Clock, MapPin } from 'lucide-react';
import MessageModal from '@Components/Modals/MessageModal';
import { JobDto } from '@Interfaces/JobsAndCompany.dto';
import { useNavigate } from 'react-router-dom';

interface JobCardProps {
  job: JobDto;
  onApply?: (job: JobDto) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const nav = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const companyName = job.companyName || 'Company';
  const logo = job.logoUrl || '/api/placeholder/40/40';
  const jobTitle = job.jobTitle || 'Position';
  const location = job.location || 'Remote';
  const jobId = job.id;
  
  // Calculate if job is new (posted within last 7 days)
  const isNew = job.createdAt ? 
    (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 3600 * 24) < 7 : 
    job.isNew || false;
  
  // Format experience display based on available data
  const getExperienceText = () => {
    if (job.experienceRange) {
      return `${job.experienceRange.min}-${job.experienceRange.max} years`;
    }
    return job.experienceRange || 'Not specified';
  };

  const handleApplyClick = () => {
    // Open the job URL in a new tab if available
    if (job.jobUrl) {
      window.open(job.jobUrl, '_blank');
    }
    // Show the confirmation modal
    setShowApplyModal(true);
  };
  
  // Add the handleReferralNav function from your code
  const handleReferralNav = () => {
    // console.log(companyName);
    // Replace any whitespace special characters with underscore in company name
    const refinedCompanyName = companyName.replace(/\s/g, "_");
    nav(`/jobs/${refinedCompanyName}/${jobId}`);
  };
  
  return (
    <div className="border rounded-lg p-3 sm:p-4 mb-4 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
        <div className="flex w-full gap-3 justify-between">
          <span className='flex gap-2 w-2/3'>
          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
            {typeof logo === 'string' ? (
              <img src={logo} alt={`${companyName} logo`} className="w-full h-full object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full">{companyName}</div>
            )}
          </div>
          <div className="w-full min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
              <h3 
                data-tooltip-id="my-tooltip" 
                data-tooltip-content={jobTitle} 
                className="font-medium text-xs md:text-sm lg:text-base truncate max-w-full sm:max-w-[170px] md:max-w-[220px] lg:max-w-[280px]"
              >
                {(companyName ?? 'Company').charAt(0).toUpperCase() + (companyName ?? 'Company').slice(1).toLocaleLowerCase()} - {jobTitle}
              </h3>
            </div>
            <div className="flex gap-1 items-center mt-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {typeof location === 'object' && location.fullLocation 
                  ? Array.isArray(location.fullLocation) 
                    ? location.fullLocation.join(', ')
                    : location.fullLocation
                  : 'Remote'}
              </p>
            </div>
          </div>
          </span>
          <span>
          {isNew && (
                <span className="bg-[#6DE5E55C] text-center text-[#316BFF] text-nowrap text-xs px-2 py-0.5 rounded self-start xs:self-auto">New post</span>
              )}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 mt-3 sm:mt-6">
        <div className="col-span-1 sm:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{job.typeofEmployment ? (job.typeofEmployment.includes("_") ? job.typeofEmployment.replace(/_/g, " ") : job.typeofEmployment) : ""}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Experience: {getExperienceText()}</span>
          </div>
        </div>
        <div className="col-span-1 flex justify-center items-end sm:justify-end mt-2 sm:mt-0">
          <button 
            className="bg-blue-500 font-bold text-white px-3 h-min sm:px-4 sm:py-2 rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm w-full sm:w-auto"
            onClick={handleReferralNav} 
          >
            Apply Job
          </button>
        </div>
      </div>

      {showApplyModal && 
        <MessageModal 
          type="info"
          size="lg"
          heading={{ type: 'info', message: 'Application Confirmation' }}
          message="Did you complete the application process?"
          onClose={() => setShowApplyModal(false)}
          showCloseButton={true}
          buttons={[
            { 
              label: 'Yes', 
              action: () => {
                if (onApply) onApply(job);
                setShowApplyModal(false);
              }, 
              type: 'success'
            },
            { 
              label: 'No', 
              action: () => {
                setShowApplyModal(false);
              }, 
              type: 'danger'
            }
          ]}
        />
      }
    </div>
  );
};

interface SimilarJobsProps {
  similarJobs: JobDto[];
  onApply: (job: JobDto) => void;
}

const SimilarJobs: React.FC<SimilarJobsProps> = ({ similarJobs, onApply }) => {
  return (
    <div className="w-full">
      <div className="p-3 sm:p-4 lg:p-6 lg:!pr-0 rounded-lg">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-6">Similar jobs</h2>
        
        <div className="space-y-3 sm:space-y-4">
          {similarJobs.length > 0 ? (
            similarJobs.map((similarJob) => (
              <JobCard 
                key={similarJob.id} 
                job={similarJob} 
                onApply={onApply}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No similar jobs found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarJobs;