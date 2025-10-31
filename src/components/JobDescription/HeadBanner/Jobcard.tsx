import React, { useState, useMemo, useEffect } from "react";
import { MapPin, Clock, Building2, ChevronDown, Home } from "lucide-react";
import GaugeComponent from "@Components/Company/Gauge";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto, JobMatchingScoreDto } from "@Interfaces/JobsAndCompany.dto";
import { useAppContext } from "@Context/App.context";
import { toTitleCase } from "@Utils/Titlecase.utils";
import { DaysFormatter } from "@Utils/DaysFormatter.utils";
import { toast } from "react-toastify";
import CustomModal from "@Components/Modals/FormModal";
import countryCodes from "@Utils/CountryCodes.utils";
import { getToastOptions } from "@Utils/Toast.utils";
import { useForm } from "react-hook-form";
import { validationRules } from "@Utils/FormValidator.utils";
import { ApiCallResponse } from "@Interfaces/HttpOption.dto";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import { ReferrFriendDto } from "@Components/Company/JobCard";
import { RBAC } from "@Utils/RoleBaseAccessControll.utils";

interface ReferralFormDTO {
  phoneNumber: number;
  name: string;
  fullName: string;
  email: string;
  phone: number;
  phoneCountryCode: string;
}

interface ReferralFormData {
  fullName: string;
  email: string;
  phone: number;
  phoneCountryCode: string;
}

interface JobCardProps {
  jobData: JobDto;
  isApplying?: boolean;
  onApply: () => void;
  applicationStatus: boolean;
  jobMatchDetails: JobMatchingScoreDto;
  isProfileCheckComplete: boolean;
}

interface MatchMetricsProps {
  displayMatchScore: any;
  miscScore: {
    coreSkills: number;
    experience: number;
    roleAndResponsibilities: number;
    softSkills: number;
  };
  isLoggedIn: boolean;
}

const MatchMetrics: React.FC<MatchMetricsProps> = ({
  displayMatchScore,
  miscScore,
  isLoggedIn,
}) => {
  return (
    <div className="hidden lg:block w-full  max-h-[150px] rounded-[20px] p-2 pb-0 flex-wrap">
      <div className="flex justify-between text-blue-600 flex-wrap gap-4">
        <MetricGauge
          value={miscScore?.coreSkills ?? 0}
          label="Core Skills"
          isLoggedIn={isLoggedIn}
        />
        <MetricGauge
          value={miscScore?.softSkills ?? 0}
          label="Soft Skills"
          isLoggedIn={isLoggedIn}
        />
        <MetricGauge
          value={miscScore?.experience ?? 0}
          label="Experience"
          isLoggedIn={isLoggedIn}
        />
        <MetricGauge
          value={miscScore?.roleAndResponsibilities ?? 0}
          label="Responsibilities"
          isLoggedIn={isLoggedIn}
        />
      </div>
    </div>
  );
};

const MetricGauge = ({
  value,
  label,
  isLoggedIn,
}: {
  value: number;
  label: string;
  isLoggedIn: boolean;
}) => {
  const canApply = RBAC.can("apply_jobs");
  return (
    <div className="flex flex-col items-center ">
      <div
        className="w-16 h-16 relative mb-2 cursor-pointer"
        {...(!isLoggedIn && {
          "data-tooltip-id": "my-tooltip",
          "data-tooltip-content": "Please login to view scores",
        })}>
        <div
          className={`w-full ${
            isLoggedIn === true ? "" : "border border-blue-600"
          } h-full text-blue-600 rounded-full flex items-center justify-center text-sm`}>
          <div className={`${canApply ? "" : "border"} rounded-full`}>
            <GaugeComponent score={canApply ? value : 0} color={"black"} />
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-black">{label}</p>
    </div>
  );
};

const JobCard: React.FC<JobCardProps> = ({
  jobData,
  onApply,
  applicationStatus,
  jobMatchDetails,
  isProfileCheckComplete,
}) => {
  const { isLoggedIn, PendingApply, setPendingApply } = useAppContext<ReferrFriendDto>();
  const { jobid } = useParams();
  const [matchScore, setMatchScore] = useState<number>(0);
  const [miscScore, setMiscScore] = useState<{
    coreSkills: number;
    experience: number;
    roleAndResponsibilities: number;
    softSkills: number;
  }>({ coreSkills: -1, experience: -1, roleAndResponsibilities: -1, softSkills: -1 });
  const [strengthLabel, setStrengthLabel] = useState<string>("Strong Match");
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const nav = useNavigate();
  const locationHook = useLocation(); // Using location hook for checking URL changes

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ReferralFormData>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: undefined,
      phoneCountryCode: "+91",
    },
  });

  const phoneCountryCode = watch("phoneCountryCode");

  // Reset match score when login status changes
  useEffect(() => {
    if (!isLoggedIn) {
      setMatchScore(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    setMatchScore(jobMatchDetails?.matchingScore);
    setMiscScore(jobMatchDetails?.scoreDetails);
  }, [jobMatchDetails]);

  useEffect(() => {
    // Update the strength label based on the match score
    if (!isLoggedIn) {
      setStrengthLabel("Account Required");
    } else if (matchScore !== undefined && matchScore < 40) {
      setStrengthLabel("Poor Match");
    } else if ((matchScore ?? -1) < 60) {
      setStrengthLabel("Moderate Match");
    } else if ((matchScore ?? -1) < 80) {
      setStrengthLabel("Good Match");
    } else {
      setStrengthLabel("Strong Match");
    }
  }, [matchScore, isLoggedIn]);

  const handleCountryCodeSelect = (code: string) => {
    setValue("phoneCountryCode", code);
    setShowCountryDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".country-dropdown-container")) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset form when modal is closed
  useEffect(() => {
    if (!showModal) {
      reset();
    }
  }, [showModal, reset]);

  useEffect(() => {
    // Check if user just logged in and has pending data
    if (isLoggedIn) {
      const pendingData =
        PendingApply ||
        secureStorage.getItem<continueReferralRequestDataDto<ReferrFriendDto>>(
          SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS
        );

      // If we have pending data and it's for refer and earn
      if (pendingData !== null && typeof pendingData === "object" && "data" in pendingData) {
        try {
          // Populate form with saved data
          const savedData = (pendingData as any)?.data?.recipientDetails;
          // console.log("Saved Data:", pendingData);
          if (savedData) {
            setValue("fullName", savedData.name || "");
            setValue("email", savedData.email || "");
            setValue("phone", savedData.phoneNumber || 0);
            setValue("phoneCountryCode", `+${savedData.phoneCountryCode}` || "+91");

            // Submit form after a brief delay to ensure values are set
            handleSubmit(onSubmit)();
          } else {
            console.warn("recipientDetails was null or undefined");
          }
        } catch (error) {
          console.error("Error processing pending referral data:", error);
        } finally {
          // Clear the pending data
          secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, null);
          localStorage.removeItem("continueReferAndEarnRequestData");
          setPendingApply(null); // Clear the pending apply state
        }
      }
    }
  }, [isLoggedIn, locationHook.pathname]); // Run when login status or location changes

  const onSubmit = async (formData: ReferralFormData) => {
    const requestData = {
      recipientDetails: {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: Number(formData.phone),
        phoneCountryCode: Number(formData.phoneCountryCode.slice(1)),
      },
      companyDetails: {
        id: jobData.companyId,
        name: companyName,
      },
      jobDetails: {
        id: jobid,
        title: jobData.jobTitle,
        url: jobData.jobUrl,
      },
    };

    if (!isLoggedIn) {
      // Store data for after login
      const continueReferAndEarnRequestData = {
        type: "continueReferAndEarn",
        data: requestData,
        url: window.location.href,
      };

      // Store in both secure storage and localStorage
      secureStorage.setItem(
        SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS,
        continueReferAndEarnRequestData
      );
      setPendingApply(continueReferAndEarnRequestData);
      localStorage.setItem(
        "continueReferAndEarnRequestData",
        JSON.stringify(continueReferAndEarnRequestData)
      );

      // Navigate to login
      nav("/auth/login");
      return;
    }

    try {
      const result = (await toast.promise(
        httpServiceObj.post(
          `${import.meta.env.APP_JOBS_API_URI}/refer-and-earn`,
          requestData,
          true,
          {},
          true
        ),
        {
          pending: "Sharing job...",
        },
        getToastOptions()
      )) as ApiCallResponse;

      const { response, error, status } = result;

      if (status === 409) {
        toast.error("You have already referred this person for this job.", getToastOptions());
        return;
      }

      if (error) {
        console.error("Error details:", error);
        throw new Error(error.message || "Failed to submit referral");
      }

      // console.log('Referral submitted successfully:', response);
      toast.success(
        "You just opened a new door for your friend  Fingers crossed for their success (and your reward!)",
        getToastOptions()
      );
    } catch (error: any) {
      console.error("Error submitting referral:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit referral",
        getToastOptions()
      );
    } finally {
      reset();
      setShowModal(false);
    }
  };

  // Get company name based on job type
  const companyName = jobData.externalJobId ? jobData.companyName : jobData?.companyDetails?.name;
  const titleCaseDepartment = toTitleCase(jobData?.department || "");
  const titleCaseLocation = toTitleCase(jobData?.location?.fullLocation?.join(", ") || "");
  const finalLogoUrl = jobData?.companyDetails?.logo
    ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${jobData?.companyDetails?.logo}`
    : jobData?.companyDetails?.logoUrl;

  const companyLogoUrl = jobData?.externalJobId ? jobData?.companyLogoUrl : finalLogoUrl;

  const isLogoAvailable = companyLogoUrl && companyLogoUrl.trim() !== "";

  const jobTitle = toTitleCase(jobData?.jobTitle);
  const canApply = RBAC.can("apply_jobs");

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
    () => DaysFormatter(jobData.externalJobId ? jobData?.jobPostedDate : jobData?.createdAt),
    [jobData.createdAt]
  );

  // Calculate the effective match score to display (0 if not logged in)
  const displayMatchScore = isLoggedIn ? matchScore : 0;
  const miscScoreValue = isLoggedIn
    ? miscScore
    : { coreSkills: 0, experience: 0, roleAndResponsibilities: 0, softSkills: 0 };
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
                data-tooltip-content={companyName}>
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
                  {jobTitle || "Job Title"}
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
                overflow-hidden text-white p-5 flex flex-col items-center scale-75 sm-scale-100 justify-center">
                {/* Gauge Component */}
                <div
                  className="w-full h-full rounded-full border-3 border-[#6DE5E5] 
                  bg-[#367BFB] flex items-center justify-center">
                  {isLoading ? (
                    <div className="animate-pulse w-8 h-8 bg-blue-300 rounded-full"></div>
                  ) : (
                    <GaugeComponent score={displayMatchScore} />
                  )}
                </div>

                {isLoggedIn && canApply ? (
                  <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">
                    {displayMatchScore !== -1 ? strengthLabel : "Processing"}
                  </p>
                ) : (
                  <div
                    className="flex  items-center w-[120%] justify-center gap-2 text-center cursor-pointer "
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Please login to view scores">
                    <small className="text-[8px] sm:text-xs">Login to fetch your score</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Score - Moved inside the flex container */}
          <div
            className="hidden md:flex py-4 box-content ml-auto rounded-xl w-[91.5px] h-[75px] sm:w-[122px] sm:h-[100px] 
            flex-shrink-0 bg-gradient-to-b from-blue-500 to-blue-600
            overflow-hidden text-white p-3 sm:pb-4 sm:p-4 flex flex-col items-center justify-end scale-90">
            {/* Gauge Component */}
            <div
              className="w-full pt-4 h-full border-3 border-[#6DE5E5] 
              flex items-center justify-center sm:scale-90">
              {isLoading ? (
                <div className="animate-pulse w-12 h-12 bg-blue-300 rounded-full"></div>
              ) : (
                <GaugeComponent score={displayMatchScore} />
              )}
            </div>

            {/* Text Below Gauge */}
            {isLoggedIn && canApply ? (
              <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">
                {displayMatchScore !== -1 ? strengthLabel : "Processing"}
              </p>
            ) : (
              <div
                className="flex items-end w-[120%] justify-end gap-2 text-center cursor-pointer "
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Please login to view scores">
                <small className="text-[8px] sm:text-xs">Login to fetch your score</small>
              </div>
            )}
          </div>
        </div>
        {/* Pass the matchPercentage to MatchMetrics */}
        <MatchMetrics
          displayMatchScore={displayMatchScore}
          miscScore={miscScoreValue}
          isLoggedIn={isLoggedIn}
        />

        <hr
          className="max-sm:w-[93%] max-md:w-[95%] w-full"
          style={{
            border: "0.50px #454545 solid",
          }}
        />

        {/* Location, Job Type, and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Location and Job Type */}
          <div className="flex flex-wrap gap-5 md:gap-4 text-xs md:text-[12px] text-[#313131]">
            <div className="flex gap-1 items-center">
              <MapPin size={16} className="md:w-3 md:h-3" />
              <span
                className="text-[12px] font-semibold cursor-pointer max-w-[100px] truncate "
                data-tooltip-id="my-tooltip"
                data-tooltip-content={
                  !jobData?.location?.fullLocation?.length ? "Not Disclosed" : titleCaseLocation
                }>
                {!jobData?.location?.fullLocation?.length ? "Not Disclosed" : titleCaseLocation}
              </span>
            </div>
            <div className="flex gap-1 items-center">
              <Clock size={16} className="md:w-3 md:h-3" />
              <span className="text-[12px] font-semibold">
                {jobData.typeofEmployment
                  ? jobData.typeofEmployment.includes("_")
                    ? jobData.typeofEmployment.replace(/_/g, " ")
                    : jobData.typeofEmployment
                  : "Not Disclosed"}
              </span>
            </div>
            <div className="flex gap-1 items-center">
              <Home size={16} className="md:w-3 md:h-3" />
              <span className="text-[12px] font-semibold">
                {jobData.workMode
                  ? jobData.workMode.includes("_")
                    ? jobData.workMode.replace(/_/g, " ")
                    : jobData.workMode
                  : "Not Disclosed"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {/* Button container with responsive layout */}
          <div className="flex items-center justify-end gap-2 w-full md:w-auto">
            {/* Refer A Friend button */}
            {!jobData.externalJobId && canApply && (
              <div
                className="w-full max-sm:px-0 max-sm:text-xs max-sm:min-w-[100px]  md:w-auto px-6 py-2 border border-[#0D0D0D] rounded-lg text-sm font-bold h-11 flex justify-center items-center text-center"
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Refer a friend, and earn ₹5000 when they get hired!">
                <button onClick={() => setShowModal(true)}>Refer A Friend</button>
              </div>
            )}

            {/* Apply button */}
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
              className={`w-full max-sm:px-0 max-sm:text-xs md:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600 text-white font-bold flex justify-center items-center px-4 mr-4 md:mr-0 py-2 rounded-lg transition-colors h-11 text-center`}
              onClick={onApply}
              disabled={
                applicationStatus ||
                jobData.status === "ARCHIVED" ||
                jobData.status === "CLOSED" ||
                !canApply ||
                (!isProfileCheckComplete && isLoggedIn && canApply)
              }>
              {isLoggedIn && canApply /* Check if the user is Logged in or not  */
                ? applicationStatus /* If the user user is Logged In then check if the user has already applied the job or not */
                  ? "Already Applied" /* Already Applied  */
                  : jobData.status === "ARCHIVED" ||
                    jobData.status === "CLOSED" ||
                    displayMatchScore <
                      1 /* If Not Applied then Check if the job is Archived or Closed or if the Score is not generated yet */
                  ? `${displayMatchScore < 1 ? "Apply Now" : jobData.status}`
                  : "Apply Now"
                : "Login to Apply"}{" "}
              {/* If not then Ask them */}
            </button>
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <CustomModal
          type="share"
          title="Refer a Friend and Earn Rewards!"
          onSubmit={() => {}} // We'll use handleSubmit from useForm
          onClose={() => setShowModal(false)}
          hideDefaultButtons={true}>
          <div className="text-center px-4">
            <p className="text-gray-600 text-sm mb-4">
              Enter the details of the candidate you believe is a great fit for the role. If your
              referral gets hired, you'll receive a monetary reward as a bonus!
            </p>
          </div>
          <form className="space-y-4 px-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="text"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                })}
                className="input_primary text-gray-500 w-full p-2 border rounded"
                placeholder="Full Name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                {...register("email", validationRules.email)}
                className="input_primary text-gray-500 w-full p-2 border rounded"
                placeholder="E-Mail ID"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
              )}
            </div>
            <div>
              {/* Phone input with country code dropdown */}
              <div className="flex items-center">
                {/* Country code dropdown */}
                <div className="relative country-dropdown-container">
                  <div
                    className="input_primary flex items-center gap-1 text-gray-500 p-2 border rounded cursor-pointer border-r-0"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                    <span>{phoneCountryCode}</span>
                    <ChevronDown size={14} />
                  </div>

                  {/* Dropdown list */}
                  {showCountryDropdown && (
                    <div className="absolute z-10 top-full left-0 mt-1 w-48 max-h-44 overflow-y-auto bg-white shadow-lg rounded border">
                      {countryCodes.map((item) => (
                        <div
                          key={item.code}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                          onClick={() => handleCountryCodeSelect(item.code)}>
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
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Please enter a valid 10-digit phone number",
                    },
                  })}
                  className="input_primary text-gray-500 flex-1 p-2 border rounded"
                  placeholder="Contact Number"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>
              )}
            </div>
            <div className="text-center mt-4">
              <button
                type="submit"
                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded w-full disabled:bg-blue-300"
                disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Referral"}
              </button>
            </div>
          </form>
          <p className="text-gray-400 text-xs text-center mt-4 px-4">
            Your information is secure and will only be used to process your referral and
            communicate about the program.
          </p>
        </CustomModal>
      )}
    </div>
  );
};

export default JobCard;
