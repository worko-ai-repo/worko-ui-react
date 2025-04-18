import React, { useState, useMemo, useEffect } from "react";
import {
  MapPin,
  Clock,
  Building2,
  ChevronDown,
} from "lucide-react";
import GaugeComponent from "@Components/Company/Gauge";
import { useParams } from "react-router-dom";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto, JobMatchingScoreDto } from "@Interfaces/JobsAndCompany.dto";
import { useAppContext } from "@Context/App.context";
import { toTitleCase } from "@Utils/Titlecase.utils";
import { DaysFormatter } from "@Utils/DaysFormatter.utils";
import { toast } from "react-toastify";
import CustomModal from "@Components/Modals/FormModal";
import countryCodes from "@Utils/CountryCodes.utils";

interface JobCardProps {
  jobData: JobDto;
  isApplying?: boolean;
  onApply: () => void;
  applicationStatus: boolean;
  jobMatchDetails: JobMatchingScoreDto | undefined;
}

interface MatchMetricsProps {
  jobMatchDetails: JobMatchingScoreDto | undefined;
  isLoggedIn: boolean;
}
interface finalScoreDetails {
  skill: number;
  experience: number;
  roleAndResponsibilities: number;
  industryExperience: number;
  education: number;
}
const MatchMetrics: React.FC<MatchMetricsProps> = ({
  jobMatchDetails,
  isLoggedIn,
}) => {
  // Calculate individual metrics based on the overall matching percentage
  /*   const getMetricValue = (baseValue: number, multiplier: number) => {
    // Return 0 if not logged in, otherwise calculate the metric
    if (!isLoggedIn) return 0;
    return Math.min(100, Math.max(0, Math.round(baseValue * multiplier)));
  }; */

  // Derive individual metrics from the overall match percentage

  let experienceMatch = 0;
  let skillsMatch = 0;
  let responsibilityMatch = 0;
  let industryMatch = 0;
  let achievementMatch = 0;

  if (jobMatchDetails !== undefined) {
    const finalScoreDetails: finalScoreDetails = jobMatchDetails?.scoreDetails;
    experienceMatch = Math.floor(finalScoreDetails?.experience) ?? -1;
    skillsMatch = Math.floor(finalScoreDetails?.skill) ?? -1;
    responsibilityMatch =
      Math.floor(finalScoreDetails?.roleAndResponsibilities) ?? -1;
    industryMatch = Math.floor(finalScoreDetails?.industryExperience) ?? -1;
    achievementMatch = Math.floor(finalScoreDetails?.education) ?? -1;
  }

  return (
    <div className="hidden lg:block w-full  max-h-[150px] rounded-[20px] p-2 flex-wrap">
      <div className="flex justify-between text-blue-600 flex-wrap gap-4">
        <MetricGauge value={experienceMatch} label="Experience" />
        <MetricGauge value={skillsMatch} label="Skills" />
        <MetricGauge value={responsibilityMatch} label="Responsibility" />
        <MetricGauge value={industryMatch} label="Industry" />
        <MetricGauge value={achievementMatch} label="Education" />
      </div>
    </div>
  );
};

const MetricGauge = ({ value, label }: { value: number; label: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 relative mb-2">
        <div className="w-full h-full text-blue-600 rounded-full flex items-center justify-center text-sm">
          <GaugeComponent score={value} color={"black"} />
        </div>
      </div>
      <p className="text-sm font-medium text-black">{label}</p>
    </div>
  );
};

const JobCard: React.FC<JobCardProps> = ({
  jobData,
  isApplying = false,
  onApply,
  applicationStatus,
  jobMatchDetails,
}) => {
  const { isLoggedIn } = useAppContext();
  const { jobid } = useParams();
  const [matchScore, setMatchScore] = useState<number | undefined>(0);
  const [strengthLabel, setStrengthLabel] = useState<string>("Strong Match");
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Reset match score when login status changes
  useEffect(() => {
    if (!isLoggedIn) {
      setMatchScore(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setMatchScore(jobMatchDetails?.matchingScore);
  }, [jobMatchDetails]);

  useEffect(() => {
    // Update the strength label based on the match score
    if (!isLoggedIn) {
      setStrengthLabel("Account Required");
    } else if (matchScore !== undefined && matchScore < 40) {
      setStrengthLabel("Poor Match");
    } else if ((matchScore ?? 0) < 60) {
      setStrengthLabel("Moderate Match");
    } else if ((matchScore ?? 0) < 80) {
      setStrengthLabel("Good Match");
    } else {
      setStrengthLabel("Strong Match");
    }
  }, [matchScore, isLoggedIn]);

  const handleCountryCodeSelect = (code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requestData = {
      recipientName: formData.fullName,
      recipientEmail: formData.email,
      recipientPhoneNumber: formData.phone,
      jobId: jobid,
      companyId: jobData.companyId,
      recipientPhoneCountryCode: countryCode.replace("+", ""),
    };

    try {
      const { response, error, status } = await httpServiceObj.post(
        "https://jobs.dev.worko.work/refer-and-earn",
        requestData,
        true,
        {},
        true
      );

      if (status === 409) {
        toast.error("You have already referred this person for this job.");
        return;
      }
      if (status === 201) {
        toast.success("Referral applied successfully!");
        return;
      }

      setShowModal(false);
    } catch (error: any) {
      console.error("Error details:", error);
      toast.error(error?.message || "Failed to submit referral");
    } finally {
      setFormData({ fullName: "", phone: "", email: "" });
      setShowModal(false);
    }
  };

  // Get company name based on job type

  const companyName = jobData.externalJobId
    ? jobData.companyName
    : jobData?.companyDetails?.name;
  const titleCasedCompanyName = toTitleCase(companyName!);
  const titleCaseDepartment = toTitleCase(jobData?.department || "");
  const titleCaseLocation = toTitleCase(
    jobData?.location?.fullLocation?.join(", ") || ""
  );
  const finalLogoUrl = jobData?.companyDetails?.logo
    ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${
        jobData?.companyDetails?.logo
      }`
    : jobData?.companyDetails?.logoUrl;

  const companyLogoUrl = jobData?.externalJobId
    ? jobData?.companyLogoUrl
    : finalLogoUrl;

  const isLogoAvailable = companyLogoUrl && companyLogoUrl.trim() !== "";

  const jobTitle = toTitleCase(jobData?.jobTitle);

  // Determine if the job posting is recent
  const isEarlyApplicant = useMemo(() => {
    if (!jobData) return false;

    const createdDate = new Date(
      jobData.externalJobId
        ? jobData.jobPostedDate || jobData.createdAt || ""
        : jobData.createdAt || ""
    );

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate >= threeDaysAgo;
  }, [jobData]);

  // Format the time since posting
  const timeAgo = useMemo(
    () =>
      DaysFormatter(
        jobData.externalJobId ? jobData?.jobPostedDate : jobData?.createdAt
      ),
    [jobData.createdAt]
  );

  function handleApplyClick(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
  }

  // Calculate the effective match score to display (0 if not logged in)
  const displayMatchScore = isLoggedIn ? matchScore || 0 : 0;

  return (
    <div className="w-full bg-white rounded-[20px] md:rounded-[15px] border border-black/5 shadow-[0px_4px_16px_rgba(0,0,0,0.05)] md:shadow-[0px_3px_12px_rgba(0,0,0,0.05)] pl-6 pb-6 md:p-4">
      <div className="flex flex-col mt-6 md:mx-4 gap-4">
        {/* Header Section - Changed to flex-col on mobile */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          {/* Left section with image, title, and tags - Full width on mobile */}
          <div className="flex flex-col w-full md:max-w-[70%] gap-2">
            {/* Top row with image, title, department, and salary */}
            <div className="flex w-full gap-4">
              {/* Image column */}
              <div
                className="relative flex-shrink-0 cursor-pointer border  w-16 rounded-md h-[60px] sm:w-20 sm:h-20  sm:rounded-[9px] overflow-hidden flex items-center justify-center "
                data-tooltip-id="my-tooltip"
                data-tooltip-content={companyName}
              >
                {isLogoAvailable && !imgError ? (
                  <img
                    src={companyLogoUrl}
                    onError={() => setImgError(true)}
                    className="object-contain  "
                  />
                ) : (
                  <Building2 />
                )}
              </div>

              {/* Content column */}
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-md text-left sm:text-lg md:text-[24px] font-poppins font-semibold text-[#0D0D0D] mb-1">
                  {titleCasedCompanyName} - {jobTitle || "Job Title"}
                </h2>
                <p className="text-xs text-left md:text-[12px] text-[#313131] mb-1">
                  {titleCaseDepartment}
                </p>
              </div>
            </div>

            {/* Mobile layout: Arrange tags and gauge on same row */}
            <div className="flex flex-row justify-between mt-2 md:mt-1">
              {/* Tags - Flex-wrap on mobile */}
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {/* <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">
                  16 candidates
                </span> */}
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
              <div
                className=" md:hidden flex-shrink-0 box-content rounded-xl w-[80px] h-[70px] 
                bg-gradient-to-b from-[#316BFF] to-[#316BFF] 
                overflow-hidden text-white p-5 flex flex-col items-center scale-75 sm-scale-100 justify-center"
              >
                {/* Gauge Component */}
                <div
                  className="w-full h-full rounded-full border-3 border-[#6DE5E5] 
                  bg-[#367BFB] flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-pulse w-8 h-8 bg-blue-300 rounded-full"></div>
                  ) : (
                    <GaugeComponent score={displayMatchScore} />
                  )}
                </div>

                {isLoggedIn ? (
                  <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">
                    {displayMatchScore !== -1 ? strengthLabel : "Processing"}
                  </p>
                ) : (
                  <div
                    className="flex  items-center w-[120%] justify-center gap-2 text-center cursor-pointer "
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Please login to view scores"
                  >
                    <small className="text-[8px] sm:text-xs">
                      Account Required
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Score - Moved inside the flex container */}
          <div
            className="hidden md:flex py-4 box-content ml-auto rounded-xl w-[91.5px] h-[75px] sm:w-[122px] sm:h-[100px] 
            flex-shrink-0 bg-gradient-to-b from-blue-500 to-blue-600
            overflow-hidden text-white p-3 sm:p-4 flex flex-col items-center justify-end scale-90"
          >
            {/* Gauge Component */}
            <div
              className="w-full pt-2 h-full border-3 border-[#6DE5E5] 
              flex items-center justify-center sm:scale-90"
            >
              {isLoading ? (
                <div className="animate-pulse w-12 h-12 bg-blue-300 rounded-full"></div>
              ) : (
                <GaugeComponent score={displayMatchScore} />
              )}
            </div>

            {/* Text Below Gauge */}
            {isLoggedIn ? (
              <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">
                {displayMatchScore !== -1 ? strengthLabel : "Processing"}
              </p>
            ) : (
              <div
                className="flex  items-center w-[120%] justify-center gap-2 text-center cursor-pointer "
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Please login to view scores"
              >
                <small className="text-[8px] sm:text-xs">
                  Account Required
                </small>
              </div>
            )}
          </div>
        </div>
        {/* Pass the matchPercentage to MatchMetrics */}
        {isLoggedIn && (
          <MatchMetrics
            jobMatchDetails={jobMatchDetails}
            isLoggedIn={isLoggedIn}
          />
        )}
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "0.50px #454545 solid",
          }}
        ></div>

        {/* Location, Job Type, and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Location and Job Type */}
          <div className="flex flex-wrap gap-6 md:gap-4 text-xs md:text-[12px] text-[#313131]">
            <div className="flex gap-1">
              <MapPin size={16} className="md:w-3 md:h-3" />
              <span className="text-[12px] font-semibold">
                {!jobData?.location?.fullLocation?.length
                  ? "Not Disclosed"
                  : titleCaseLocation}
              </span>
            </div>
            <div className="flex gap-1">
              <Clock size={16} className="md:w-3 md:h-3" />
              <span className="text-[12px] font-semibold">
                {jobData.typeofEmployment
                  ? jobData.typeofEmployment.includes("_")
                    ? jobData.typeofEmployment.replace(/_/g, " ")
                    : jobData.typeofEmployment
                  : "Not Disclosed"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {/* Button container with responsive layout */}
<div className="flex items-center justify-end gap-2 w-full md:w-auto">
  {/* Refer A Friend button */}
  <button
    onClick={() => setShowModal(true)}
    className="w-full md:w-auto px-6 py-2 border border-[#0D0D0D] rounded-lg text-sm font-bold h-11 flex justify-center items-center text-center"
  >
    Refer A Friend
  </button>
  
  {/* Apply button */}
  <button
    className={`w-full md:w-auto ${
      applicationStatus ||
      jobData.status === "ARCHIVED" ||
      jobData.status === "CLOSED"
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-blue-500 hover:bg-blue-600"
    } 
      text-white font-bold flex justify-center items-center px-4 mr-4 md:mr-0 py-2 rounded-lg transition-colors h-11 text-center`}
    onClick={onApply}
    disabled={
      applicationStatus ||
      jobData.status === "ARCHIVED" ||
      jobData.status === "CLOSED"
    }
  >
    {isLoggedIn
      ? applicationStatus
        ? "Already Applied"
        : jobData.status === "ARCHIVED" || jobData.status === "CLOSED"
        ? `${jobData.status}`
        : "Apply Now"
      : "Login to Apply"}
  </button>
</div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <CustomModal
          type="share"
          title="Refer a Friend and Earn Rewards!"
          onSubmit={() => {}} // Pass function directly
          onClose={() => setShowModal(false)}
          hideDefaultButtons={true}
        >
          <div className="text-center px-4">
            <p className="text-gray-600 text-sm mb-4">
              Enter the details of the candidate you believe is a great fit for
              the role. If your referral gets hired, you'll receive a monetary
              reward as a bonus!
            </p>
          </div>
          <form className="space-y-4 px-4" onSubmit={handleReferSubmit}>
            <div>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input_primary text-gray-500 w-full p-2 border rounded"
                placeholder="Full Name"
                required
              />
            </div>
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input_primary text-gray-500 w-full p-2 border rounded"
                placeholder="E-Mail ID"
                required
              />
            </div>
            <div>
              {/* Phone input with country code dropdown */}
              <div className="flex items-center">
                {/* Country code dropdown */}
                <div className="relative country-dropdown-container">
                  <div
                    className="input_primary flex items-center gap-1 text-gray-500 p-2 border rounded cursor-pointer border-r-0"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  >
                    <span>{countryCode}</span>
                    <ChevronDown size={14} />
                  </div>

                  {/* Dropdown list */}
                  {showCountryDropdown && (
                    <div className="absolute z-10 top-full left-0 mt-1 w-48 max-h-44 overflow-y-auto bg-white shadow-lg rounded border">
                      {countryCodes.map((item) => (
                        <div
                          key={item.code}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                          onClick={() => handleCountryCodeSelect(item.code)}
                        >
                          <span className="font-medium">{item.code}</span>
                          <span className="text-gray-500">{item.country}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone input */}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input_primary text-gray-500 flex-1 p-2 border rounded"
                  placeholder="Contact Number"
                  required
                />
              </div>
            </div>
            <div className="text-center mt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded w-full"
              >
                Submit Referral
              </button>
            </div>
          </form>
          <p className="text-gray-400 text-xs text-center mt-4 px-4">
            Your information is secure and will only be used to process your
            referral and communicate about the program.
          </p>
        </CustomModal>
      )}
    </div>
  );
};

export default JobCard;
