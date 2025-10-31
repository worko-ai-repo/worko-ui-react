import React, { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import MessageModal from "@Components/Modals/MessageModal";
import { JobDto, JobMatchingScoreDto } from "@Interfaces/JobsAndCompany.dto";
import { toast } from "react-toastify";
import { useAppContext } from "@Context/App.context";
import styles from "../jobDescription.module.scss";
import { toTitleCase } from "@Utils/Titlecase.utils";
import { getToastOptions } from "@Utils/Toast.utils";
import { RBAC } from "@Utils/RoleBaseAccessControll.utils";
interface JobRequirementsProps {
  jobDescription?: string;
  education?: string;
  skills?: string[];
}
/**
 * Decodes an HTML-encoded string into a plain HTML string.
 *
 * This function uses the browser's DOMParser to convert entities like
 * `&lt;`, `&gt;`, `&amp;`, etc., back to their actual characters.
 *
 * @param {string} html - The HTML-encoded string to decode.
 * @returns {string} - The decoded HTML string.
 *
 * @example
 * decodeHTML('&lt;div&gt;Hello&lt;/div&gt;');
 * // Returns: "<div>Hello</div>"
 */

const isFullyEscapedHTML = (html: string) => {
  return /&lt;[^&]*&gt;/.test(html); // matches patterns like &lt;p&gt;
};

const getHTML = (html: string) => {
  if (isFullyEscapedHTML(html)) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.documentElement.textContent || "";
  }
  return html;
};

export const JobRequirements: React.FC<JobRequirementsProps> = ({
  jobDescription = "Not specified",
}) => {
  const decode = getHTML(jobDescription);
  return (
    <div className={`mb-6 min-h-[250px] break-words text-wrap ${styles.job_description_container}`}>
      <h2 className="text-xl font-semibold mb-4 break-words text-wrap">Job description</h2>
      <div
        className={`space-y-4 mb-4 break-words  ${styles.job_description}`}
        dangerouslySetInnerHTML={{ __html: decode }}></div>
    </div>
  );
};

interface AboutCompanyProps {
  paragraphs?: string[] | undefined;
  aboutCompany?: string;
  socialLinks?: string;
  companyName?: string;
}

export const AboutCompany: React.FC<AboutCompanyProps> = ({
  paragraphs = [],
  aboutCompany = "",
  socialLinks = "",
  companyName,
}) => {
  const finalCompanyName = toTitleCase(companyName || "Company");
  return (
    <div className={`mb-6 min-h-[250px] ${styles.job_description_container}`}>
      <h2 className="text-xl font-semibold mb-4">About {finalCompanyName}</h2>
      {/* <h3 className="font-medium mb-2">Job Requirements:</h3> */}
      <div
        className={`space-y-4 mb-4 ${styles.job_description}`}
        dangerouslySetInnerHTML={{ __html: aboutCompany }}></div>
      {/* {paragraphs.length > 0 && <p className="font-medium mb-4">We are not an option, we are a choice!</p>} @Todo Vaibhav why this is added? */}

      {socialLinks && socialLinks.length > 0 && (
        <div className="flex space-x-4 mt-4">
          <SocialLink name="Socicals" url={socialLinks} />
        </div>
      )}
    </div>
  );
};

interface SocialLinkProps {
  name: string;
  url: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ name, url }) => {
  const getIcon = () => {
    switch (name) {
      case "linkedin":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        );
      case "instagram":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case "twitter":
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
      case "linkedin":
        return "text-blue-600";
      case "instagram":
        return "text-pink-600";
      case "twitter":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <a href={url} className={getColorClass()}>
      {getIcon()}
    </a>
  );
};

interface JobDetailsProps {
  job: JobDto;
  isApplying: boolean;
  applicationStatus: boolean;
  onApply: () => void;
  jobMatchDetails: JobMatchingScoreDto | undefined;
  isProfileCheckComplete: boolean;
}

const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  applicationStatus,
  onApply,
  jobMatchDetails,
  isProfileCheckComplete,
}) => {
  // console.log(job);
  const [matchScore, setMatchScore] = useState<number | undefined>(0);
  const canApply = RBAC.can("apply_jobs");
  const { isLoggedIn } = useAppContext();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: "Check this out!",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      toast.error("Sharing not supported, try another method.", getToastOptions());
    }
  };
  // Reset match score when login status changes
  useEffect(() => {
    if (!isLoggedIn) {
      setMatchScore(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setMatchScore(jobMatchDetails?.matchingScore);
  }, [jobMatchDetails]);

  // Calculate the effective match score to display (0 if not logged in)
  const displayMatchScore = isLoggedIn ? matchScore || 0 : 0;

  return (
    <div className="w-full min-h-full space-y-6">
      <div className="">
        <JobRequirements
          jobDescription={job?.htmlJobDescription ? job.htmlJobDescription : job?.jobDescription}
        />

        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            data-tooltip-id="my-tooltip"
            data-tooltip-content={
              !isProfileCheckComplete && isLoggedIn && canApply
                ? "Please wait, validating your profile..."
                : isLoggedIn && canApply
                ? applicationStatus
                  ? "You have already applied for this job"
                  : "Click to apply for this job"
                : "Please login as candidate to apply for this job"
            }
            className={` disabled:bg-gray-400 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 
              text-white font-bold px-4 py-2 rounded-lg transition-colors`}
            onClick={onApply}
            disabled={
              applicationStatus ||
              job.status === "ARCHIVED" ||
              job.status === "CLOSED" ||
              !canApply ||
              (!isProfileCheckComplete && isLoggedIn && canApply)
            }>
            {isLoggedIn && canApply
              ? applicationStatus
                ? "Already Applied"
                : job.status === "ARCHIVED" ||
                  job.status === "CLOSED" ||
                  displayMatchScore <
                    1 /* If Not Applied then Check if the job is Archived or Closed or if the Score is not generated yet */
                ? `${displayMatchScore < 1 ? "Apply Now" : job.status}`
                : "Apply Now"
              : "Login to Apply"}
          </button>

          <button onClick={handleShare} className="p-2 border border-gray-300 rounded-full">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {job.companyDetails?.aboutCompany && (
        <AboutCompany
          // paragraphs={job?.companyDetails?.aboutCompany || []}
          aboutCompany={job?.companyDetails?.aboutCompany || ""}
          socialLinks={job.linkedIn || ""}
          companyName={job.companyName || "the company"}
        />
      )}
    </div>
  );
};

export default JobDetails;
