import { validationRules } from '@Utils/FormValidator.utils';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const CorporateSignupForm = ({ inviteData,handleFormSubmit}: { inviteData: any , handleFormSubmit: (data:any) => void }) => {
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			accessType: '',
			email: '',
			company: '',
			password: '',
			confirmPassword: '',
		},
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Populate form with inviteData when available
	useEffect(() => {
		if (inviteData) {
			let corporateUserType;
			//remove corporate- from accesstype
			corporateUserType = inviteData.corporateUserType.replace('corporate-', '');

			setValue('name', `${inviteData.firstName} ${inviteData.lastName}`);
			setValue('accessType', corporateUserType);
			setValue('email', inviteData.email);
			setValue('company', inviteData.companyName);
		}
	}, [inviteData, setValue]);

	// Form submission handler
	const onSubmit = (data: any) => {
		// console.log('Form submitted with:', data);
		handleFormSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-full">
			<p className='font-bold text-lg text-left '>Corporate Signup </p>
			<div className="mainForm min-w-full grid   sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] grid-row-[min-content]  gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[350px] ">
				<div>
					<label className="block font-medium">Name</label>
					<input type="text" className="input_primary auth_input capitalize" {...register('name')} disabled />
				</div>

				<div>
					<label className="block font-medium">Access Type</label>
					<input type="text" className="input_primary auth_input capitalize" {...register('accessType')} disabled />
				</div>

				<div>
					<label className="block font-medium">Email</label>
					<input type="email" className="input_primary auth_input " {...register('email')} disabled />
				</div>

				<div>
					<label className="block font-medium">Company</label>
					<input type="text" className="input_primary auth_input capitalize" {...register('company')} disabled />
				</div>

				{/* Password */}
				<div className="relative">
					<label className="block font-medium">Password</label>
					<input type={showPassword ? 'text' : 'password'} className={`input_primary auth_input  ${errors.password && 'error'}`} {...register('password', validationRules.password)} />
					<span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
						{showPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
					</span>
					{errors.password && <p className="text-sm text-left text-red-500">{errors.password.message?.toString()}</p>}
				</div>
				{/* Confirm Password */}
				<div className="relative">
					<label className="block font-medium">Confirm Password</label>
					<input type={showConfirmPassword ? 'text' : 'password'} className={`input_primary auth_input  ${errors.confirmPassword && 'error'}`} {...register('confirmPassword', validationRules.confirmPassword(watch))} />
					<span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
						{showConfirmPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
					</span>
					{errors.confirmPassword && <p className="text-sm text-left text-red-500">{errors.confirmPassword.message?.toString()}</p>}
				</div>
			</div>
			<button type="submit" className="btn_primary w-[250px]">
				Create Account
			</button>
		</form>
	);
};

export default CorporateSignupForm;
