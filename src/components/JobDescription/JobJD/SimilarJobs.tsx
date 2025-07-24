import React, { useState } from "react";
import { Share2, Briefcase, Clock, MapPin, Building2 } from "lucide-react";
import MessageModal from "@Components/Modals/MessageModal";
import { JobDto } from "@Interfaces/JobsAndCompany.dto";
import { replace, useNavigate } from "react-router-dom";
import { toTitleCase } from "@Utils/Titlecase.utils";
import { formatRange } from "@Utils/RangeFormater.utils";
import { generateJobSlug } from "@Utils/JobUriSlug.utils";

interface JobCardProps {
  job: JobDto;
  onApply?: (job: JobDto) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onApply }) => {
  const nav = useNavigate();
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const companyName = job.externalJobId ? job.companyName : job?.companyDetails?.name;
  const titleCasedCompanyName = toTitleCase(companyName!);
  const titleCaseLocation = toTitleCase(job?.location?.fullLocation?.join(", ") || "");
  const jobTitle = toTitleCase(job?.jobTitle);
  const jobId = job.id;
  const [imgError, setImgError] = useState(false);

  // Calculate if job is new (posted within last 7 days)
  const isNew =
    job.createdAt || job.jobPostedDate //@Fix this if it breaks
      ? (new Date().getTime() - new Date(job.externalJobId ? job?.jobPostedDate! : job.createdAt).getTime()) / (1000 * 3600 * 24) < 7
      : job.isNew || false;

  // Format experience display based on available data
  const getExperienceText = () => {
    if (job.experienceRange) {
      return `${job.experienceRange.min}-${job.experienceRange.max} years`;
    }
    return job.experienceRange || "Not specified";
  };

  const toSlug = (text: string) => encodeURIComponent(text.trim().replace(/\s+/g, "-"));

  const exp = formatRange(job.experienceRange?.min ?? 0, job.experienceRange?.max ?? 0, "experience");

  const jobLocation = job?.location?.fullLocation?.join("-") || "location";

  const handleReferralNav = () => {
    const slug = generateJobSlug({
      title: jobTitle,
      company: companyName ?? "comp",
      location: jobLocation,
      experience: exp,
      jobId: jobId,
    });

    nav(slug, {
      state: { FullJob: job as JobDto },
    });
  };

  const finalLogoUrl = job?.companyDetails?.logo ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${job?.companyDetails?.logo}` : job?.companyDetails?.logoUrl;

  const companyLogoUrl = job?.externalJobId ? job?.companyLogoUrl : finalLogoUrl;

  const isLogoAvailable = companyLogoUrl && companyLogoUrl.trim() !== "";

  const getJobUrl = () => {
    return generateJobSlug({
      title: jobTitle,
      company: companyName ?? "comp",
      location: jobLocation,
      experience: exp,
      jobId: jobId,
    });
  };

  return (
    <div className="border rounded-lg p-3 sm:p-4 mb-4 transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
        <div className="flex w-full justify-between">
          <span className="flex w-fit  gap-2 ">
            <div data-tooltip-id="my-tooltip" data-tooltip-content={companyName} className="  w-10 h-10 border cursor-pointer bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
              {isLogoAvailable && !imgError ? <img src={companyLogoUrl} alt={`${companyName} logo`} onError={() => setImgError(true)} className="w-full h-full object-contain" /> : <Building2 />}
            </div>
            <div className="w-full   min-w-0">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                <a href={getJobUrl()} data-tooltip-id="my-tooltip" data-tooltip-content={jobTitle} className="font-medium cursor-pointer text-xs md:text-sm lg:text-base text-wrap max-h-5 truncate max-w-full ">
                  {titleCasedCompanyName}- {jobTitle}
                </a>
              </div>
              <div className="flex gap-1 items-baseline  mt-1">
                <MapPin className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" />
                <p className="text-xs sm:text-xs text-gray-600 word-break truncate w-[180px]">{titleCaseLocation}</p>
              </div>
            </div>
          </span>
          <span className="flex">{isNew && <span className="bg-[#6DE5E55C] text-center text-[#316BFF] text-nowrap text-xs px-2 py-0.5 rounded self-start xs:self-auto">New post</span>}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0 mt-3 items-end sm:mt-6">
        <div className="col-span-1 sm:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-xs truncate">{job.typeofEmployment ? (job.typeofEmployment.includes("_") ? job.typeofEmployment.replace(/_/g, " ") : job.typeofEmployment) : ""}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span className="text-xs sm:text-xs">Experience: {getExperienceText()}</span>
          </div>
        </div>
        <button className="btn_secondary transition-colors text-xs sm:text-xs !px-0 h-min items-end " onClick={handleReferralNav}>
          Apply Job
        </button>
      </div>

      {showApplyModal && (
        <MessageModal
          type="info"
          size="lg"
          heading={{ type: "info", message: "Application Confirmation" }}
          message="Did you complete the application process?"
          onClose={() => setShowApplyModal(false)}
          showCloseButton={true}
          buttons={[
            {
              label: "Yes",
              action: () => {
                if (onApply) onApply(job);
                setShowApplyModal(false);
              },
              type: "success",
            },
            {
              label: "No",
              action: () => {
                setShowApplyModal(false);
              },
              type: "danger",
            },
          ]}
        />
      )}
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
            similarJobs.map((similarJob) => <JobCard key={similarJob.id} job={similarJob} onApply={onApply} />)
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
