import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import CustomButtonWithButton from '../../Shared/CustomButtonWithButton';
import SignupForm from './SignupForm';
import { AuthFormDto, AuthSignupBaseDto, DevEmployeeDto, CognitoSignupResponse, DevCandidateDto, AwsS3FileUploadResponse, FileUpload, AuthLoginForGeneralUserDto } from '@Interfaces/Auth.dto';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import httpServiceObj from '@Services/ApiHandler.service';
import { auth_bg, auth_bg2 } from '@Assets';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '@Context/App.context';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import { continueReferralRequestDataDto } from '@Pages/request-referral/RequestReferral';
import { currentSession } from '../Login/LoginForm';

export type SignupMode = 'EMP' | 'CAND';


const Signup = () => {
	const navigateTo = useNavigate();
	const { setPendingApply,PendingApply,isLoggedIn,setUpdateCheck } = useAppContext();
	const location = useLocation(); // Get location object

	const initialFrame = location.state?.activeFrame ?? 'CAND'; // Default to 'CAND'

	const [cv, setCv] = useState<any>();
	const [companySk, setCompanySk] = useState<string>('');
	const [CompanyName, setCompanyName] = useState<string>('');
	const [activeFrame, setActiveFrame] = useState<SignupMode>(initialFrame);

	let resumeUserFileName: string;
	let resumeUserFileMimeType: string;

	let formData: AuthSignupBaseDto = {
		name: '',
		emailId: '',
		password: '',
		candidateOtp: '',
		phoneNumber: '',
		confirmPassword: '',
		checkboxChecked: false,
		acceptedTermsAndConditions: false,
	};
	const options = [
		{ label: 'Candidate/Job Seeker', value: 'CAND' },
		{ label: 'Employee/Referee', value: 'EMP' },
	];

	let CognitoResponse: CognitoSignupResponse;
	/**
	 * check if the user is already logged in
	 */
	useLayoutEffect(() => {
		if (isLoggedIn) {
			navigateTo('/');
		}
	}, [isLoggedIn]);

	/**
	 * metaDataFilter
	 *
	 * @description This function is used to filter the meta data according to the frame we are in
	 *
	 * @param data
	 */
	const metaDataFilter = (data: AuthFormDto) => {
		/**
		 * Set static data for the form data
		 */
		formData.name = data.name;
		formData.emailId = data.email;
		formData.password = data.password;
		formData.phoneNumber = data.phone;
		formData.confirmPassword = data.confirmPassword;
		formData.acceptedTermsAndConditions = data.termsAndConditions;

		if (activeFrame === 'CAND') {
			let resumeFile = data.cv[0];
			resumeUserFileName = resumeFile.name;
			resumeUserFileMimeType = resumeFile.type;
			setCv(data.cv);
		} else {
			setCompanySk(data.company);
		}
	};
	
const handleAutoLogin = async (data: any): Promise<void> => {
	
	const loginData = {
		email: data.email,
		password: data.password,
	};

	try {
		const { response, error } = await CognitoServiceObj.handleSignIn(loginData);
		// If error occurs, show the error message and reset the form
		if (error) {
			toast.error(error.message);
			window.location.href = '/auth/login'; // Navigate to the login page if an error occurs
		} else {
			
			/**
			 * If the account is confirmed, proceed with the sign-in process
			 */
			if (response?.isSignedIn) {
				const email = data.email.toLowerCase();
				const { response: userResponse, error: userError } = await httpServiceObj.get<[{}]>(`/user/${email}/details`, true, {});

				if (userError) {
					toast.error('Error: ' + userError);
					throw new Error();
				} else {
					// Extract the first element from the array response
					let user: Partial<AuthLoginForGeneralUserDto> = userResponse?.[0] || {};

					if (!user) {
						toast.error('Error: No user data found');
						throw new Error();
					}

					// Create userDetails from the first element
					const userDetails: Partial<AuthLoginForGeneralUserDto> = {
						lastAccessedDash: user.lastAccessedDash,
						name: user.name,
						email: user.email,
						id: user.id,
						profileImageAwsS3SignedUrl: user.profileImageAwsS3SignedUrl,
						referralCount: user.referralCount,
					};
					// Store user details
					secureStorage.setItem(SecureStorageKeyEnum.LASTACCESSEDDASH, user.lastAccessedDash);
					secureStorage.setItem(SecureStorageKeyEnum.USERNAME, user.name);
					secureStorage.setItem<Partial<AuthLoginForGeneralUserDto>>(SecureStorageKeyEnum.LOGINDETAILS, userDetails);

					
					await currentSession();
					setUpdateCheck(true);
					toast.success('Successfully signed in');
					setTimeout(() => {
						
						  // Retrieve pending referral data from context and secure storage
							let pendingReferral = PendingApply || secureStorage.getItem<continueReferralRequestDataDto>(
								SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA
							);

							// Sync PendingApply and secureStorage
							if (PendingApply && !secureStorage.getItem(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA)) {
								secureStorage.setItem(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA, PendingApply);
							} else if (!PendingApply && secureStorage.getItem(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA)) {
								setPendingApply(pendingReferral);
							}

						if (PendingApply) {
							secureStorage.setItem(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA, PendingApply);
							window.location.href = PendingApply.url; // Redirect to the referral page
						} else {
							navigateTo('/'); // Redirect to the home page
						}
					}, 3000);
				}
			}
		}
	} catch (error: any) {
		toast.error(error?.message || 'Something went wrong');
		// CognitoServiceObj.handleSignOut();
	}
};


	/**
	 * handleVerifyOtp
	 */
	const handleVerifyOtp = async (email: string, otp: string,password:string) => {
		try {
			let signupform = {
				username: email,
				confirmationCode: otp,
			};
			let autoLoginData = {
				email: email,
				password: password
			}
			// Call handleSignUpConfirmation and await the result
			const { response, error } = await CognitoServiceObj.handleSignUpConfirmation(signupform);

			// Check if the confirmation was successful
			if (response) {
				toast.success('User registered successfully');
				await handleAutoLogin(autoLoginData);
				// Handle the confirmed sign-up as needed
				return { response: response };
			} else if (error) {
				throw error;
			}
			// If no response or error was encountered, return a default value
			throw new Error('Unexpected error: No response or error.');
		} catch (error: any) {
			toast.error(error.message);
		}
	};

	/**
	 * CvS3MemAllocation
	 *
	 * @description This function is used to allocate the memory to the CV from dev server and return the URL to upload the CV
	 */
	const CvS3MemAllocation = useCallback(async () => {
		const cvS3metaData = {
			userId: CognitoResponse?.userId || '', // Ensure `CognitoResponse` is valid
			resumeUserFileName: resumeUserFileName,
			resumeFileMimeType: resumeUserFileMimeType,
		};

		const { response, error } = await httpServiceObj.post<AwsS3FileUploadResponse>('/file/gsu2u/USER_RESUME', cvS3metaData, true, false);

		if (error) {
			throw error;
		}

		// Upload to S3
		const metaData: FileUpload = {
			file: cv,
			awsS3Tag: response?.awsS3Tag,
		};

		const signedUrl: string = response?.awsS3SignedUrl || '';
		// debugger;
		const fileUploadHandler = await httpServiceObj.put<null>(signedUrl, metaData.file, false, { awsS3Tag: metaData.awsS3Tag, fileType: resumeUserFileMimeType }, true);

		if (fileUploadHandler.error) {
			throw fileUploadHandler.error;
		} else {
			// Patch the data to the backend
			// debugger;
			const CvNamePatchRequest = await httpServiceObj.patch<null>(`/user/${formData.emailId}/cv`, { resume: response?.cloudFileName }, true);

			if (CvNamePatchRequest.status !== 200) {
				throw CvNamePatchRequest.error;
			} else {
				toast.success('CV uploaded successfully');
			}
		}
	}, [cv]);

	/**
	 * mutateDatatoBackend
	 *
	 * @description This function is used to add the data to the backend
	 */
	const mutateDatatoBackend = useCallback(async (ClientId: string) => {
		// Check the mode and add the data accordingly
		// debugger;
		if (activeFrame === 'CAND') {
			// Add the data to the backend
			let candidateData: DevCandidateDto = {
				name: formData.name,
				email: formData.emailId,
				number: '+91' + formData.phoneNumber,
				userId: ClientId,
				acceptedTermsAndConditions: formData.acceptedTermsAndConditions, // Include the acceptedTermsAndConditions field
			};
			// Add the data to the backend
			const { response, error } = await httpServiceObj.post('/user/register/candidate', candidateData, true);
			if (error) {
				throw error;
			} else {
				await CvS3MemAllocation();
			}
		} else {
			// debugger;
			// Add the data to the backend
			let employeeData: DevEmployeeDto = {
				name: formData.name,
				email: formData.emailId,
				number: '+91' + formData.phoneNumber,
				YOE: 0,
				companyName: CompanyName,
				companySK: companySk,
				userId: ClientId,
				acceptedTermsAndConditions: formData.acceptedTermsAndConditions, // Include the acceptedTermsAndConditions field
			};

			// Add the data to the backend
			return await httpServiceObj.post('/user/register/employee', employeeData, true);
		}
	}, []);

	/**
	 * runCognitoBasicSignup
	 *
	 * @description This function is used to run the cognito basic signup to register user at Cognito and pass the data to the next step
	 * @param data
	 */
	const { mutate, isPending } = useMutation({
		mutationFn: async (clientId: string) => {
			return toast.promise(mutateDatatoBackend(clientId), {
				pending: 'Registering user...',
			});
		},
		onSuccess: () => {
			toast.success('User registered successfully');
		},
		onError: error => {
			console.error('Submission failed:', error);
			toast.error('Error registering user');
		},
	});

	const runCognitoBasicSignup = async (data: AuthFormDto) => {
		try {
			metaDataFilter(data);
			// debugger;
			let signupform = {
				password: formData.password,
				username: formData.emailId.toLowerCase(),
				name: formData.name,
				phone_number: '+91' + formData.phoneNumber,
			};
			// debugger;
			const { response, error } = await CognitoServiceObj.handleSignUp(signupform);

			if (error) {
				toast.error(error.message);
				return false;
			} else {
				CognitoResponse = response;

				// Use mutate instead of calling `useMutation` directly
				mutate(CognitoResponse.userId);

				toast.info('OTP sent to your email. Please verify it.');
				return true;
			}
		} catch (error: any) {
			toast.error(error.message);
			return false;
		}
	};
	/**
	 * verifyOtp
	 *
	 * @description This function is used to verify the OTP entered by the user and it is the final step of the signup process
	 *
	 * @param otp
	 * @returns
	 */
	const verifyOtp = async (otp: string) => {
		return true;
	};

	/**
	 * useEffect
	 *
	 * @description This hook is used to reset the state when the component is unmounted
	 */
	useEffect(() => {
		// Reset the state when the component is unmounted
		return () => {
			Object.keys(formData).forEach(key => {
				(formData as any)[key] = '';
			});
			setCv(undefined);
			setCompanySk('');
		};
	}, [activeFrame]);


	return (
		<>
		<img src={auth_bg} alt="auth_bg" className="absolute -left-20 top-10 z-10 " />
		<img src={auth_bg2} alt="auth_bg2" className="absolute z-10  bottom-10 right-0" />
			<div className=" flex justify-center relative mt-10 w-full  sm:max-w-[80vw] md:w-[80vw]  md:max-w-[1000px] overflow-hidden rounded-md mx-2 sm:rounded-3xl bg-white shadow z-20 ">
				<div className="px-2 gap-2 py-5 sm:py-6  w-full flex flex-col ">
					{/* Header and toggle button */}
					<div className="  relative header flex justify-around flex-wrap w-full  items-center ">
						<p className="font-semibold text-sm md:text-xl text-gray-900 self-end "> Create your account as </p>
						{/* onToggleChange={setActiveFrame} activeFrame={activeFrame} */}
						<div className="w-[90vw] lg:w-fit   min-w-[50%] lg:pl-16 ">
							<CustomButtonWithButton options={options} activeFrame={activeFrame} setActiveFrame={setActiveFrame} />
						</div>
					</div>
					{/* Signup form */}
					<div className="scale-90 sm:scale-100  flex mt-2 flex-1 sm:mx-auto sm:w-[85%] ">
						<SignupForm activeFrame={activeFrame} runCognitoBasicSignup={runCognitoBasicSignup} handleVerifyOtp={handleVerifyOtp} verifyOtp={verifyOtp} setCompanyName={setCompanyName} />
					</div>
				</div>
			</div>
		</>
	);
};

export default Signup;
