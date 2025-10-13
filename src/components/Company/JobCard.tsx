import { useState, useMemo, useEffect } from "react";
import { MapPin, Clock, ChevronDown, Home } from "lucide-react";
import { useForm } from "react-hook-form";
import GaugeComponent from "./Gauge";
import CustomModal from "@Components/Modals/FormModal";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { useAppContext } from "@Context/App.context";
import { toast } from "react-toastify";
import { DaysFormatter } from "@Utils/DaysFormatter.utils";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto } from "@Interfaces/JobsAndCompany.dto";
import countryCodes from "@Utils/CountryCodes.utils";
import { getToastOptions } from "@Utils/Toast.utils";
import { validationRules } from "@Utils/FormValidator.utils";
import { ApiCallResponse } from "@Interfaces/HttpOption.dto";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { generateJobSlug } from "@Utils/JobUriSlug.utils";
import { get } from "http";
import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import { RBAC } from "@Utils/RoleBaseAccessControll.utils";

// Define interface for referral form data
interface ReferralFormDTO {
  phoneNumber: number;
  name: string;
  fullName: string;
  email: string;
  phone: number;
  phoneCountryCode: string;
}
export interface ReferrFriendDto {
  recipientDetails: {
    name: string;
    email: string;
    phoneNumber: number;
    phoneCountryCode: number;
  };
  companyDetails: {
    id: any;
    name: any;
  };
  jobDetails: {
    id: any;
    title: any;
    url: any;
  };
}
export const JobCard = ({ job }: any) => {
  const { isLogoAvailable, companyLogo, title, department, salary, location, employmentType, createdAt, matchPercentage, jobId, companyName, isExternalJob, badJob, FullJob, companyId, jobUrl, showSalary, experience, workmode } = job;
  const { isLoggedIn, PendingApply, setPendingApply } = useAppContext<ReferrFriendDto>();
  const [showModal, setShowModal] = useState(false);
  const [strengthLabel, setStrengthLabel] = useState<string>("Strong Match");
  const [imgError, setImgError] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const canApply = RBAC.can("apply_jobs");
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
  } = useForm<ReferralFormDTO>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: undefined,
      phoneCountryCode: "+91",
    },
  });

  const phoneCountryCode = watch("phoneCountryCode");

  const handleCountryCodeSelect = (code: string) => {
    setValue("phoneCountryCode", code);
    setShowCountryDropdown(false);
  };

  // Function to create payload from form data
  const createPayload = (formData: ReferralFormDTO) => {
    return {
      recipientDetails: {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: Number(formData.phone),
        phoneCountryCode: Number(formData.phoneCountryCode.slice(1)),
      },
      companyDetails: {
        id: companyId,
        name: companyName,
      },
      jobDetails: {
        id: jobId,
        title: title,
        url: jobUrl,
      },
    };
  };

  useEffect(() => {
    if (isLoggedIn) {
      const pendingData = PendingApply || secureStorage.getItem<continueReferralRequestDataDto<ReferrFriendDto>>(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS);

      if (pendingData !== null && typeof pendingData === "object" && "data" in pendingData) {
        try {
          const recipientDetails = pendingData?.data?.recipientDetails;

          if (recipientDetails) {
            setValue("fullName", recipientDetails.name || "");
            setValue("email", recipientDetails.email || "");
            setValue("phone", recipientDetails.phoneNumber || 0);
            setValue("phoneCountryCode", `+${recipientDetails.phoneCountryCode}` || "+91");

            handleSubmit(onSubmit)();
          } else {
            console.warn("recipientDetails was null or undefined");
          }
        } catch (error) {
          console.error("Error processing pending referral data:", error);
        } finally {
          // Reset the pending apply state after processing
          setPendingApply(null);
          localStorage.removeItem("continueReferAndEarnRequestData");
          secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, null);
        }
      }
    }
  }, [isLoggedIn, locationHook.pathname]);

  const onSubmit = async (formData: ReferralFormDTO) => {
    const payload: ReferrFriendDto = createPayload(formData);

    if (!isLoggedIn) {
      // Store data for after login
      const continueReferAndEarnRequestData = {
        type: "continueReferAndEarn",
        data: payload,
        url: window.location.href,
      };
      // Store in both secure storage and localStorage
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, continueReferAndEarnRequestData);
      setPendingApply(continueReferAndEarnRequestData);
      localStorage.setItem("continueReferAndEarnRequestData", JSON.stringify(continueReferAndEarnRequestData));

      // Navigate to login
      nav("/auth/login");
      return;
    }

    try {
      const result = (await toast.promise(
        httpServiceObj.post(`${import.meta.env.APP_JOBS_API_URI}/refer-and-earn`, payload, true, {}, true),
        {
          pending: "Sharing job...",
        },
        getToastOptions()
      )) as ApiCallResponse;

      const { response, error, status } = result;

      if (status === 409) {
        toast.error(error.message, getToastOptions());
        return;
      }

      if (error) {
        console.error("Error details:", error);
        throw new Error(error.message || "Failed to submit referral");
      }

      toast.success("You just opened a new door for your friend  Fingers crossed for their success (and your reward!)", getToastOptions());
    } catch (error: any) {
      console.error("Error submitting referral:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit referral", getToastOptions());
    } finally {
      reset();
      setShowModal(false);
    }
  };

  // Rest of the component remains the same...

  // Just showing the relevant parts for brevity
  // Return JSX remains the same

  const isEarlyApplicant = useMemo(() => {
    const createdDate = new Date(createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate >= threeDaysAgo;
  }, [createdAt]);

  const timeAgo = useMemo(() => DaysFormatter(createdAt), [createdAt]);

  const handleReferralNav = () => {
    const slug = generateJobSlug({
      title: title,
      company: companyName ?? "comp",
      location: location,
      experience: experience,
      jobId: jobId,
    });

    nav(slug, {
      state: { FullJob: FullJob as JobDto },
    });
  };

  useEffect(() => {
    // Update the strength label based on the match score
    if (matchPercentage < 40) {
      setStrengthLabel("Poor Match");
    } else if (matchPercentage < 60) {
      setStrengthLabel("Moderate Match");
    } else if (matchPercentage < 80) {
      setStrengthLabel("Good Match");
    } else {
      setStrengthLabel("Strong Match");
    }
  }, [matchPercentage]);

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

  const getJobUrl = () => {
    return generateJobSlug({
      title: title,
      company: companyName ?? "comp",
      location: location,
      experience: experience,
      jobId: jobId,
    });
  };
  return (
    <div className="w-full bg-white rounded-[20px] md:rounded-[15px] border border-black/5 shadow-[0px_4px_16px_rgba(0,0,0,0.05)] md:shadow-[0px_3px_12px_rgba(0,0,0,0.05)] p-6 md:p-4">
      <div className="flex flex-col gap-4">
        {/* Header Section - Changed to flex-col on mobile */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          {/* Left section with image, title, and tags - Full width on mobile */}
          <div className="flex flex-col w-full md:max-w-[70%] gap-2">
            {/* Top row with image, title, department, and salary */}
            <div className="flex w-full gap-4">
              {/* Image column */}
              <div data-tooltip-id="my-tooltip" data-tooltip-content={companyName} className=" relative cursor-pointer flex-shrink-0 w-[70px] h-[70px]  rounded-[6.75px] sm:rounded-[9px] flex items-center justify-center border overflow-hidden">
                {isLogoAvailable && !imgError ? <img src={companyLogo} onError={() => setImgError(true)} alt={title} className="w-[60px] object-contain border h-[60px] sm:w-20 sm:h-20 rounded-[6.75px] sm:rounded-[9px]" /> : <div className="w-full text-wrap truncate text-[60%] font-extrabold text-sky-400 ">{companyName}</div>}
              </div>

              {/* Content column */}
              <div className="flex flex-col flex-1 min-w-0">
                <a href={getJobUrl()} rel="noopener noreferrer" className="block">
                  <h2 className="text-xl text-left sm:text-2xl md:text-lg font-semibold text-[#0D0D0D] mb-1 truncate capitalize sm:overflow-visible sm:text-ellipsis sm:whitespace-normal">{title}</h2>
                </a>
                <p className="text-xs text-left md:text-[9px] text-[#313131] mb-1 capitalize ">{department}</p>

                {/* Salary */}
                <div className="text-left text-sm md:text-xs font-semibold text-[#0D0D0D]">{showSalary ? `₹${salary}` : "Not Disclosed"}</div>
              </div>
            </div>

            {/* Mobile layout: Arrange tags and gauge on same row */}
            <div className="flex flex-row justify-between mt-2 md:mt-1">
              {/* Tags - Flex-wrap on mobile */}
              <div className="flex flex-wrap gap-1 overflow-hidden">
                <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">{timeAgo}</span>
                {isEarlyApplicant && <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">Be an early applicant</span>}
                {!isExternalJob && <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">Posted Job by Worko</span>}
                {badJob && <span className="px-3 py-1 max-h-[25px] bg-red-400 rounded-full text-xs md:text-[10.5px]  whitespace-nowrap animate-pulse text-white ">Removing irrelevant job...</span>}
              </div>

              {/* Gauge on mobile only */}
              <div
                className=" md:hidden flex flex-col items-center justify-center flex-shrink-0 
    rounded-xl w-[90px] h-[90px] sm:w-[122px] sm:h-[120px] 
    bg-gradient-to-b from-[#316BFF] to-[#316BFF] 
    overflow-hidden text-white p-3 sm:p-5">
                {/* Gauge Wrapper */}
                <div
                  className="w-[75%] h-[75%] sm:w-[85%] sm:h-[85%] 
      flex items-center justify-center  ">
                  <GaugeComponent score={canApply ? matchPercentage : 0} />
                </div>

                {/* Text Below Gauge */}
                {(isLoggedIn &&  canApply) ? (
                  <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">{matchPercentage !== -1 ? strengthLabel : "Processing"}</p>
                ) : (
                  <div className="flex  items-center  w-full gap-1 mt-1 text-center">
                    <small className="text-[8px] sm:text-xs" data-tooltip-id="my-tooltip" data-tooltip-content="Please login to view scores">
                      Login to fetch your score
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
              overflow-hidden text-white p-3 sm:p-5  flex-col items-center justify-center scale-90">
            {/* Gauge Component */}
            <div
              className="w-full pt-2  h-full  border-3 border-[#6DE5E5] 
            flex items-center justify-center sm:scale-90">
              <GaugeComponent score={canApply ? matchPercentage : 0} />
            </div>

            {/* Text Below Gauge */}
            {(isLoggedIn && canApply) ? (
              <p className="text-[10px] sm:text-sm font-bold whitespace-nowrap">{matchPercentage !== -1 ? strengthLabel : "Processing"}</p>
            ) : (
              <>
                <small data-tooltip-id="my-tooltip" data-tooltip-content="Please login to view scores">
                  {" "}
                  Login to fetch your score
                </small>
              </>
            )}
          </div>
        </div>

        {/* Location, Job Type, and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Location and Job Type */}
          <div className="flex flex-wrap gap-6 md:gap-4 text-xs md:text-[12px] text-[#313131]">
            <div className="flex items-center gap-1">
              <MapPin size={16} className="md:w-3 md:h-3" />
              <span className="capitalize max-w-[100px] truncate cursor-pointer" data-tooltip-id="my-tooltip" data-tooltip-content={location} title={location}>
                {location}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="md:w-3 md:h-3" />
              <span>{employmentType ? (employmentType.includes("_") ? employmentType.replace(/_/g, " ") : employmentType) : ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <Home size={16} className="md:w-3 md:h-3" />
              <span>{workmode ? (workmode.includes("_") ? workmode.replace(/_/g, " ") : workmode) : ""}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:justify-end">
            {(!isExternalJob && canApply) && (
              <div className="flex-1 max-sm:text-xs max-sm:min-w-[100px] max-sm:px-0 md:flex-initial md:w-[140px] px-6 py-2 border border-[#0D0D0D] rounded-lg text-sm md:text-xs font-bold h-auto sm:h-9" data-tooltip-id="my-tooltip" data-tooltip-content="Refer a friend, and earn ₹5000 when they get hired!">
                <button onClick={() => setShowModal(true)}>Refer A Friend</button>
              </div>
            )}
            <button disabled={badJob} onClick={() => handleReferralNav()} className="flex-1 max-sm:text-xs max-sm:min-w-[100px] max-sm:px-0 sm:mr-2 md:flex-initial md:w-[140px] px-6 py-2 bg-[#4B7EFF] text-white rounded-lg text-sm md:text-xs font-bold h-auto sm:h-9 disabled:cursor-not-allowed disabled:opacity-50">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Modal with useForm integration */}
      {showModal && (
        <CustomModal
          type="share"
          title="Refer a Friend and Earn Rewards!"
          onSubmit={() => {}} // Will use handleSubmit from useForm instead
          onClose={() => setShowModal(false)}
          hideDefaultButtons={true}>
          <div className="text-center px-4">
            <p className="text-gray-600 text-sm mb-4">Enter the details of the candidate you believe is a great fit for the role. If your referral gets hired, you'll receive a monetary reward as a bonus!</p>
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
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <input type="email" {...register("email", validationRules.email)} className="input_primary text-gray-500 w-full p-2 border rounded" placeholder="E-Mail ID" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
            </div>
            <div>
              {/* Phone input with country code dropdown */}
              <div className="flex items-center">
                {/* Country code dropdown */}
                <div className="relative country-dropdown-container">
                  <div className="input_primary flex items-center gap-1 text-gray-500 p-2 border rounded cursor-pointer border-r-0" onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                    <span>{phoneCountryCode}</span>
                    <ChevronDown size={14} />
                  </div>

                  {/* Dropdown list */}
                  {showCountryDropdown && (
                    <div className="absolute z-10 top-full left-0 mt-1 w-48 max-h-44 overflow-y-auto bg-white shadow-lg rounded border">
                      {countryCodes.map((item) => (
                        <div key={item.code} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2" onClick={() => handleCountryCodeSelect(item.code)}>
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
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>}
            </div>
            <div className="text-center mt-4">
              <button type="submit" className="bg-blue-500 text-white font-semibold py-2 px-6 rounded w-full disabled:bg-blue-300" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Referral"}
              </button>
            </div>
          </form>
          <p className="text-gray-400 text-xs text-center mt-4 px-4">Your information is secure and will only be used to process your referral and communicate about the program.</p>
        </CustomModal>
      )}
    </div>
  );
};

export default JobCard;
