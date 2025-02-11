import { Forgot_Password, Forgot_Password_1, Login_Boy } from '@Assets';
import { validationRules } from '@Utils/FormValidator.utils';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ConfirmResetPasswordInput, confirmResetPassword,  resetPassword } from '@aws-amplify/auth';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

type PageType = 'CORP' | 'GEN';

const ForgotPassword = () => {
	const location = useLocation();
  	const pagetype = (location.state?.pagetype as PageType) || "GEN";

	// States
	const [showPassword, setShowPassword] = React.useState<boolean>(false);
	const [isStepOne, setIsStepOne] = React.useState<boolean>(true);
	const {
		register,
		handleSubmit,
        trigger,
        watch,
		formState: { errors, isValid },
	} = useForm({
		defaultValues: {
			email: '',
			otp: '',
			password: '',
			confirmPassword: '',
		},
		mode: 'onChange',
	});

	const heading = isStepOne ? 'Forgot Your Password ?' : 'Reset Your Password';
	const headingInfo = isStepOne ? 'Forgot your password! No Worries Follow these Two Easy Steps to resolve it.' : 'Fill all the deatils to reset your password along with the OTP sent to your email.';

	// functions
	// STEP 1 : This will be opened Once you set the email and clicked on the forgot password, it will open the handleResetPassword page and pass your email to next function
	async function onSendCode(e:any) {
        e.preventDefault();
		// STEP 2: Cognito is accepting username as email so we are using calling resetPassword function and passing the email to the next function
        const isEmailValid = await trigger('email'); // Validate only the email field
		if (!isEmailValid) return; // Prevent step change if invalid

      try {
        // use email as username
       const username = watch('email');
       
       // Send the reset code to the user
       const output = await resetPassword({ username });
   
       // Open the Otp screen
       setIsStepOne(false);
   
       // Code Delivery Details
       const { nextStep } = output;
       if(nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE'){
           nextStep.codeDeliveryDetails;
       }
     } catch (error) {
        console.log(error);
     } 
	}

	// STEP 3: After getting the code from the user we will confirm the reset password from cognito, and we have already match the password with confirm password of verification
	const onChangePassword = async (data: any) => {
		
      const resetPasswordData : ConfirmResetPasswordInput = {
       username: data.email,
       confirmationCode: data.otp,
       newPassword: data.password
     }
     try {
       await toast.promise(
        confirmResetPassword(resetPasswordData),
        {
          pending: 'Resetting Password...',
          success: 'Password Reset Successfully',
          error: 'Error resetting password'
        }
        
    );

       // Change the screen after 3 seconds
       setTimeout(() => {
         // Redirect to login
         window.location.href = 'login';

       }, 3000)
     } catch (error: any) {
      toast.error(error.message);
     }
};

	return (
		<div className="  flex justify-center relative w-full min-h-[500px] max-w-[1120px] overflow-hidden rounded-3xl bg-white shadow z-20 ">
			<div className="sm:hidden absolute top-3 rounded-full border-[1px] border-blue-600 flex items-center justify-center w-[80px] h-[50px] ">
				<i className="fa-sharp-duotone fa-solid fa-key fa-fade fa-2xl text-blue-600 animate-pulse"></i>
			</div>
			<div className=" px-8 pt-8 pb-16  sm:px:14 flex justify-between w-full items-center ">
				{/* Form and Image */}
				<div className=" img hidden sm:block h-full max-w-[50%]">
					<img src={isStepOne ? Forgot_Password_1 : Forgot_Password} alt="login_img" className="  w-full h-full object-contain  rounded-3xl " />
				</div>
				<div className=" img h-full w-full sm:w-[50%]  flex flex-col justify-center">
					<div className="text-left   max-w-[350px]  mx-auto ">
						<p className="font-bold text-xl  md:text-2xl text-gray-700 mx-auto text-left   max-w-[350px] mt-2 "> {heading} </p>
						<small className="max-w-[350px] text-justify  ">{headingInfo}</small>
					</div>
					<div className="min-h-[50%]  flex items-center">
						<form onSubmit={isStepOne ? (e) =>  onSendCode(e) : handleSubmit(onChangePassword)} className=" min-w-full flex flex-col  items-center justify-center  ">
							<div className="mainForm  min-w-full  grid grid-rows-[min-content] justify-items-center  sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 items-baseline  ">
								{/* Name */}
								<div className="w-full max-w-[350px] sm:max-w-[350px] ">
									<label className="block font-medium">Email</label>
									<input disabled={!isStepOne} type="text" placeholder="Email or phone number" className={`input_primary auth_input ${errors.email && 'error'}`} {...register('email', pagetype === 'GEN' ? validationRules.email : validationRules.corporateEmail)} />
									{errors.email && <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>}
								</div>
								<div className={`${isStepOne ? 'hidden' : 'block'} w-full max-w-[350px] sm:max-w-[350px] `}>
									{/* Enter Otp */}
									<div className="w-full max-w-[350px] sm:max-w-[350px] ">
										<label className="block font-medium">Enter OTP</label>
										<input type="text" placeholder="Enter OTP" className={`input_primary auth_input ${errors.otp && 'error'}`} {...register('otp', validationRules.otp)} />
										{errors.otp && <p className="text-sm text-left text-red-500">{errors.otp.message?.toString()}</p>}
									</div>
									{/* Password */}
									<div className="relative w-full max-w-[350px] sm:max-w-[350px]">
										<label className="block font-medium">Password</label>
										<input type={showPassword ? 'text' : 'password'} placeholder="Enter Password" className={`input_primary auth_input ${errors.password && 'error'}`} {...register('password', validationRules.password)} />
										<span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
											{showPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
										</span>
										{errors.password && <p className="text-sm text-left text-red-500">{errors.password.message?.toString()}</p>}
									</div>
									{/* Confirm Password */}
									<div className="relative w-full max-w-[350px] sm:max-w-[350px]">
										<label className="block font-medium">Confirm Password</label>
										<input type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" className={`input_primary auth_input ${errors.confirmPassword && 'error'}`} {...register('confirmPassword', validationRules.confirmPassword(watch))} />
										<span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
											{showPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
										</span>
										{errors.confirmPassword && <p className="text-sm text-left text-red-500">{errors.confirmPassword.message?.toString()}</p>}
									</div>
								</div>

								{/* Submit Button */}
								<div className="w-full ">
									<button type="submit" /* onClick={() => setIsStepOne(prev => !prev)} */ className="cursor-pointer btn_primary px-4 py-3 w-full max-w-[350px] sm:max-w-[350px] ">
										{isStepOne ? 'Send Code' : 'Reset Password'}
									</button>
									{/* Register */}
									<div className="w-full ">
										<p className="text-center text-sm  mt-3">
											<a href="login" className="cursor-pointer text-blue-600 ">
												<i className="fa-solid fa-chevron-left fa-xs leading-3 "></i> Back To Login
											</a>
										</p>
									</div>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
