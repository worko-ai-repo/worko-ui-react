import { check } from '@Assets';
import OTPInput from '@Components/Shared/Otp';
import { validationRules } from '@Utils/FormValidator.utils';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import TermsAndConditions from './TermsAndConditions';
import { SignupMode } from './Signup';
import CompanyInput from '@Components/Shared/CompanyInput';
import { Upload } from 'lucide-react';
const MessageModal = React.lazy(() => import('@Components/Modals/MessageModal'));

const SignupForm: React.FC<{ activeFrame: SignupMode }> = ({ activeFrame }) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [otpError, setOtpError] = useState(false); // Use lowercase for setter
	const [ViewTerms, setViewTerms] = useState(false);
	const [isOtpSent, setIsOtpSent] = useState(false);
	const [phone, setPhone] = useState("+91 ");
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
		defaultValues: { name: null, phone: '', whatsappActive: false, company: undefined, cv: '', email: '', password: '', confirmPassword: '', termsAndConditions: false },
		mode: 'onChange',
	});

	useEffect(() => {
		if (activeFrame === 'CAND') {
			unregister('company');
			setValue('cv', '');
		} else {
			unregister('cv');
			setValue('company', undefined, { shouldValidate: true });
		}

		//Reset the form state when the active frame changes
		reset(undefined, { keepValues: false });
	}, [activeFrame, setValue, unregister]);

	const onSubmit = async (data: any) => {
		const isPhoneValid = await trigger("phone");
		if (!isPhoneValid) return; 
	
		const companyValue = watch("company") as string | undefined;
		if (!companyValue || companyValue.length === 0) {
			setError("company", {
				type: "manual",
				message: "Please select a company from the dropdown",
			});
			setOtpError(true);
			return;
		}
	
		console.log("Form submitted successfully", data);
	};

	useEffect(() => {
		console.log('Form State', isValid, errors);
	}, [isValid, errors]);

	const validateCV = (value: string) => {
		// Validate CV file
		const fileList = (document.querySelector('input[name="cv"]') as HTMLInputElement)?.files;
		if (!fileList || fileList.length === 0) return 'CV file is required';

		const file = fileList[0];
		const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

		if (!validTypes.includes(file.type)) {
			return 'Only PDF, DOC, and DOCX files are allowed';
		}
		if (file.size > 2 * 1024 * 1024) {
			// 2MB limit
			return 'File size must be less than 2MB';
		}
		return true;
	};
	return (
		<div className=" mx-auto  bg-white flex justify-center items-center w-[90%]   ">
			<form onSubmit={handleSubmit(onSubmit)} className=" min-w-full ">
				<div className="mainForm  min-w-full grid grid-rows-[min-content] sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[350px] items-baseline ">
					{/* Name */}
					<div>
						<label className="block font-medium">Name</label>
						<input type="text" className={`input_primary ${errors.name && 'error'}`} {...register('name', validationRules.name)} />
						{errors.name && <p className="text-left text-red-500">{errors.name.message?.toString()}</p>}
					</div>

					{/* Phone Number */}
					<div className="relative ">
						<label className=" block font-medium">Phone</label>
						<span className="z-20 absolute left-3 top-[38.5px] text-[#789EC1] font-bold">+91</span>
						<input
							type="text"
							maxLength={10}
							className={`appearance-none input_primary ${errors.phone && 'error'} pl-10`}
							{...register('phone', validationRules.phone)}
							onChange={e => {
								let value = e.target.value.replace(/\D/g, ''); // Non-numeric remove
								if (value.length > 10) value = value.slice(0, 10); // Max 10 digits
								setValue('phone', value, { shouldValidate: true });
							}}
						/>
						{errors.phone && <p className="text-left text-red-500">{errors.phone.message?.toString()}</p>}

						<label className="flex items-center gap-2 mt-2">
							<input type="checkbox" className=" bg-white" {...register('whatsappActive')} />
							This number has active <i className="fa-brands text-[#00fa53] fa-whatsapp"></i> WhatsApp
						</label>
					</div>
					{/* Email */}
					<div className="relative">
						<label className="block font-medium">Email</label>
						<input type="email" className={`input_primary ${errors.email && 'error'}`} {...register('email', validationRules.email)} />
						{errors.email && <p className="text-left text-red-500">{errors.email.message?.toString()}</p>}
					</div>

					{/* COMPANY OR CV */}
					{activeFrame === 'CAND' ? (
						<div className="relative ">
							<label className="block font-medium">Upload Cv</label>
							<input type="file" className="input_primary appearance-none cursor-pointer  " {...register('cv', { validate: validateCV })} accept=".pdf,.doc,.docx" />
							<Upload className="absolute right-4 top-10 h-5 w-5 cursor-pointer active:scale-90 text-gray-400 z-1" />
							{errors.cv && <p className="text-left text-red-500">{errors.cv.message}</p>}
						</div>
					) : (
						<div>
							{/* Company Name */}
							<label className="block font-medium">Company Name</label>
							<CompanyInput errors={errors} setValue={setValue} hasLabel={true} formKey="company" setError={setError} clearErrors={clearErrors} />
							{errors.company && <p className="text-left text-red-500">{errors.company.message?.toString()}</p>}
						</div>
					)}
					{/* Password */}
					<div className="relative">
						<label className="block font-medium">Password</label>
						<input type={showPassword ? 'text' : 'password'} className={`input_primary ${errors.password && 'error'}`} {...register('password', validationRules.password)} />
						<span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
							{showPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
						</span>
						{errors.password && <p className="text-left text-red-500">{errors.password.message?.toString()}</p>}
					</div>
					{/* Confirm Password */}
					<div className="relative">
						<label className="block font-medium">Confirm Password</label>
						<input type={showConfirmPassword ? 'text' : 'password'} className={`input_primary ${errors.confirmPassword && 'error'}`} {...register('confirmPassword', validationRules.confirmPassword(watch))} />
						<span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
							{showConfirmPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
						</span>
						{errors.confirmPassword && <p className="text-left text-red-500">{errors.confirmPassword.message?.toString()}</p>}
					</div>
				</div>
				{/* Terms and Conditions */}
				<div className="flex gap-2 items-baseline justify-center">
					<input type="checkbox" {...register('termsAndConditions', validationRules.termsAndConditions)} checked={watch('termsAndConditions')} />
					<p className="block font-medium cursor-pointer" onClick={() => setViewTerms(true)}>
						I accept the <span className="text-blue-500 cursor-pointer">Terms and Conditions</span>
					</p>
				</div>

				{ViewTerms && (
					<MessageModal
						type="none"
						size="2xl"
						heading={{ type: 'info', message: 'Terms and Conditions' }}
						message={TermsAndConditions}
						onClose={() => {
							setViewTerms(false);
						}}
						showCloseButton={false}
						buttons={[
							{
								label: 'Accept',
								action: () => {
									setViewTerms(false);
									setValue('termsAndConditions', true, { shouldValidate: true });
								},
								type: 'primary',
							},
							{
								label: 'Decline',
								action: () => {
									setViewTerms(false);
									setValue('termsAndConditions', false, { shouldValidate: true });
								},
								type: 'danger',
							},
						]}
					/>
				)}

				{/* OTP */}
				<div className={`relative my-5 w-min justify-self-center transition-opacity ease-in-out delay-150 duration-300 ${isOtpSent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
					<label className="block font-medium text-center">OTP</label>
					<OTPInput
						length={6}
						onChange={otp => setOtpError(false)} // Clear error as the user types
					/>
					{otpError && <p className="text-red-500 text-center">Invalid OTP</p>}
				</div>

				{/* Buttons */}
				<div className="flex flex-wrap justify-center items-center gap-2  my-5 ">
					<button  type="submit" onClick={()=>{debugger;} } className=" btn_primary text-white px-4 py-2.5 border-none rounded-md w-[300px] disabled:!bg-gray-500 disabled:!cursor-not-allowed disabled:!pointer-events-all  ">
						Verify & Signup
					</button>
					<button
						className="border px-4 py-2 rounded-md bg-black text-white font-semibold w-[300px] "
						onClick={() => {
							setIsOtpSent(prev => !prev);
						}}>
						<i className="fa-brands fa-linkedin-in bg-[#0062ff] px-2 py-[3px] rounded-md  text-xs text-white"></i> Signup using LinkedIn
					</button>
				</div>

				{/* Already have an account? */}
				<p className="text-center mt-4">
					Already have an account?{' '}
					<a href="/signin" className="text-blue-500">
						Sign In
					</a>
				</p>
			</form>
		</div>
	);
};

export default SignupForm;
