import { validationRules } from "@Utils/FormValidator.utils";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import TermsAndConditions from "./TermsAndConditions";
import CompanyInput from "@Components/Shared/CompanyInput";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import secureStorage from "@Utils/SecureStorage.utils";
import { useAppContext } from "@Context/App.context";
import { getToastOptions } from "@Utils/Toast.utils";
import ReferralLoader from "@Components/ReferralRequest/ReferralLoader";
import httpServiceObj from "@Services/ApiHandler.service";
import { CompanyShortDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";
import { useCrossAppAuth } from "@Hooks/useCrossAppAuth.hook";

const MessageModal = React.lazy(() => import("@Components/Modals/MessageModal"));

/**
 * @interface AuthSessionDto
 *
 * @description - AuthSessionDto is an interface that will define the structure of the AuthSessionDto.
 */
export interface AuthSessionDto {
  name: string;
  email: string;
  cognitoId: string;
}

/**
 * @type SignupMode
 * @description - SignupMode is an enum that will define the SignupMode for the linkedin signup form.
 */
type SignupMode = "EMP" | "CAND";

/**
 * @Interface LinkedInSignupForm
 * @property activeFrame - SignupMode - Active Frame for the Signup either CAND or EMP
 * @property setCompanyName - React.Dispatch<React.SetStateAction<string>> - Function to set the company name
 * @property fetchLinkedinSessionData - Function - Function to fetch the linkedin session data like name email and cognito ID
 */
interface LinkedInSignupForm {
  activeFrame: SignupMode;
  handleDataMutationtoDb: (data: any) => Promise<boolean>;
  setCompanyName: React.Dispatch<React.SetStateAction<CompanyShortDto | undefined>>;
  fetchLinkedinSessionData: () => Promise<AuthSessionDto>;
}

const LinkedInSignupForm: React.FC<LinkedInSignupForm> = ({
  activeFrame,
  handleDataMutationtoDb,
  setCompanyName,
  fetchLinkedinSessionData,
}) => {
  const appHref = useCrossAppAuth();
  const [ViewTerms, setViewTerms] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [currStep, setCurrStep] = useState<0 | 1 | 2 | 3 | 4>(0); // Current step of the loader
  const [OpenReferralLoader, setOpenReferralLoader] = useState<boolean>(false);
  const [modalData, setModalData] = useState<{
    type: "none" | "error" | "warning" | "success" | "info";
    heading?: { message: string; type: "error" | "warning" | "success" | "info" };
    message: string;
    buttons?: {
      label: string;
      action: () => void;
      type?: "primary" | "danger" | "warning" | "success";
    }[];
  } | null>(null);

  const navigate = useNavigate();
  const { PendingApply, setPendingApply } = useAppContext();
  // An effect that will run on component mount it will check for the values like name email phone cognito ID that got stored while redirection of the linkedin.
  useEffect(() => {
    const fetchSessionData = async () => {
      const sessionData: AuthSessionDto = await fetchLinkedinSessionData();
      if (sessionData) {
        setValue("name", sessionData.name);
        setValue("email", sessionData.email);
      }
    };
    fetchSessionData();
  }, []);

  /**
   * React Hook forms for managing the linkedin Signup
   */
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    clearErrors,
    setError,
    unregister,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      whatsappActive: false,
      company: undefined,
      cv: "",
      email: "",
      companyEmailId: "",
      department: "",
      termsAndConditions: false /*  ctc: 0, ectc: 0 */,
    },
    mode: "all",
  });

  /**
   * UseEffect that will take place whenever the signup mode is switched between the CAND AND EMP
   * it will reset the form and unregister any file upload.
   */
  useEffect(() => {
    if (activeFrame === "CAND") {
      unregister("company");
      setValue("cv", "");
    } else {
      unregister("cv");
      setValue("company", undefined, { shouldValidate: true });
    }
    //Reset the form state when the active frame changes
    reset(undefined, { keepValues: false });
  }, [activeFrame, setValue, unregister]);
  /**
   * checkBasicDetails
   *
   * @description This function is used to check if the user has completed the basic details or not
   */
  const checkBasicDetails = async (retryCount = 0): Promise<boolean> => {
    const maxRetries = 3;

    try {
      if (activeFrame === "EMP") return true;

      if (retryCount === 0) setOpenReferralLoader(true);

      const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(
        `${import.meta.env.APP_API_URI}/user/basic-details`,
        true,
        {},
        true
      );

      if (error) throw error;

      const designation = response?.candidateExperience?.designation;
      const coreSkills = response?.coreSkills?.map((skill) => skill.skillName);

      if (response?.cvExtractParsed && (designation || coreSkills?.length || response?.YOE)) {
        setOpenReferralLoader(false);
        return true;
      } else {
        if (retryCount < maxRetries) {
          setCurrStep((prev) => (prev < 4 ? ((prev + 1) as 0 | 1 | 2 | 3 | 4) : prev));
          await new Promise((resolve) => setTimeout(resolve, 8000)); // Wait before retrying
          return checkBasicDetails(retryCount + 1); // Recursive retry
        } else {
          setOpenReferralLoader(false);
          toast.warning(
            "Could not retrieve user details after multiple attempts",
            getToastOptions()
          );
          return false;
        }
      }
    } catch (error) {
      console.error("Error fetching user basic details:", error);
      const params = import.meta.env.APP_WORKO_BASE_URL + "/jobs";
      setModalData({
        type: "error",
        heading: { message: "Something Went Wrong", type: "error" },
        message:
          "We encountered some issue while analysing your CV. Please enter a few details manually in your profile.",
        buttons: [
          {
            label: "Go To Dashboard",
            action: () =>
              appHref(`/${import.meta.env.APP_PROXY_DASH}/candidate/profile?returnUrl=${params}`),
          },
        ],
      });
      return false;
    }
  };

  /**
   * onSubmit
   *
   * @description - onSubmit function is used to submit the form data and trigger the cognito basic signup.
   *
   * @param data
   * @returns
   */
  const onSubmit = async (data: any) => {
    if (isSigningUp) return; // Prevent multiple submissions
    setIsSigningUp(true);

    const isPhoneValid = await trigger("phone");
    if (!isPhoneValid) return setIsSigningUp(false);

    if (activeFrame === "EMP") {
      const companyValue = watch("company") as string | undefined;
      if (!companyValue || companyValue.trim().length === 0) {
        setError("company", {
          type: "manual",
          message: "Please select a company from the dropdown",
        });
        // setOtpError(true);
        setIsSigningUp(false);
        return;
      }
    }
    // Trigger Cognito Basic Signup
    try {
      const success = await handleDataMutationtoDb(data);
      if (success) {
        toast.success("Account created successfully", getToastOptions());
        // await checkBasicDetails();
        // Redirect to referral page if pending referral found or pending Apply job found
        let pendingReferral =
          PendingApply ||
          secureStorage.getItem<continueReferralRequestDataDto>(
            SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS
          );

        // Sync PendingApply and SecureStorage
        if (PendingApply) {
          secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
          window.location.href = PendingApply.url; // Redirect to referral page
        } else if (pendingReferral) {
          setPendingApply(pendingReferral);
          window.location.href = pendingReferral.url; // Redirect if referral found in storage
        } else {
          //  window.location.href = "/post-signup-form";
          if (activeFrame === "EMP") {
            appHref(`/${import.meta.env.APP_PROXY_DASH}/employee/profile`);
          } else {
            window.location.href = "/post-signup-form";
          }
        }
      }
    } catch (error) {
      console.error("Cognito Basic Signup failed");
    } finally {
      setIsSigningUp(false);
    }
  };

  /**
   * validateCv
   *
   * @description - Validate Cv function is used for validation cv by checking the correct format and file size that is uploaded by user .
   *
   * @returns boolean
   */
  const validateCV = () => {
    // Validate CV file
    const fileList = (document.querySelector('input[name="cv"]') as HTMLInputElement)?.files;
    if (!fileList || fileList.length === 0) return "CV file is required";

    const file = fileList[0];
    const validTypes = ["application/pdf"];

    if (!validTypes.includes(file.type)) {
      return "Only PDF files are allowed";
    }
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      return "File size must be less than 2MB";
    }
    return true;
  };

  return (
    <div className="mx-auto  bg-white flex justify-center items-center w-[100%] ">
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-full ">
        <div
          className={
            "mainForm  min-w-full grid grid-rows-[min-content] sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))]  md:gap-x-14 w-full px-2 sm:px-3  rounded-2xl mx-auto sm:py-2 min-h-[150px] items-baseline max-sm:gap-4 md:[grid-auto-rows:min-content] "
          }>
          {/* Name */}
          <div>
            <label className="hidden sm:block font-medium">Name</label>
            <input
              placeholder="Enter Name"
              type="text"
              className={`input_primary auth_input  ${errors.name && "error"}`}
              {...register("name", validationRules.name)}
            />
            {errors.name && (
              <p className="text-sm text-left text-red-500">{errors.name.message?.toString()}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="relative ">
            <label className=" hidden sm:block font-medium">Phone</label>
            <span className="z-20 absolute left-3 top-[11px] sm:top-[40.5px] text-[1rem] text-[#416f99] font-semibold">
              +91
            </span>
            <input
              type="text"
              placeholder="Enter Phone Number"
              maxLength={10}
              className={`appearance-none input_primary auth_input  ${
                errors.phone && "error"
              } pl-10`}
              {...register("phone", validationRules.phone)}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, ""); // Non-numeric remove
                if (value.length > 10) value = value.slice(0, 10); // Max 10 digits
                setValue("phone", value, { shouldValidate: true });
              }}
            />
            {errors.phone && (
              <p className="text-sm text-left text-red-500">{errors.phone.message?.toString()}</p>
            )}

            <label className="flex items-center justify-start text-xs gap-2 mt-2">
              <input
                type="checkbox"
                className=" text-[7px] bg-white "
                {...register("whatsappActive")}
              />
              This number has active{" "}
              <i className="fa-brands text-xs text-[#00fa53] fa-whatsapp"></i> WhatsApp
            </label>
          </div>
          {/* Email */}
          <div className="relative">
            <label className="hidden sm:block font-medium">Email</label>
            <input
              placeholder="Enter Email"
              disabled
              type="email"
              className={`input_primary auth_input  ${errors.email && "error"}`}
              {...register("email", validationRules.personalEmail)}
            />
            {errors.email && (
              <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>
            )}
          </div>

          {/* COMPANY OR CV */}
          {activeFrame === "CAND" ? (
            <div className="relative ">
              <label
                className="hidden sm:block font-medium"
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Upload <2MB pdf & password protected/scanned file is not supported.">
                Upload CV (
                <i className="fa-solid fa-circle-info animate-pulse cursor-pointer text-xs"></i>
                &nbsp; View file requirements)
              </label>
              <input
                type="file"
                className="input_primary auth_input  appearance-none cursor-pointer  "
                {...register("cv", { validate: validateCV })}
                accept=".pdf"
              />
              <Upload className="absolute right-4 top-3 sm:top-10 h-5 w-5 cursor-pointer active:scale-90 text-gray-400 z-1" />
              <p className="sm:hidden text-left text-xs text-gray-500">
                Note: Click{" "}
                <u
                  className="text-blue-500 cursor-pointer"
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Upload <2MB pdf & password protected/scanned file is not supported.">
                  Here
                </u>{" "}
                Before Uploading Any File
              </p>
              {errors.cv && <p className="text-sm text-left text-red-500">{errors.cv.message}</p>}
            </div>
          ) : (
            <div>
              {/* Company Name */}
              <label className="hidden sm:block font-medium">Company Name</label>
              <CompanyInput
                errors={errors}
                setValue={setValue}
                clearErrors={clearErrors}
                setCompanyName={setCompanyName}
              />
              {errors.company && (
                <p className="text-sm text-left text-red-500">
                  {errors.company.message?.toString()}
                </p>
              )}
            </div>
          )}

          {/* CorporateEmail  */}
          {activeFrame === "EMP" && (
            <div className="relative">
              <label className="hidden sm:block font-medium">Work Email</label>
              <input
                placeholder="Enter Work Email"
                type="email"
                className={`input_primary auth_input  ${errors.companyEmailId && "error"}`}
                {...register("companyEmailId", validationRules.corporateEmail)}
              />
              {errors.companyEmailId && (
                <p className="text-sm text-left text-red-500">
                  {errors.companyEmailId.message?.toString()}
                </p>
              )}
            </div>
          )}
          {/* department */}
          {activeFrame === "EMP" && (
            <div className="relative">
              <label className="hidden sm:block font-medium">Department</label>
              <input
                placeholder="Enter Department"
                type="text"
                className={`input_primary auth_input  ${errors.department && "error"}`}
                {...register("department", validationRules.department)}
              />
              {errors.department && (
                <p className="text-sm text-left text-red-500">
                  {errors.department.message?.toString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex gap-2  mt-5 text-xs items-center justify-center">
          <input
            type="checkbox"
            {...register("termsAndConditions", validationRules.termsAndConditions)}
            checked={watch("termsAndConditions")}
          />
          <p
            className="block md:w-auto text-sm sm:text-md text-left font-medium cursor-pointer"
            onClick={() => setViewTerms(true)}>
            I accept the <span className="text-blue-500 cursor-pointer">Terms and Conditions</span>
          </p>
        </div>

        {ViewTerms && (
          <MessageModal
            type="none"
            size="2xl"
            heading={{ type: "info", message: "Terms and Conditions" }}
            message={TermsAndConditions}
            onClose={() => {
              setViewTerms(false);
            }}
            showCloseButton={false}
            buttons={[
              {
                label: "Accept",
                action: () => {
                  setViewTerms(false);
                  setValue("termsAndConditions", true, { shouldValidate: true });
                },
                type: "primary",
              },
              {
                label: "Decline",
                action: () => {
                  setViewTerms(false);
                  setValue("termsAndConditions", false, { shouldValidate: true });
                },
                type: "danger",
              },
            ]}
          />
        )}

        {/* Buttons */}
        <div className="flex flex-wrap justify-center items-center gap-2  my-5 ">
          <button
            type="submit"
            className=" btn_primary text-white px-4 py-2 border-none rounded-md w-[300px] disabled:!bg-gray-500 disabled:!cursor-not-allowed disabled:!pointer-events-all  ">
            Create Account
          </button>
        </div>
      </form>
      {/* Show modal only when modalData is set */}
      {modalData && (
        <MessageModal
          {...modalData}
          onClose={() => {
            setModalData(null);
          }}
          showCloseButton={false}
        />
      )}
      {OpenReferralLoader && <ReferralLoader step={currStep} />}
    </div>
  );
};

export default LinkedInSignupForm;
