import httpServiceObj from "@Services/ApiHandler.service";
import { validationRules } from "@Utils/FormValidator.utils";
import { getToastOptions } from "@Utils/Toast.utils";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ChevronDown } from "lucide-react";
import countryCodes from "@Utils/CountryCodes.utils";

export enum UserCorporatePaymentPlanEnum {
  JOB_BOARD = "JOB_BOARD",
  HIRING_PARTNER = "HIRING_PARTNER",
  CO_PILOT = "CO_PILOT",
}

// Map UI-friendly names to enum values
const PLAN_NAME_MAP: Record<string, UserCorporatePaymentPlanEnum> = {
  "Job Board": UserCorporatePaymentPlanEnum.JOB_BOARD,
  "Hiring Partner": UserCorporatePaymentPlanEnum.HIRING_PARTNER,
  "Co-Pilot": UserCorporatePaymentPlanEnum.CO_PILOT,
};

const planOptions = [
  { value: UserCorporatePaymentPlanEnum.JOB_BOARD, label: "Job Board" },
  { value: UserCorporatePaymentPlanEnum.HIRING_PARTNER, label: "Full Recruitment" },
  { value: UserCorporatePaymentPlanEnum.CO_PILOT, label: "Hiring Co-Pilot" },
];

const CorporateConnectForm = ({
  handleFormSubmit,
  selectedPlan = "",
}: {
  handleFormSubmit: (data: any) => Promise<void>;
  selectedPlan?: string;
}) => {
  // States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setVerifying] = useState(false);
  const [resendOtpVisible, setResendOtpVisible] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const {
    register,
    watch,
    trigger,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
      name: "",
      phone: "",
      countryCode: "+91", // Default country code
      email: "",
      company: "",
      designation: "",
      message: "",
      pricingPlan: "",
    },
    mode: "onChange",
    criteriaMode: "all",
  });

  // Set the selected plan when component mounts or selectedPlan changes
  useEffect(() => {
    // Parse URL parameters if available
    const searchParams = new URLSearchParams(window.location.search);
    const planFromUrl = searchParams.get("plan");

    // Choose plan from URL or prop
    const planToUse = planFromUrl || selectedPlan;

    if (planToUse && PLAN_NAME_MAP[planToUse]) {
      // Directly map the plan name to the enum value
      setValue("pricingPlan", PLAN_NAME_MAP[planToUse]);
    }
  }, [selectedPlan, setValue]);

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

  // Handle country code selection
  const handleCountryCodeSelect = (code: string) => {
    setValue("countryCode", code);
    setShowCountryDropdown(false);
  };

  // Send OTP / Verify OTP function
  const handleEmailVerification = async (isOtpVerification: boolean, e: any) => {
    e.preventDefault();
    if (!watch("email")) return;

    const constructedUrl = isOtpVerification
      ? `/corporate/${watch("email")}/verify-otp`
      : `/corporate/${watch("email")}/request-otp`;

    const payload = isOtpVerification ? { otp: watch("otp") } : { fullName: watch("name") };

    setVerifying(true); // Disable button while verifying
    const { response: dbResponse, error: dbError } = await httpServiceObj.post<any>(
      constructedUrl,
      payload,
      true
    );
    setVerifying(false);

    if (dbError) {
      toast.error("Something went wrong. Please try again later.", getToastOptions());
      // If OTP verification failed, reset the OTP field
      if (isOtpVerification) {
        setIsOtpSent(false);
      }
    } else {
      // If OTP verification successful, set email verified
      if (isOtpVerification && dbResponse?.verificationStatus === true) {
        setEmailVerified(true);
        toast.success("Email Verified Successfully", getToastOptions());
      } else if (dbResponse?.verificationStatus === false) {
        toast.error("Please enter correct OTP");
      } else {
        setIsOtpSent(true);
        toast.success("OTP Sent to your Email", getToastOptions());
        setTimeout(() => setResendOtpVisible(true), 10000); // Show resend option after 10 sec
      }
    }
  };

  // Combine country code and phone number when submitting
  const onSubmit = async (data: any) => {
    // Format the phone number with country code
    const formattedData = {
      ...data,
      phone: `${data.countryCode}${data.phone}`,
    };

    await handleFormSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <p className="font-bold text-lg text-left">Let's Connect</p>
      <div className="mainForm grid gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[150px]">
        {/* Row 1: Name, Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Name */}
          <div>
            <label className="block font-medium">Name</label>
            <input
              placeholder="Full Name"
              type="text"
              className={`input_primary auth_input ${errors.name && "error"}`}
              {...register("name", validationRules.name)}
            />
            {errors.name && (
              <p className="text-sm text-left text-red-500">{errors.name.message?.toString()}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label className="block font-medium">Company</label>
            <input
              placeholder="Company name"
              type="text"
              className={`input_primary auth_input ${errors.company && "error"}`}
              {...register("company", validationRules.companyName)}
            />
            {errors.company && (
              <p className="text-sm text-left text-red-500">{errors.company.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Row 2: Plan, Phone, Designation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {/* Plan Name - Changed to dropdown */}
          <div>
            <label className="block font-medium">Subscription Type</label>
            <select
              className="input_primary font-light text-gray-400 auth_input"
              {...register("pricingPlan", {
                required: "Plan selection is required",
              })}>
              <option value="" disabled>
                Select a subscription
              </option>
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.pricingPlan && (
              <p className="text-sm text-left text-red-500">
                {errors.pricingPlan.message?.toString()}
              </p>
            )}
          </div>

          {/* Phone with Country Code */}
          <div>
            <label className="block font-medium">Contact No</label>
            <div className="flex">
              {/* Country Code Dropdown */}
              <div className="relative country-dropdown-container">
                <div
                  className="input_primary auth_input !rounded-r-none !w-[80px] cursor-pointer flex items-center justify-between"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                  <span>{watch("countryCode")}</span>
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

              {/* Phone Number Input */}
              <input
                placeholder="Contact number"
                type="text"
                className="input_primary auth_input !rounded-l-none flex-1"
                {...register("phone", validationRules.phone)}
              />
            </div>
            <p className="text-sm text-left text-red-500">{errors.phone?.message}</p>
          </div>

          {/* Designation */}
          <div>
            <label className="block font-medium">Designation</label>
            <input
              placeholder="Designation"
              type="text"
              className={`input_primary auth_input ${errors.designation && "error"}`}
              {...register("designation", validationRules.designation)}
            />
            {errors.designation && (
              <p className="text-sm text-left text-red-500">
                {errors.designation.message?.toString()}
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Email, OTP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Email */}
          <div className="relative">
            <label className="block font-medium">Email</label>
            <div className="flex gap-2">
              <input
                readOnly={isEmailVerified || isOtpSent}
                placeholder="Corporate email id"
                type="email"
                className="input_primary auth_input"
                {...register("email", validationRules.corporateEmail)}
              />
              {!errors.email && watch("email") && (
                <div className="flex">
                  {isOtpSent ? (
                    <button
                      className="btn_secondary text-xs px-0 text-center"
                      onClick={() => {
                        setIsOtpSent(false);
                        setEmailVerified(false);
                        setResendOtpVisible(false);
                        setValue("otp", "");
                      }}>
                      Change Email
                    </button>
                  ) : (
                    <button
                      className="btn_primary py-1 px-3 text-xs active:scale-50"
                      disabled={isOtpSent || isVerifying}
                      onClick={(e) => handleEmailVerification(false, e)}>
                      {isVerifying ? "Sending..." : isEmailVerified ? "✅ Verified" : "Verify"}
                    </button>
                  )}
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>
            )}
          </div>

          {/* OTP */}
          {isOtpSent && (
            <div className="relative">
              <label className="block font-medium">OTP</label>
              <input
                placeholder="OTP"
                readOnly={isEmailVerified}
                type="text"
                className={`input_primary auth_input ${errors.otp && "error"}`}
                {...register("otp", validationRules.otp)}
              />
              {errors.otp && (
                <p className="text-sm text-left text-red-500">{errors.otp.message?.toString()}</p>
              )}
              <button
                className="absolute btn_primary top-[33px] right-0 scale-75 disabled:!cursor-not-allowed active:scale-50"
                disabled={isEmailVerified || isVerifying}
                onClick={(e) => handleEmailVerification(true, e)}>
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </button>

              {resendOtpVisible && (
                <p className="text-sm text-left mt-1">
                  Didn't get the OTP?{" "}
                  <button
                    className="text-blue-500 underline cursor-pointer disabled:!cursor-not-allowed"
                    disabled={isEmailVerified || isVerifying}
                    onClick={(e) => handleEmailVerification(false, e)}>
                    Resend
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Row 4: Message (Full width) */}
        <div className="w-full">
          <label className="block font-medium">Message</label>
          <textarea
            placeholder="Message"
            className={`input_primary auth_input w-full ${errors.message && "error"}`}
            {...register("message", validationRules.default)}
          />
          {errors.message && (
            <p className="text-sm text-left text-red-500">{errors.message.message?.toString()}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        className="btn_primary w-[250px]"
        onClick={async () => {
          const isFormValid = await trigger();
          if (isFormValid && isEmailVerified) {
            handleSubmit(onSubmit)();
          } else {
            toast.warn("Please verify the fields before submitting", getToastOptions());
          }
        }}>
        Submit
      </button>
    </form>
  );
};

export default CorporateConnectForm;
