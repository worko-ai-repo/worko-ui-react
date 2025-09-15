import countryCodes from "@Utils/CountryCodes.utils";
import { validationRules } from "@Utils/FormValidator.utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const CorporateSignupForm = ({
  inviteData,
  handleFormSubmit,
}: {
  inviteData: any;
  handleFormSubmit: (data: any) => void;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      accessType: "",
      email: "",
      company: "",
      password: "",
      phoneNumberDetails: {
        countryCode: "",
        phoneNumber: "",
      },
      confirmPassword: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Populate form with inviteData when available
  useEffect(() => {
    if (inviteData) {
      let corporateUserType;
      //remove corporate- from accesstype
      corporateUserType = inviteData.corporateUserType.replace("corporate-", "");

      setValue("name", `${inviteData.firstName} ${inviteData.lastName}`);
      setValue("accessType", corporateUserType);
      setValue("email", inviteData.email);
      setValue("company", inviteData.companyName);
      const resolvedCountryCode =
        inviteData?.phoneNumberDetails?.countryCode ||
        (inviteData?.phoneCountryCode ? `+${inviteData.phoneCountryCode}` : undefined) ||
        inviteData?.countryCode ||
        "+91";
      const resolvedPhoneNumber =
        inviteData?.phoneNumberDetails?.phoneNumber ||
        inviteData?.phoneNumber?.toString?.() ||
        "";
      setValue("phoneNumberDetails.countryCode", resolvedCountryCode);
      setValue("phoneNumberDetails.phoneNumber", resolvedPhoneNumber);
    }
  }, [inviteData]);

  // Form submission handler
  const onSubmit = (data: any) => {
    // console.log('Form submitted with:', data);
    handleFormSubmit(data);
  };
  // Handle country code selection
  const handleCountryCodeSelect = (code: string) => {
    setValue("phoneNumberDetails.countryCode", code);
    setShowCountryDropdown(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <p className="font-semibold text-gray-700 text-2xl text-center ">Corporate Signup </p>
      <div className="mainForm min-w-full grid sm:grid-cols-[repeat(2,_minmax(300px,_350px))] grid-row-[min-content]  gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[350px] ">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            className="input_primary auth_input capitalize"
            {...register("name")}
            disabled
          />
        </div>

        <div>
          <label className="block font-medium">Access Type</label>
          <input
            type="text"
            className="input_primary auth_input capitalize"
            {...register("accessType")}
            disabled
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="input_primary auth_input "
            {...register("email")}
            disabled
          />
        </div>

        <div>
          <label className="block font-medium">Company</label>
          <input
            type="text"
            className="input_primary auth_input capitalize"
            {...register("company")}
            disabled
          />
        </div>
        {/* Phone with Country Code */}
        <div>
          <label className="block font-medium">Contact No</label>
          <div className="flex ">
            {/* Country Code Dropdown */}
            <div className="relative country-dropdown-container max-h-44">
              <div
                className="input_primary auth_input !rounded-r-none h-full !w-[80px] cursor-pointer flex items-center justify-between"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}>
                <span>{watch("phoneNumberDetails.countryCode")}</span>
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
              {...register("phoneNumberDetails.phoneNumber", validationRules.phone)}
            />
          </div>
          <p className="text-sm text-left text-red-500">
            {errors.phoneNumberDetails?.phoneNumber?.message}
          </p>
        </div>
        {/* Password */}
        <div className="relative">
          <label className="block font-medium">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            className={`input_primary auth_input  ${errors.password && "error"}`}
            {...register("password", validationRules.password)}
          />
          <span
            className="absolute right-3 top-9 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <i className="fa-regular fa-eye-slash mt-2"></i>
            ) : (
              <i className="fa-regular fa-eye mt-2"></i>
            )}
          </span>
          {errors.password && (
            <p className="text-sm text-left text-red-500">{errors.password.message?.toString()}</p>
          )}
        </div>
        {/* Confirm Password */}
        <div className="relative">
          <label className="block font-medium">Confirm Password</label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            className={`input_primary auth_input  ${errors.confirmPassword && "error"}`}
            {...register("confirmPassword", validationRules.confirmPassword(watch))}
          />
          <span
            className="absolute right-3 top-9 cursor-pointer"
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
      <button type="submit" className="btn_primary w-[250px]">
        Create Account
      </button>
    </form>
  );
};

export default CorporateSignupForm;
