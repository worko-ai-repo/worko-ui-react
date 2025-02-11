import ToggleBtn from '@Components/Shared/Tooggle';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import httpServiceObj from '@Services/ApiHandler.service';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { validationRules } from '@Utils/FormValidator.utils';
import secureStorage from '@Utils/SecureStorage.utils';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchAuthSession } from '@aws-amplify/auth';

const LoginForm = () => {
	const navigate = useNavigate();
	// States
	const [showPassword, setShowPassword] = React.useState<boolean>(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		mode: 'onChange',
	});

	// Functions
	/**
	 * currentSession
	 *
	 * This function is called to get the current session of the user
	 *
	 * @returns void
	 */
	CognitoServiceObj.handleSignOut();
	const currentSession = async () => {
		CognitoServiceObj.removeAccessToken();
		try {
			const response = await fetchAuthSession({ forceRefresh: true });

			await CognitoServiceObj.setAccessToken();
			const authToken = response.tokens?.idToken?.toString();
			if(authToken){
			console.log(authToken);
			// secureStorage.setItem(SecureStorageKeyEnum.USERTOKEN, authToken);}
			}
		} catch (err) {
			// console.log(err);
		}
	};

	/**
	 * onSubmit
	 *
	 * This function is called when the form is submitted and the data is validated
	 *
	 * @param data - Form data
	 * @returns void
	 */
	const onSubmit = async (data: any): Promise<void> => {
		const loginData = {
			email: data.email,
			password: data.password,
		};

		console.log("Login Data",loginData);
		try {
			const { response, error } = await CognitoServiceObj.handleSignIn(loginData);

			if (error) {
				toast.error(error.message);
				reset(undefined, { keepValues: false });
				throw new Error(error.message);
			}

			// Fetch stored user data
			const userType = secureStorage.getItem(SecureStorageKeyEnum.USERTYPE);

			/**
			 * After successful sign-in, check if the user account is a corporate account.
			 * If corporate, show a popup and log out the user.
			 */
			if (userType === 'Corporate') {
				toast.error("Oops! You don't have access to log in to this portal. Please contact support for assistance.");
				CognitoServiceObj.handleSignOut();
				return;
			}

			/**
			 * If the account is not confirmed, prompt the user to confirm the email.
			 */
			if (response?.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
				toast.error('Please confirm your email address before signing in.');
				//@TODO: Open confirmation modal here
				return;
			}

			if (response?.isSignedIn) {
				
				const email = data.email.toLowerCase();
				const { response: userResponse, error: userError } = await httpServiceObj.get(`/user/${email}/profile`, true, { });

				if (userError) {
					toast.error('Error: ' + userError);
					reset(undefined, { keepValues: false });
					throw new Error();
				}

				// Store user details
				secureStorage.setItem(SecureStorageKeyEnum.LASTACCESSEDDASH, userResponse.data.lastAccessedDash);
				secureStorage.setItem(SecureStorageKeyEnum.USERNAME, userResponse.data.name);

				// Refresh session
				await currentSession();
			}
		} catch (error: any) {
			toast.error(error?.message || 'Something went wrong');
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit((data) => toast.promise(() => onSubmit(data), {
				pending: 'Signing in...',
				success: 'Signed in successfully',
				error: 'Error: An error occurred while signing in',
			}))} className=" min-w-full ">
				<div className="mainForm  min-w-full  grid grid-rows-[min-content] justify-items-center  sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[350px] items-baseline ">
					{/* Name */}
					<div className="w-full max-w-[350px] sm:max-w-[350px] ">
						<label className="block font-medium">Email</label>
						<input type="text" placeholder="Email or phone number" className={`input_primary auth_input ${errors.email && 'error'}`} {...register('email', validationRules.email)} />
						{errors.email && <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>}
					</div>
					{/* Password */}
					<div className="relative w-full max-w-[350px] sm:max-w-[350px]">
						<label className="block font-medium">Password</label>
						<input type={showPassword ? "text":"password"} placeholder="Enter Password" className={`input_primary auth_input ${errors.password && 'error'}`} {...register('password', validationRules.password)} />
						<span className="absolute right-3 top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
							{showPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
						</span>
						{errors.password && <p className="text-sm text-left text-red-500">{errors.password.message?.toString()}</p>}
					</div>

					{/* Remember me and ForgotPassword */}
					<div className="w-full max-w-[350px] sm:max-w-[350px] flex justify-between items-center">
						<div className="flex items-center">
							<ToggleBtn />
							<label className="text-sm">Remember me</label>
						</div>
						<a onClick={() => navigate('/auth/resetpassword', { state: { pagetype: 'GEN' } })} className="text-sm text-blue-600 ">
							Forgot Password?
						</a>
					</div>

					{/* Submit Button */}
					<div className="w-full ">
						<button type="submit" className="cursor-pointer btn_primary px-4 py-3 w-full max-w-[350px] sm:max-w-[350px] " disabled={!isValid}>
							Sign In
						</button>
					</div>
					<hr className="w-full max-w-[350px] " />
					{/* LinkedIn */}
					<div className="w-full ">
						<button className="border px-4 py-3 rounded-md bg-black text-white  w-full max-w-[350px] sm:max-w-[350px] " type="button">
							<i className="fa-brands fa-linkedin-in bg-[#0062ff] px-2 py-[4px] rounded-md  text-xs text-white mx-2 "></i> Or Sign In with LinkedIn
						</button>
					</div>

					{/* Register */}
					<div className="w-full ">
						<p className="text-center text-sm mt-3 ">
							Don't have an account?
							<a href="signup" className="cursor-pointer text-blue-600 ">
								Sign Up Now
							</a>
						</p>
					</div>
				</div>
			</form>
		</div>
	);
};

export default LoginForm;
