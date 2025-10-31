import { validationRules } from '@Utils/FormValidator.utils';
import { getToastOptions } from '@Utils/Toast.utils';
import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

interface AgencyLoginFormProps{

}

type FormValues = {
  email: string
  password: string
}

const AgencyLoginForm:React.FC<AgencyLoginFormProps> = ({}) => {
  const {register, handleSubmit, formState: { errors }} = useForm<FormValues>({mode: "onChange",defaultValues: {email: "",password: ""}})
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // toast.success(data, getToastOptions({}))
    window.location.href = "/agency-dashboard"
    console.log(data)
  }

  return (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full ">
          <p className="font-semibold text-gray-700 text-2xl text-center ">Agency Login </p>
          <div className="mainForm min-w-full grid sm:grid-cols-[repeat(auto,_minmax(500px,500px))] grid-row-[min-content]   w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[250px] ">
            <div>
            <label className="block font-medium">Email id</label>
            <input
                type="email"
                className="input_primary auth_input "
                {...register("email", validationRules.corporateEmail)}
            />
            {errors.email && (
                <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>
            )}
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
            
            {/* forget password */}
            <a
              onClick={() => navigate("/auth/resetpassword", { state: { pagetype: "AGENCY" } })}
              className="text-right cursor-pointer text-sm text-blue-500 ">
              Forgot password?
            </a>

          </div>
          <button type="submit" className="btn_primary w-[250px]">
            Login
          </button>
        </form>
  )
}

export default AgencyLoginForm