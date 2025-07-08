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
import { CompanyShortDto, UserBasicDetailsDto } from '@Interfaces/JobsAndCompany.dto';
import { getToastOptions } from '@Utils/Toast.utils';
import ReferralLoader from '@Components/ReferralRequest/ReferralLoader';
import MessageModal from '@Components/Modals/MessageModal';
import { useCrossAppAuth } from '@Hooks/useCrossAppAuth.hook';

export type SignupMode = 'EMP' | 'CAND';
interface ToggleOptionsDto {
	label: string;
	value: SignupMode;
}

const Signup = () => {
	const navigateTo = useNavigate();
	const { setPendingApply, PendingApply, isLoggedIn, setUpdateCheck } = useAppContext();
	const appHref = useCrossAppAuth();
	const location = useLocation(); // Get location object
	let initialFrame: SignupMode = 'CAND'; // Default to 'CAND'
	const [currStep, setCurrStep] = useState<0 | 1 | 2 | 3 | 4>(0); // Current step of the loader
	const APP_API_URI = import.meta.env.APP_API_URI;

	useEffect(() => {
		initialFrame = location.state?.activeFrame ?? 'CAND'; // Default to 'CAND'
	}, []);

	const [cv, setCv] = useState<any>();
	const [CompanyName, setCompanyName] = useState<string>('');
	const [activeFrame, setActiveFrame] = useState<SignupMode>(initialFrame);
	const [OpenReferralLoader, setOpenReferralLoader] = useState<boolean>(false);
	const [modalData, setModalData] = useState<{
		type: "none" | "error" | "warning" | "success" | "info";
		heading?: { message: string; type: "error" | "warning" | "success" | "info" };
		message: string;
		buttons?: { label: string; action: () => void; type?: "primary" | "danger" | "warning" | "success" }[];
	  } | null>(null);

	let resumeUserFileName: string;
	let resumeUserFileMimeType: string;

	let formData: AuthSignupBaseDto = {
		name: '',
		emailId: '',
		ctc: 0,
		ectc: 0,
		password: '',
		candidateOtp: '',
		phoneNumber: '',
		confirmPassword: '',
		checkboxChecked: false,
		acceptedTermsAndConditions: false,
		companySk: '',
	};

	const options: ToggleOptionsDto[] = [
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
	}, []);

	/**
	 * metaDataFilter
	 *
	 * @description This function is used to filter the meta data according to the frame we are in
	 *
	 * [Error] An error occurred:
TypeError: undefined is not an object (evaluating 'o.name')
W — Signup-BwkRK2K6.js:1:2661
(anonymous function) — Signup-BwkRK2K6.js:1:7207
Z — Signup-BwkRK2K6.js:1:7879
(anonymous function) — SignupForm-BfrptH4Q.js:205
	(anonymous function) (Signup-BwkRK2K6.js:1:7814)
	Z (Signup-BwkRK2K6.js:1:7879)
	(anonymous function) (SignupForm-BfrptH4Q.js:42:1646)

	 * @param data
	 */
	const metaDataFilter = (data: AuthFormDto) => {
		// Update the form data
		formData.name = data.name;
		formData.emailId = data.email;
		formData.password = data.password;
		formData.phoneNumber = data.phone;
		formData.confirmPassword = data.confirmPassword;
		formData.acceptedTermsAndConditions = data.termsAndConditions;

		if (activeFrame === 'CAND') {
			formData.ectc = data.ectc ?? 0; // Default to 0 if data.ectc is undefined
			formData.ctc = data.ctc ?? 0; // Default to 0 if data.ctc is undefined
			let resumeFile: File | null = null;
			if(data.cv && data.cv.length > 0) {
				resumeFile = data.cv[0] as File;
			}
			if (resumeFile) {
				resumeUserFileName = resumeFile.name;
				resumeUserFileMimeType = resumeFile.type;
			}
			//store it in local also
			localStorage.setItem('resumeUserFileName', resumeUserFileName);
			localStorage.setItem('resumeUserFileMimeType', resumeUserFileMimeType);
			setCv(data.cv);
		} else {
			formData.companySk = data.company;
		}
	};

	/**
	 * initiateFinalRedirection
	 *
	 * @description This function is used to redirect the user to the final page after the signup process is completed
	 */
	const initiateFinalRedirection = () => {
		// Retrieve pending referral data from context and secure storage
		let pendingReferral = PendingApply || secureStorage.getItem<continueReferralRequestDataDto>(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS);

		// Sync PendingApply and secureStorage
		if (PendingApply && !secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)) {
			secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
		} else if (!PendingApply && secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)) {
			setPendingApply(pendingReferral);
		}

		if (PendingApply) {
			secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
			window.location.href = PendingApply.url; // Redirect to the referral page
		} else {
			const AuthActiveFrame = localStorage.getItem('AuthActiveFrame');
			const finalActiveFrame = AuthActiveFrame ? (AuthActiveFrame as SignupMode) : activeFrame;
			// prefer local over state
			finalActiveFrame === 'CAND' ? navigateTo('/jobs', { replace: true }) : (appHref('/v1/employee/Dashboard')); // Redirect to the home page
		}
	};
	/**
	 * checkBasicDetails
	 *
	 * @description This function is used to check if the user has completed the basic details or not
	 */
	const checkBasicDetails = async () => {
		let retryCount = 0;
		const maxRetries = 3;

		const attemptCheck = async () => {
			try {
				const AuthActiveFrame = localStorage.getItem('AuthActiveFrame');
				const finalActiveFrame = AuthActiveFrame ? (AuthActiveFrame as SignupMode) : activeFrame;
				if(finalActiveFrame === 'EMP') {
					initiateFinalRedirection();
				}
				else{
				if (retryCount === 0){setOpenReferralLoader(true);}
				const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(`${APP_API_URI}/user/basic-details`, true, {}, true);

				if (error) throw error;

				const designation = response?.candidateExperience?.designation;
				const coreSkills = response?.coreSkills?.map(skill => skill.skillName);

				// If either designation or coreSkills exist, update filters
				if (response?.cvExtract && (designation || coreSkills?.length || response?.YOE)) {
					setOpenReferralLoader(false);
					initiateFinalRedirection();
				} else {
					// setOpenReferralLoader(false);
					// Check if we should retry
					if (retryCount < maxRetries) {
						retryCount++;
						setCurrStep(prev => (prev < 4 ? ((prev + 1) as 0 | 1 | 2 | 3 | 4) : prev));
						setTimeout(attemptCheck, 5000); // Retry after 5 seconds
					} else {
						setOpenReferralLoader(false);
						console.log('Max retries reached for checkBasicDetails');
						// Optional: Show a message to the user that we couldn't get their details
						toast.warning('Could not retrieve user details after multiple attempts', getToastOptions());
						setTimeout(() => {window.location.href =`/jobs`, { replace: true }}, 5000); // Redirect to the jobs page after 5 seconds
					}
				}
			}
		} catch (error) {
				console.error('Error fetching user basic details:', error);
				const params = import.meta.env.APP_WORKO_BASE_URL + '/jobs'
				setModalData({
					type: "error",
					heading: { message: "Something Went Wrong", type: "error" },
					message: "We encountered some issue while analysing your cv, Plese enter few details manually in your profile , It will help us understand your better & upload your cv again",
					buttons: [
					  { label: "Go To Dashboard", action: () => appHref(`/v1/candidate/edit-profile?returnUrl=${params}`) },
					],
				  });
			}
		};

		// Start the first attempt
		await attemptCheck();
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
				toast.error(error.message, getToastOptions());
				window.location.href = '/auth/login'; // Navigate to the login page if an error occurs
			} else {
				/**
				 * If the account is confirmed, proceed with the sign-in process
				 */
				if (response?.isSignedIn) {
					const email = data.email.toLowerCase();
					const { response: userResponse, error: userError } = await httpServiceObj.get<[{}]>(`/user/${email}/details`, true, {});

					if (userError) {
						toast.error('Error: ' + userError, getToastOptions());
						throw new Error();
					} else {
						// Extract the first element from the array response
						let user: Partial<AuthLoginForGeneralUserDto> = userResponse?.[0] || {};

						if (!user) {
							toast.error('Error: No user data found', getToastOptions());
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
						setUpdateCheck(prev => !prev);
						toast.success('Successfully signed in', getToastOptions());
						checkBasicDetails();
					}
				}
			}
		} catch (error: any) {
			toast.error(error?.message || 'Something went wrong', getToastOptions());
			// CognitoServiceObj.handleSignOut();
		}
	};

	/**
	 * handleVerifyOtp
	 */
	const handleVerifyOtp = async (email: string, otp: string, password: string) => {
		try {
			let signupform = {
				username: email,
				confirmationCode: otp,
			};
			let autoLoginData = {
				email: email,
				password: password,
			};
			// Call handleSignUpConfirmation and await the result
			const { response, error } = await CognitoServiceObj.handleSignUpConfirmation(signupform);

			// Check if the confirmation was successful
			if (response) {
				toast.success('User registered successfully', getToastOptions());
				await handleAutoLogin(autoLoginData);
				// Handle the confirmed sign-up as needed
				return { response: response };
			} else if (error) {
				throw error;
			}
			// If no response or error was encountered, return a default value
			throw new Error('Unexpected error: No response or error.');
		} catch (error: any) {
			toast.error(error.message, getToastOptions());
		}
	};

	/**
	 * CvS3MemAllocation
	 *
	 * @description This function is used to allocate the memory to the CV from dev server and return the URL to upload the CV
	 */
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const handleFileUpload = (file: File) => {
		setUploadedFile(file);
	};
	const CvS3MemAllocation = useCallback(
		async (userdata: any) => {
			const cvS3metaData = {
				userId: CognitoResponse?.userId || userdata.userId, // Ensure `CognitoResponse` is valid
				resumeUserFileName: resumeUserFileName || localStorage.getItem('resumeUserFileName'),
				resumeFileMimeType: resumeUserFileMimeType || localStorage.getItem('resumeUserFileMimeType'),
			};
			// debugger;
			const { response, error } = await httpServiceObj.post<AwsS3FileUploadResponse>('/file/gsu2u/USER_RESUME', cvS3metaData, true);

			if (error) {
				throw error;
			}

			// Upload to S3
			const metaData: FileUpload = {
				file: uploadedFile,
				awsS3Tag: response?.awsS3Tag,
			};

			const signedUrl: string = response?.awsS3SignedUrl || '';
			// debugger;
	/* 		console.log('signedUrl:', signedUrl);
			console.log('metaData:', metaData);
			console.log('cv:', uploadedFile); */
			if (!metaData.file || metaData.file.size === 0) {
				console.error('File is empty or undefined:', metaData.file);
				return;
			}

			const fileUploadHandler = await httpServiceObj.put<null>(signedUrl, metaData.file, false, { awsS3Tag: metaData.awsS3Tag, fileType: resumeUserFileMimeType }, true);

			if (fileUploadHandler.error) {
				// throw fileUploadHandler.error;
				console.error('Error uploading file:', fileUploadHandler);
			} else {
				// Patch the data to the backend
				// debugger;
				const finalEmail = formData.emailId.toLocaleLowerCase();
				// console.log("FINAL EMAILLLLL->>>>" + finalEmail);
				const CvNamePatchRequest = await httpServiceObj.patch<null>(`/user/${finalEmail}/cv`, { resume: response?.cloudFileName }, true);

				if (CvNamePatchRequest.status !== 200) {
					throw CvNamePatchRequest.error;
				} else {
					toast.success('CV uploaded successfully', getToastOptions());
				}
			}
		},
		[cv, uploadedFile]
	);

	/**
	 * mutateDatatoBackend
	 *
	 * @description This function is used to add the data to the backend
	 */
	const mutateDatatoBackend = useCallback(
		async (ClientId: string) => {
			// Check the mode and add the data accordingly
			// debugger;
			const AuthActiveFrame = localStorage.getItem('AuthActiveFrame');
			// console.log(`Difference between active frame and contextActiveFrame is ${activeFrame} and ${AuthActiveFrame}`);
			// prefer local over state
			const finalActiveFrame = AuthActiveFrame ? (AuthActiveFrame as SignupMode) : activeFrame;
			// patch the formData from the secure storage
			const localFormData = secureStorage.getItem<AuthFormDto>(SecureStorageKeyEnum.AUTHACTIVEFORMDATA);
			// debugger;
			if (localFormData) {
				formData.name = localFormData.name;
				formData.emailId = localFormData.email;
				formData.password = localFormData.password;
				formData.phoneNumber = localFormData.phone;
				formData.confirmPassword = localFormData.confirmPassword;
				formData.acceptedTermsAndConditions = localFormData.termsAndConditions;
			}
			if (finalActiveFrame === 'CAND') {
				// Add the data to the backend
				//debugger
				let candidateData: DevCandidateDto = {
					name: formData.name,
					email: formData.emailId,
					number: '+91' + formData.phoneNumber,
					userId: ClientId,
					CTC: formData.ctc,
					ECTC: formData.ectc,
					acceptedTermsAndConditions: formData.acceptedTermsAndConditions, // Include the acceptedTermsAndConditions field
				};
				// Add the data to the backend
				const { response, error } = await httpServiceObj.post('/user/register/candidate', candidateData, true);
				if (error) {
					throw error;
				} else {
					if (uploadedFile) {
						await CvS3MemAllocation(response);
					}
				}
			} else {
				const companyDetails = secureStorage.getItem<CompanyShortDto | null>(SecureStorageKeyEnum.AUTHEMPSELECTEDCOMPANY);

				let employeeData: DevEmployeeDto = {
					name: formData.name,
					email: formData.emailId,
					number: '+91' + formData.phoneNumber,
					YOE: 0,
					companyName: companyDetails?.name || '',
					companySK: companyDetails?.id || '',
					userId: ClientId,
					acceptedTermsAndConditions: formData.acceptedTermsAndConditions, // Include the acceptedTermsAndConditions field
				};

				// Add the data to the backend
				return await httpServiceObj.post('/user/register/employee', employeeData, true);
			}
		},
		[uploadedFile]
	);

	const runCognitoBasicSignup = async (data: AuthFormDto): Promise<boolean> => {
		try {
			metaDataFilter(data);

			let signupform = {
				password: formData.password,
				username: formData.emailId.toLowerCase(),
				name: formData.name,
				phone_number: '+91' + formData.phoneNumber,
			};

			const { response, error } = await CognitoServiceObj.handleSignUp(signupform);

			if (error) {
				if (error.name === 'UsernameExistsException') {
					toast.error('User already exists', getToastOptions());
				} else {
					toast.error(error.message, getToastOptions());
				}
				return false; // Explicitly return false
			}

			if (response?.userId) {
				CognitoResponse = response;

				// Safely handle the mutation process
				try {
					await toast.promise(
						mutateDatatoBackend(CognitoResponse.userId),
						{
							pending: 'Registering user...',
							success: 'User registered successfully',
							error: 'Error registering user',
						},
						getToastOptions()
					);
					toast.info('OTP sent to your email. Please verify it.', getToastOptions());
					return true; // Explicitly return true on success
				} catch (mutationError) {
					console.error('Error during backend mutation:', mutationError);
					return false; // Explicitly return false on mutation error
				}
			}

			return false; // If `response?.userId` is not present, return false
		} catch (err:any) {
			// debugger;
			console.log('An error occurred:', err);
			toast.error('Something went wrong'+ err, getToastOptions());
			return false; // Explicitly return false on general error
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
			formData.companySk = '';
		};
	}, [activeFrame]);

	return (
		<>
			<img src={auth_bg} alt="auth_bg" className="absolute -left-20 top-10 z-10 " />
			<img src={auth_bg2} alt="auth_bg2" className="absolute z-10  bottom-10 right-0" />
			<div className=" flex justify-center relative my-2 w-full  sm:max-w-[80vw] md:w-[80vw]  md:max-w-[1000px] overflow-hidden rounded-md mx-2 sm:rounded-3xl bg-white shadow z-20 ">
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
						<SignupForm activeFrame={activeFrame} runCognitoBasicSignup={runCognitoBasicSignup} handleVerifyOtp={handleVerifyOtp} verifyOtp={verifyOtp} onFileUpload={handleFileUpload} setCompanyName={setCompanyName} />
					</div>
				</div>
			</div>
			 {/* Show modal only when modalData is set */}
				  {modalData && (
					<MessageModal
					  {...modalData}
					  onClose={() => {
						setModalData(null);
					  }}
					  showCloseButton={false}
					/>
				  )}
				
			{OpenReferralLoader && <ReferralLoader step={currStep} />}
		</>
	);
};

export default Signup;
