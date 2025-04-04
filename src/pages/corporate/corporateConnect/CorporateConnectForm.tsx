import httpServiceObj from '@Services/ApiHandler.service';
import { validationRules } from '@Utils/FormValidator.utils';
import { getToastOptions } from '@Utils/Toast.utils';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const CorporateConnectForm = ({ handleFormSubmit }: { handleFormSubmit: (data: any) => Promise<void> }) => {
	// States
	const [isOtpSent, setIsOtpSent] = useState(false);
	const [isEmailVerified, setEmailVerified] = useState(false);
	const [isVerifying, setVerifying] = useState(false);
	const [resendOtpVisible, setResendOtpVisible] = useState(false);

	const {
		register,
		watch,
		trigger,
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			otp: '',
			name: '',
			phone: '',
			email: '',
			company: '',
			designation: '',
			message: '',
		},
		mode: 'onChange',
		criteriaMode: 'all',
	});

	// Send OTP / Verify OTP function
	const handleEmailVerification = async (isOtpVerification: boolean, e: any) => {
		e.preventDefault();
		if (!watch('email')) return;

		const constructedUrl = isOtpVerification ? `/corporate/${watch('email')}/verify-otp` : `/corporate/${watch('email')}/request-otp`;

		const payload = isOtpVerification ? { otp: watch('otp') } : { fullName: watch('name') };

		setVerifying(true); // Disable button while verifying
		const { response: dbResponse, error: dbError } = await httpServiceObj.post<any>(constructedUrl, payload, true);
		setVerifying(false);

		if (dbError) {
			toast.error('Something went wrong. Please try again later.',getToastOptions());
			// If OTP verification failed, reset the OTP field
			if (isOtpVerification) {
				setIsOtpSent(false);
			}
		} else {
			// If OTP verification successful, set email verified
			if (isOtpVerification && dbResponse?.verificationStatus === true) {
				setEmailVerified(true);
				toast.success('Email Verified Successfully',getToastOptions());
			} else if (dbResponse?.verificationStatus === false) {
				toast.error('Please enter correct OTP',getToastOptions());
			} else {
				setIsOtpSent(true);
				toast.success('OTP Sent to your Email',getToastOptions());
				setTimeout(() => setResendOtpVisible(true), 10000); // Show resend option after 10 sec
			}
		}
	};

	// Form submission handler
	const onSubmit = async (data: any) => {
		const handleFormS = await handleFormSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full">
			<p className="font-bold text-lg text-left">Let's Connect</p>
			<div className="mainForm min-w-full grid sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[150px]">
				{/* Name */}
				<div>
					<label className="block font-medium">Name</label>
					<input placeholder="Full Name" type="text" className={`input_primary auth_input ${errors.name && 'error'}`} {...register('name', validationRules.name)} />
					{errors.name && <p className="text-sm text-left text-red-500">{errors.name.message?.toString()}</p>}
				</div>
				{/* Company */}
				<div>
					<label className="block font-medium">Company</label>
					<input placeholder="Company name" type="text" className={`input_primary auth_input ${errors.company && 'error'}`} {...register('company', validationRules.companyName)} />
					{errors.company && <p className="text-sm text-left text-red-500">{errors.company.message?.toString()}</p>}
				</div>

				{/* Phone Number */}
				<div>
					<label className="block font-medium">Contact No</label>
					<input placeholder="Contact number" type="text" className="input_primary auth_input" {...register('phone', validationRules.phone)} />
					<p className="text-sm text-left text-red-500">{errors.phone?.message}</p>
				</div>

				{/* Designation */}
				<div>
					<label className="block font-medium">Designation</label>
					<input placeholder="Designation" type="text" className={`input_primary auth_input ${errors.designation && 'error'}`} {...register('designation', validationRules.designation)} />
					{errors.designation && <p className="text-sm text-left text-red-500">{errors.designation.message?.toString()}</p>}
				</div>

{/* Email */}
<div className="relative ">
	<label className="block font-medium">Email</label>
	<div className="flex gap-2 ">
		<input
			readOnly={isEmailVerified || isOtpSent} // Make editable if OTP is not sent
			placeholder="Corporate email id"
			type="email"
			className="input_primary auth_input"
			{...register('email', validationRules.corporateEmail)}
		/>
		
		{/* Show Send OTP / Change Email buttons */}
		{!errors.email && watch('email') && (
			<div className=" flex ">
				{isOtpSent ? (
					<button
						className="btn_secondary text-xs px-0 text-center"
						onClick={() => {
							// Reset all OTP-related states
							setIsOtpSent(false);
							setEmailVerified(false);
							setResendOtpVisible(false);
							setValue('otp', ''); // Clear OTP field
						}}
					>
						Change Email
					</button>
				) : (
					<button
						className="btn_primary py-1 px-3 text-xs active:scale-50"
						disabled={isOtpSent || isVerifying}
						onClick={e => handleEmailVerification(false, e)}
					>
						{isVerifying ? 'Sending...' : isEmailVerified ? '✅ Verified' : 'Verify'}
					</button>
				)}
			</div>
		)}
	</div>
	{errors.email && <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>}
</div>


				{/* OTP Input */}
				{isOtpSent && (
					<div className="relative">
						<label className="block font-medium">OTP</label>
						<input placeholder="OTP" readOnly={isEmailVerified} type="text" className={`input_primary auth_input ${errors.otp && 'error'}`} {...register('otp', validationRules.otp)} />
						{errors.otp && <p className="text-sm text-left text-red-500">{errors.otp.message?.toString()}</p>}
						<button className="absolute btn_primary top-[33px] right-0 scale-75 disabled:!cursor-not-allowed active:scale-50 " disabled={isEmailVerified || isVerifying} onClick={e => handleEmailVerification(true, e)}>
							{isVerifying ? 'Verifying...' : 'Verify OTP'}
						</button>
						{/* Resend OTP after 10 sec */}
						{resendOtpVisible && (
							<p className="text-sm text-left mt-1">
								Didn’t get the OTP?{' '}
								<button className="text-blue-500 underline cursor-pointer disabled:!cursor-not-allowed   " disabled={isEmailVerified || isVerifying} onClick={e => handleEmailVerification(false, e)}>
									Resend
								</button>
							</p>
						)}
					</div>
				)}
				{/* message textarea */}
				<div className="md:col-span-2 ">
					<label className="block font-medium">Message</label>
					<textarea placeholder="Message" className={`input_primary auth_input w-full ${errors.message && 'error'}`} {...register('message', validationRules.default)} />
					{errors.message && <p className="text-sm text-left text-red-500">{errors.message.message?.toString()}</p>}
				</div>
			</div>
			<button
				type="button"
				className="btn_primary w-[250px]"
				onClick={async () => {
					const isFormValid = await trigger();
					// debugger;
					if (isFormValid && isEmailVerified) {
						handleSubmit(onSubmit)();
					} else {
						toast.warn('Please verify the fields before submitting',getToastOptions());
					}
				}}>
				Submit
			</button>
		</form>
	);
};

export default CorporateConnectForm;
