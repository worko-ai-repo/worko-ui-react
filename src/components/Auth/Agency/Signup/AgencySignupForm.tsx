import { validationRules } from '@Utils/FormValidator.utils';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

interface AgencySignupFormProps{
    inviteData: any;
    handleFormSubmit: (data: any) => void;
}

const AgencySignupForm:React.FC<AgencySignupFormProps> = ({inviteData,handleFormSubmit}) => {
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
  const [otpSent, setOtpSent] = useState(true);
  const [termsAndCondition,setTermsAndCondition] = useState(false);

  const onSubmit = (data: any) => {
    // console.log('Form submitted with:', data);
    handleFormSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="mainForm grid grid-cols-1 sm:grid-cols-2 gap-4 w-full py-6 rounded-2xl min-h-[350px]">
            <div>
              <label className="block font-medium">Full name</label>
              <input
                type="text"
                className="input_primary auth_input capitalize"
                {...register("name")}
              />
            </div>


            <div>
              <label className="block font-medium">Email</label>
              <input
                type="email"
                className="input_primary auth_input "
                {...register("email")}
              />
            </div>

            <div>
              <label className="block font-medium">Company</label>
              <input
                type="text"
                className="input_primary auth_input capitalize"
                {...register("company")}
              />
            </div>

            {/* Phone with Country Code */}
            <div>
              <label className="block font-medium">Contact No</label>
              <div className="flex ">
                {/* Country Code Dropdown */}
                <div className="relative country-dropdown-container max-h-44">
                  <div
                    className="input_primary auth_input !rounded-r-none h-full !w-[60px] cursor-pointer flex items-center justify-between"
                    >
                    <span>{"+91"}</span>
                  </div>
                </div>

                {/* Phone Number Input */}
                <input
                  placeholder="Contact number"
                  type="text"
                  className="input_primary auth_input rounded flex-1"
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
            <div className='flex flex-col justify-center items-center text-center m-auto w-full'>
              {otpSent &&         
                <div className={`relative w-full ${otpSent ? "" : "opacity-0"}`}>
                  <label className="block font-medium">Email otp</label>
                  <input
                    type="number"
                    min={6}
                    max={6}
                    className={`input_primary auth_input `}
                  />
                  <span
                    className="absolute right-3 top-9 cursor-pointer">
                  </span>
                </div>
                }
          </div>
          </div>

      <div className="flex flex-col justify-center items-center mt-2">
        {/* Checkbox to toggle password visibility */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showTermsAndCondition"
            checked={termsAndCondition}
            onChange={() => setTermsAndCondition(!termsAndCondition)}
          />
          <label htmlFor="showTermsAndCondition" className="text-sm text-gray-700">
            I accept the terms & conditions
          </label>
        </div>
        <button type="submit" className="btn_primary w-[250px]">
          Create Account
        </button>
      </div>
    </form>
  )
}

export default AgencySignupForm