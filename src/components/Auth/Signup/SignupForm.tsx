import { check } from "@Assets";
import OTPInput from "@Components/Shared/Otp";
import { validationRules } from "@Utils/FormValidator.utils";
import React, { useEffect, useRef, useState } from "react";
import { set, useForm } from "react-hook-form";
import TermsAndConditions from "./TermsAndConditions";
import { SignupMode } from "./Signup";
import CompanyInput from "@Components/Shared/CompanyInput";
import { Upload } from "lucide-react";
import { AuthFormDto, AuthSignupBaseDto } from "@Interfaces/Auth.dto";
import useLinkedInSignup from "@Hooks/useSignupLinkedIn.hook";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import CognitoServiceObj from "@Utils/Cognito.utils";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { useNavigate } from "react-router-dom";
import { CompanyShortDto } from "@Interfaces/JobsAndCompany.dto";
const MessageModal = React.lazy(() => import("@Components/Modals/MessageModal"));
import { useAppContext } from "@Context/App.context";

/**
 * @Interface LinkedInSignupForm
 * @property activeFrame - SignupMode - Active Frame for the Signup either CAND or EMP
 * @property runCognitoBasicSignup - Function - Function to run the Cognito Basic Signup
 * @property handleVerifyOtp - Function - Function to handle the OTP verification
 * @property setCompanyName - React.Dispatch<React.SetStateAction<string>> - Function to set the company name
 * @property fetchLinkedinSessionData - Function - Function to fetch the linkedin session data like name email and cognito ID
 */

export function validateCV(value: string) {
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
}

const SignupForm: React.FC<{
  activeFrame: SignupMode;
  runCognitoBasicSignup: (data: AuthFormDto) => Promise<boolean>;
  handleVerifyOtp: (email: string, otp: string, password: string) => Promise<any>;
  verifyOtp: (otp: string) => Promise<boolean>;
  onFileUpload: (file: File) => void;
  setCompanyName: React.Dispatch<React.SetStateAction<CompanyShortDto | undefined>>;
}> = ({ activeFrame, runCognitoBasicSignup, handleVerifyOtp, setCompanyName, onFileUpload }) => {
  const navTo = useNavigate();
  const signUpWithLinkedIn = useLinkedInSignup();
  const { tempCvFile } = useAppContext();
  const [otpError, setOtpError] = useState(false); // Use lowercase for setter
  const [ViewTerms, setViewTerms] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("- ".repeat(length).trim());
  const [cognitoBasicSignup, setCognitoBasicSignup] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendOtp, setResendOtp] = useState(false);
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
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      name: null,
      phone: "",
      whatsappActive: false,
      company: undefined,
      cv: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAndConditions: false,
    /*   ctc: 0,
      ectc: 0, */
    },
    mode: "onChange",
  });
  const [selectedCvName, setSelectedCvName] = useState<string>("");
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileUpload(file); // Pass file to parent
      setSelectedCvName(file.name);
    }
  };
  useEffect(() => {
    if (activeFrame === "CAND") {
      unregister("company");
      setValue("cv", "");
    } else {
      unregister("cv");
      setValue("company", undefined, { shouldValidate: true });
    }
    // Reset the OTP state when the active frame changes
    setIsOtpSent(false);
    //Reset the form state when the active frame changes
    reset(undefined, { keepValues: false });
  }, [activeFrame, setValue, unregister]);

  // Prefill selected CV name from context if present
  useEffect(() => {
    if (tempCvFile && activeFrame === "CAND") {
      setSelectedCvName(tempCvFile.name);
      // Bypass cv input validation when context file exists
      clearErrors("cv");
    }
  }, [tempCvFile, activeFrame, clearErrors]);

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
      const success = await runCognitoBasicSignup(data);
      if (success) {
        setIsOtpSent(true);
        setTimeout(() => {
          setResendOtp(true);
        }, 10000);
      } else {
        reset();
      }
    } catch (error) {
      console.error("Cognito Basic Signup failed");
      reset();
    } finally {
      setIsSigningUp(false);
    }
  };

  async function handleFinalVerification() {
    const otpValue = otp.replace(/\s+/g, ""); // Remove any spaces

    if (otpValue.length !== 6) {
      setOtpError(true);
      return;
    }

    const email = watch("email"); // Use watch or getValues to fetch email
    if (!email) {
      console.error("Email is missing!");
      return;
    }

    try {
      await handleVerifyOtp(email, otpValue, watch("password")); // Assuming `handleVerifyOtp` only needs
    } catch (error) {
      console.error("OTP verification failed", error);
    }
  }

  const handleResendOtp = async () => {
    try {
      await toast.promise(
        CognitoServiceObj.resendOtp({ username: watch("email") }), // Fixed function call
        {
          pending: "Sending OTP...",
          success: "OTP sent successfully!",
          error: "Failed to resend OTP",
        },
        getToastOptions()
      );
    } catch (error) {
      console.error("OTP resend failed", error);
    }
  };

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const handleEditEmail = () => {
    setIsEditingEmail(true);
    setOtp(""); // Clear OTP
    setIsOtpSent(false); // Allow requesting a new OTP
    setResendOtp(false); // Reset resend OTP state
  };
  const handleSaveEmail = () => {
    if (!watch("email")) {
      console.error("Email cannot be empty!");
      return;
    }
    setIsEditingEmail(false);
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
              disabled={isOtpSent}
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
              disabled={isOtpSent}
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
                disabled={isOtpSent}
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
              disabled={isOtpSent}
              type="email"
              className={`input_primary auth_input  ${errors.email && "error"}`}
              {...register("email", validationRules.personalEmail)}
            />
            {!isEditingEmail && isOtpSent && (
              <button
                type="button"
                onClick={handleEditEmail}
                className=" text-left  w-full text-xs text-blue-500">
                Edit Email
              </button>
            )}
            {isEditingEmail && (
              <button
                type="button"
                onClick={handleSaveEmail}
                className=" w-full text-xs text-left text-green-500">
                Save
              </button>
            )}

            {errors.email && (
              <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>
            )}
          </div>

          {/* COMPANY OR CV */}
          {activeFrame === "CAND" ? (
            <div className={`relative`}>
              <label
                className="hidden sm:block cursor-pointer font-medium"
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Upload <2MB pdf & password protected/scanned file is not supported.">
                Upload CV (
                <i className="fa-solid fa-circle-info animate-pulse cursor-pointer text-xs" />
                &nbsp; View file requirements)
              </label>
              <div className="relative">
                <input
                  disabled={isOtpSent}
                  type="file"
                  className="input_primary auth_input appearance-none cursor-pointer text-transparent"
                  {...register("cv", {
                    validate: (value: any) => (tempCvFile ? true : validateCV(value)),
                  })}
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                <div className="absolute inset-0 pointer-events-none flex items-center pl-3">
                  <span className="text-gray-500 truncate">
                    {selectedCvName || tempCvFile?.name
                      ? selectedCvName || tempCvFile?.name
                      : "Choose file"}
                  </span>
                </div>
              </div>
              <Upload
                onClick={() =>
                  (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()
                } // Trigger input click
                className="absolute right-4 top-3 sm:top-10 h-5 w-5 cursor-pointer active:scale-90 text-gray-400 z-1"
              />
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
                isOtpSent={isOtpSent}
              />
              {errors.company && (
                <p className="text-sm text-left text-red-500">
                  {errors.company.message?.toString()}
                </p>
              )}
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <label className="hidden sm:block font-medium">Password</label>
            <input
              placeholder="Enter Password"
              disabled={isOtpSent}
              type={showPassword ? "text" : "password"}
              className={`input_primary auth_input  ${errors.password && "error"}`}
              {...register("password", validationRules.password)}
            />
            <span
              className="absolute right-3 top-2 sm:top-9 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <i className="fa-regular fa-eye-slash mt-2"></i>
              ) : (
                <i className="fa-regular fa-eye mt-2"></i>
              )}
            </span>
            {errors.password && (
              <p className="text-sm text-left text-red-500">
                {errors.password.message?.toString()}
              </p>
            )}
          </div>
          {/* Confirm Password */}
          <div className="relative">
            <label className="hidden sm:block font-medium">Confirm Password</label>
            <input
              placeholder="Confirm Password "
              disabled={isOtpSent}
              type={showConfirmPassword ? "text" : "password"}
              className={`input_primary auth_input  ${errors.confirmPassword && "error"}`}
              {...register("confirmPassword", validationRules.confirmPassword(watch))}
            />
            <span
              className="absolute right-3 top-2 sm:top-9 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <i className="fa-regular fa-eye-slash mt-2"></i>
              ) : (
                <i className="fa-regular fa-eye mt-2"></i>
              )}
            </span>
            {errors.confirmPassword && (
              <p className="text-sm text-left text-red-500">
                {errors.confirmPassword.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {/* OTP */}
        <div
          className={`relative  w-min justify-self-center transition-opacity ease-in-out delay-150 duration-300 ${
            isOtpSent ? "h-auto opacity-100 " : " opacity-0 h-0 pointer-events-none"
          }`}>
          <label className="block font-medium text-center">OTP</label>
          <OTPInput
            length={6}
            onChange={(otp) => {
              setOtpError(false);
              setOtp(otp);
            }} // Clear error as the user types
          />
          {resendOtp && (
            <p
              className="text-sm text-blue-500 text-center cursor-pointer mt-1 active:scale-95	 "
              onClick={handleResendOtp}>
              Resend OTP
            </p>
          )}
          {otpError && <p className="text-sm text-red-500 text-center">Invalid OTP</p>}
        </div>

        {/* Terms and Conditions */}
        <div className="flex gap-2  mt-5 text-xs items-center justify-center  ">
          <input
            disabled={isOtpSent}
            type="checkbox"
            {...register("termsAndConditions", validationRules.termsAndConditions)}
            checked={watch("termsAndConditions")}
          />
          <p
            className="block md:w-auto text-sm sm:text-md text-left font-medium cursor-pointer"
            onClick={() => !isOtpSent && setViewTerms(true)}>
            I accept the <span className="text-blue-500 cursor-pointer">Terms and Conditions</span>
          </p>
        </div>
        {errors.termsAndConditions && (
          <div className="text-sm text-red-500 text-center">
            {errors.termsAndConditions.message?.toString()}
          </div>
        )}

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
          {isOtpSent ? (
            <button
              type="button"
              onClick={() => handleFinalVerification()}
              className=" btn_primary text-white px-4 py-2 border-none rounded-md w-[300px] disabled:!bg-gray-500 disabled:!cursor-not-allowed disabled:!pointer-events-all  ">
              {tempCvFile ? "Show Jobs" : "Confirm Verification"}
            </button>
          ) : (
            <button
              type="submit"
              onClick={() => trigger("company")}
              className=" btn_primary text-white px-4 py-2 border-none rounded-md w-[300px] disabled:!bg-gray-500 disabled:!cursor-not-allowed disabled:!pointer-events-all  ">
              {tempCvFile ? "Confirm details" : "Verify & Signup"}
            </button>
          )}
          {!tempCvFile && (
            <button
              className="border px-4 py-2.5 rounded-lg bg-[#333333] text-white text-xs  w-full max-w-[300px] sm:max-w-[300px] "
              type="button"
              onClick={() =>
                signUpWithLinkedIn(activeFrame === "CAND" ? "candidateSignUp" : "employeeSignUp")
              }>
              <i className="fa-brands fa-linkedin-in bg-[#0062ff] p-1 pb-0.5  rounded-sm   text-white mx-2 "></i>
              Or sign up with Linkedin
            </button>
          )}
        </div>

        {/* Already have an account? */}
        {!tempCvFile && (
          <p className="text-center sm:mt-4">
            Already have an account?{" "}
            <div
              onClick={() => navTo("/auth/login")}
              className="inline cursor-pointer text-blue-500">
              Sign In
            </div>
          </p>
        )}
      </form>
    </div>
  );
};

export default SignupForm;
