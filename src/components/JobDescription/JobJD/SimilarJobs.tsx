import React, { useState } from 'react';
import { Share2, Briefcase, Clock, MapPin } from 'lucide-react';
import MessageModal from '@Components/Modals/MessageModal';

// Updated interface to handle both internal and external job types
interface Job {
  id: string;
  jobTitle: string;
  company?: string;
  companyName?: string;
  location?: string;
  department?: string;
  experienceRange?: { min: number; max: number };
  experience?: string;
  isNew?: boolean;
  companyLogo?: string;
  companyLogoUrl?: string;
  workMode?: string;
  externalJobId?: string;
  typeofEmployment?: string;
  isDeleted?: boolean;
  createdAt?: string;
  status?: string;
  jobUrl?: string;
}

interface JobCardProps {
  job: Job;
  onApply?: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const companyName = job.companyName || job.company || 'Company';
  const logo = job.companyLogo || job.companyLogoUrl || '/api/placeholder/40/40';
  const jobTitle = job.jobTitle || 'Position';
  const location = job.location || 'Remote';
  console.log(job);
  
  // Calculate if job is new (posted within last 7 days)
  const isNew = job.createdAt ? 
    (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 3600 * 24) < 7 : 
    job.isNew || false;
  
  // Format experience display based on available data
  const getExperienceText = () => {
    if (job.experienceRange) {
      return `${job.experienceRange.min}-${job.experienceRange.max} years`;
    }
    return job.experience || 'Not specified';
  };

  const handleApplyClick = () => {
    // Open the job URL in a new tab if available
    if (job.jobUrl) {
      window.open(job.jobUrl, '_blank');
    }
    // Show the confirmation modal
    setShowApplyModal(true);
  };
  
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
            {typeof logo === 'string' ? (
              <img src={logo} alt={`${companyName} logo`} className="w-full h-full object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            )}
          </div>
          <div>
            {/* @TODO: ASHUTOSH */}
            <div className="flex items-center gap-2 truncate max-w-[70%] ">
              <h3 
                    data-tooltip-id="my-tooltip" data-tooltip-content={companyName} className="font-medium text-xs md:text-base text-nowrap truncate max-w-[70%] ">{companyName} - {jobTitle}</h3>
              {isNew && (
                <span className="bg-[#6DE5E55C] text-center text-[#316BFF] text-nowrap text-xs px-2 py-0.5 rounded">New post</span>
              )}
            </div>
            <div className="flex gap-1">
              <MapPin className="w-4 h-4" />
              <p className="text-sm text-gray-600">{location}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <span>{job.department || job.typeofEmployment || 'Not specified'}</span>
        </div>
        
        <div className="justify-self-end">
          <button 
            className="bg-blue-500 mb-2 font-bold text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            onClick={handleApplyClick}
          >
            Apply Job
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>Experience: {getExperienceText()}</span>
        </div>
        
        <div className="justify-self-end">
          <a href="#" className="text-blue-500 underline text-sm">Refer A Friend</a>
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
  similarJobs: Job[];
  onApply: (job: Job) => void;
}

const SimilarJobs: React.FC<SimilarJobsProps> = ({ similarJobs, onApply }) => {
  return (
    <div className="w-full md:w-[37%]">
      <div className="lg:p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-6">Similar jobs</h2>
        
        {similarJobs.length > 0 ? (
          similarJobs.map((similarJob) => (
            <JobCard 
              key={similarJob.id} 
              job={similarJob} 
              onApply={onApply}
            />
          ))
        ) : (
          <p className="text-gray-500">No similar jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default SimilarJobs;