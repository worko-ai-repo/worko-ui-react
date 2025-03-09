import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, MapPin, Share2 } from 'lucide-react';
import httpServiceObj from '@Services/ApiHandler.service';

// Reusable components (unchanged from your original code)
const JobResponsibilities = ({ responsibilities = [] }) => (
  <div className="mb-6">
    <h3 className="font-medium mb-2">Job Responsibilities:</h3>
    <ul className="list-disc pl-5 space-y-2">
      {responsibilities.map((responsibility, index) => (
        <li key={index}>{responsibility}</li>
      ))}
    </ul>
  </div>
);

const JobRequirements = ({ experience = 'Not specified', education = 'Not specified', skills = [] }) => {
  const finaljobSummary = experience ? experience.replace(/\n/g, "<br><br>") : "";
  return(
    <div className="mb-6">
    <h3 className="font-medium mb-2">Job Requirements:</h3>
    <div>
    <div className="space-y-4 mb-4" dangerouslySetInnerHTML={{ __html: finaljobSummary }}></div>
      <p><span className="font-medium">Education:</span> {education}</p>
      <p className="mb-2"><span className="font-medium">Skills:</span></p>
      <ul className="list-disc pl-5 space-y-1">
        {skills.map((skill, index) => (
          <li key={index}>{skill}</li>
        ))}
      </ul>
    </div>
  </div>
  );
};

const AboutCompany = ({ paragraphs = [], aboutCompany = '', socialLinks = [], companyName = 'the company' }) => {
  return(
    <div className="bg-gray-50 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">About {companyName}</h2>
      <p>{aboutCompany}</p>
      
      {paragraphs.length > 0 && <p className="font-medium mb-4">We are not an option, we are a choice!</p>}
      
      {socialLinks && socialLinks.length > 0 && (
        <div className="flex space-x-4 mt-4">
          {socialLinks.map((link, index) => (
            <SocialLink key={index} name={link.name} url={link.url} />
          ))}
        </div>
      )}
    </div>
  );
};

const SocialLink = ({ name, url }) => {
  // Social link component implementation (unchanged)
  const getIcon = () => {
    switch (name) {
      case 'linkedin':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.059 10.059 0 01-3.13 1.2 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColorClass = () => {
    switch (name) {
      case 'linkedin':
        return 'text-blue-600';
      case 'instagram':
        return 'text-pink-600';
      case 'twitter':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <a href={url} className={getColorClass()}>
      {getIcon()}
    </a>
  );
};

const JobCard = ({ job, onApply }) => {
  const companyName = job.companyName || job.company || 'Company';
  const logo = job.companyLogo || job.img || '/api/placeholder/40/40';
  
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
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{companyName} - {job.title}</h3>
              {job.isNew && (
                <span className="bg-[#6DE5E55C] text-[#316BFF] text-xs px-2 py-0.5 rounded">New post</span>
              )}
            </div>
            <div className="flex gap-1">
              <MapPin className="w-4 h-4" />
              <p className="text-sm text-gray-600">{job.location || 'Remote'}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <span>{job.department || 'Not specified'}</span>
        </div>
        
        <div className="justify-self-end">
          <button 
            className="bg-blue-500 mb-2 font-bold text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            onClick={() => onApply && onApply(job)}
          >
            Apply Job
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>Experience: {job.experience || 'Not specified'}</span>
        </div>
        
        <div className="justify-self-end">
          <a href="#" className="text-blue-500 underline text-sm">Refer A Friend</a>
        </div>
      </div>
    </div>
  );
};

const JobPostingPage = ({ jobData }) => {
  // Default to empty object if jobData is undefined
  const job = jobData || {};
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  
  // Get company name from either company or companyName property
  const companyName = job.companyName || job.company || 'the company';
  
  useEffect(() => {
    // Fetch similar jobs when the component mounts
    const fetchSimilarJobs = async () => {
      if (job && job.id) {
        try {
          const { response, error } = await httpServiceObj.get(
            `https://jobs.dev.worko.work/similar-jobs/${job.id}`,
            true,
            {},
            true // Use fullUri
          );
          
          if (error) {
            console.error('Error fetching similar jobs:', error);
            return;
          }
          
          setSimilarJobs(response || []);
        } catch (error) {
          console.error('Error fetching similar jobs:', error);
        }
      }
    };
    
    fetchSimilarJobs();
  }, [job]);
  
  // Handle apply job click
  const handleApplyJob = async (jobToApply = job) => {
    try {
      setIsApplying(true);
      setApplicationStatus(null);
      
      const payload = {
        jobId: jobToApply.id,
        jobUrl: window.location.href,
        jobPortal: jobToApply.jobPortal || undefined,
        matchingScore: jobToApply.matchingScore || undefined
      };
      
      // If it's not an external job, add the company name
      if (!jobToApply.externalJobId) {
        payload.companyName = jobToApply.companyName || jobToApply.company;
      }
      
      const endpoint = jobToApply.externalJobId 
        ? 'https://jobs.dev.worko.work/external-job-application/' 
        : 'https://jobs.dev.worko.work/job-application/';
      
      const { response, error } = await httpServiceObj.post(
        endpoint,
        payload,
        true,
        {},
        true // Use fullUri
      );
      
      if (error) {
        throw new Error(error.message || 'Failed to submit application');
      }
      
      setApplicationStatus({
        success: true,
        message: 'Application submitted successfully!',
      });
    } catch (error) {
      console.error('Application error:', error);
      setApplicationStatus({
        success: false,
        message: 'Failed to submit application. Please try again.',
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  // Fallback if no similar jobs from API
  const getDefaultSimilarJobs = () => {
    if (similarJobs.length > 0) {
      return similarJobs;
    }
    
    // Generate placeholder similar jobs
    return [
      {
        id: 1,
        title: job.title,
        company: job.company || job.companyName,
        companyName: job.companyName || job.company,
        location: job.location,
        department: job.department,
        experience: job.experience,
        isNew: true,
        companyLogo: job.companyLogo,
      },
      {
        id: 2,
        title: job.title,
        company: job.company || job.companyName,
        companyName: job.companyName || job.company,
        location: job.location,
        department: job.department,
        experience: job.experience,
        isNew: false,
        companyLogo: job.companyLogo,
      }
    ];
  };
  
  // Use real similar jobs from API or fallback to generated ones
  const displayedSimilarJobs = getDefaultSimilarJobs();
  
  return (
    <div className="flex flex-col text-left md:flex-row p-4 gap-2 bg-white min-h-screen">
      {/* Left Column - Job Description and About Company */}
      <div className="w-full md:w-[63%] sm:ml-4 xl:ml-16 space-y-6">
        {/* Job Description Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Job description</h2>
          
          <JobRequirements 
            experience={job.jobDescription} 
            education={job.education} 
            skills={job.skills || []} 
          />
          
          {/* Application status notification */}
          {applicationStatus && (
            <div className={`p-3 rounded-md mb-4 ${applicationStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {applicationStatus.message}
            </div>
          )}
          
          <div className="flex justify-center items-center gap-2 mt-6">
            <button 
              className={`${isApplying ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold px-4 py-2 rounded-lg transition-colors`}
              onClick={() => handleApplyJob()}
              disabled={isApplying}
            >
              {isApplying ? 'Applying...' : 'Apply Job'}
            </button>
            <button className="text-black border font-bold border-black px-4 py-2 rounded-lg transition-colors">
              Refer a Friend
            </button>
            <button className="p-2 border border-gray-300 rounded-full">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* About Company Section */}
        <AboutCompany 
          paragraphs={job.aboutCompany || []} 
          aboutCompany={job.companyDescription || job.jobDescription || ''}
          socialLinks={job.socialLinks || []}
          companyName={companyName}
        />
      </div>
      
      {/* Right Column - Similar Jobs */}
      <div className="w-full md:w-[37%]">
        <div className="lg:p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Similar jobs</h2>
          
          {/* Map through similar jobs */}
          {displayedSimilarJobs.length > 0 ? (
            displayedSimilarJobs.map((similarJob) => (
              <JobCard 
                key={similarJob.id} 
                job={similarJob} 
                onApply={handleApplyJob}
              />
            ))
          ) : (
            <p className="text-gray-500">No similar jobs found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPostingPage;