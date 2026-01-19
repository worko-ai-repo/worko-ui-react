import { Link } from "react-router-dom";
import { JobDto } from "@Interfaces/JobsAndCompany.dto";
import { generateCanonicalJobSlug } from "@Utils/JobUriSlug.utils";

interface InternalLinksProps {
  currentJob?: JobDto;
  relatedJobs?: JobDto[];
  companyName?: string;
  companyId?: string;
}

/**
 * Internal linking component for SEO
 * Creates structured internal links between jobs, companies, and related pages
 */
const InternalLinks: React.FC<InternalLinksProps> = ({
  currentJob,
  relatedJobs,
  companyName,
  companyId,
}) => {
  const baseUrl = import.meta.env.APP_WORKO_BASE_URL || window.location.origin;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Related Opportunities</h2>
        
        {/* Company page link */}
        {companyName && (
          <div className="mb-4">
            <Link
              to={`/jobs?company=${encodeURIComponent(companyName)}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View all jobs at {companyName}
            </Link>
          </div>
        )}

        {/* Related jobs */}
        {relatedJobs && relatedJobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedJobs.slice(0, 6).map((job) => {
              const jobSlug = generateCanonicalJobSlug(job);
              return (
                <Link
                  key={job.id}
                  to={jobSlug}
                  className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg mb-2">{job.jobTitle}</h3>
                  <p className="text-gray-600 text-sm">
                    {job.companyName || job.companyDetails?.name}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {job.location?.fullLocation?.join(", ")}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Category/Department links */}
        {currentJob?.department && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Browse more jobs in:</p>
            <Link
              to={`/jobs?department=${encodeURIComponent(currentJob.department)}`}
              className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
            >
              {currentJob.department} Jobs
            </Link>
          </div>
        )}

        {/* Location-based links */}
        {currentJob?.location?.city && currentJob.location.city.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Jobs in this location:</p>
            <div className="flex flex-wrap gap-2">
              {currentJob.location.city.slice(0, 3).map((city) => (
                <Link
                  key={city}
                  to={`/jobs?location=${encodeURIComponent(city)}`}
                  className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                  Jobs in {city}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Navigation links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/jobs" className="text-blue-600 hover:text-blue-800">
              Browse All Jobs
            </Link>
            <Link to="/referrals" className="text-blue-600 hover:text-blue-800">
              Request Referral
            </Link>
            <Link to="/corporate" className="text-blue-600 hover:text-blue-800">
              For Employers
            </Link>
            <Link to="/about" className="text-blue-600 hover:text-blue-800">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternalLinks;
