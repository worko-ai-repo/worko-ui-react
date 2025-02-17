import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import CustomButtonWithButton from '../../Shared/CustomButtonWithButton';
import SignupForm, { AuthSessionDto } from './LinkedInSignupForm';
import { AuthFormDto, AuthSignupBaseDto, DevEmployeeDto, CognitoSignupResponse, DevCandidateDto, AwsS3FileUploadResponse, FileUpload } from '@Interfaces/Auth.dto';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import httpServiceObj from '@Services/ApiHandler.service';
import { auth_bg, auth_bg2, worko_new } from '@Assets';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '@Context/Main.context';
import {fetchAuthSession , getCurrentUser } from '@aws-amplify/auth';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import { SignupMode } from '../Signup/Signup';
import { LinkedinIcon } from 'lucide-react';



const LinkedInSignup = () => {
	const location = useLocation();
	const navigateTo = useNavigate();
	const { isLoggedIn } = useAppContext();
	const [activeFrame, setActiveFrame] = useState<SignupMode>('CAND');
	const [cv, setCv] = useState<any>();
	let resumeUserFileName: string;
	let resumeUserFileMimeType: string;
	const [companySk, setCompanySk] = useState<string>('');
	const [CompanyName, setCompanyName] = useState<string>('');

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
	 * fetchLinkedinSessionData - a callback function to fetch the linkedin session data
	 */
const fetchLinkedinSessionData = useCallback(async (): Promise<AuthSessionDto> => {
	let userEmail: string | undefined;
	let userName: string | undefined;
	let groupType: string[];
	let userId: string | undefined;
	try{
		const {	tokens  } = await fetchAuthSession();
		userEmail = tokens?.idToken?.payload['email']?.toString().toLowerCase()
		userName = tokens?.idToken?.payload['name']?.toString()
		groupType=tokens?.idToken?.payload['cognito:groups'] as string[]; //@Todo this may cause an error not sure if the response is an array or not need to debug this and remove this check
		
		if (Array.isArray(groupType) && groupType.includes('admin')) {
			secureStorage.setItem(SecureStorageKeyEnum.USERTYPE, 'Admin');
		  }
		  const {userId: id } = await getCurrentUser();
		  userId = id	  
		
		  return {
			name: userName!,
			email: userEmail!,
			cognitoId : userId
		}
		}
	catch(error:any){
		throw new Error('Error fetching linkedin session data' + error.message)
	}
}, []);

	/**
	 * check if the user is already logged in
	 */
	useLayoutEffect(() => {
		debugger;
		console.log('Linkedin location State is >>', location.state);
		if (!location.state) {
			navigateTo('/');
		}
		if (location.state.formType === 'CAND') {
			setActiveFrame('CAND');
		}
		if (location.state.formType === 'EMP') {
			setActiveFrame('EMP');
		}
	}, [isLoggedIn, location.state]);

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
	/**
	 * handleVerifyOtp
	 */
	const handleVerifyOtp = async (email: string, otp: string) => {
		try {
			let signupform = {
				username: email,
				confirmationCode: otp,
			};

			// Call handleSignUpConfirmation and await the result
			const { response, error } = await CognitoServiceObj.handleSignUpConfirmation(signupform);

			// Check if the confirmation was successful
			if (response) {
				toast.success('User registered successfully');
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
			debugger;
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
		<div className="sm:scale-90 flex justify-center  w-full mt-5 in-h-[650px]  md:min-w-[50%] sm:max-w-[80vw]  xl:max-w-[1120px] overflow-hidden rounded-md mx-2 sm:rounded-3xl bg-white shadow z-20 ">
			<img src={auth_bg} alt="auth_bg" className="absolute -left-20 top-10 z-10 " />
			<img src={auth_bg2} alt="auth_bg2" className="absolute z-10  bottom-10 right-0" />
			<div className=" flex justify-center relative w-full min-h-[700px] md:min-w-[50%]  max-w-[1120px] overflow-hidden rounded-lg bg-white shadow z-20 ">
				<div className="px-2 gap-2 py-5 sm:py-6  w-full flex flex-col ">
					{/* Header and toggle button */}
					<div className="  relative header flex justify-around bc flex-wrap w-full  items-baseline ">
						<p className="font-semibold text-sm md:text-xl text-gray-500 self-center my-2 "> Create your account as {activeFrame === 'EMP' ? 'employee' : 'candidate'} </p>
						{/* <LinkedinIcon className='self-center  bg-blue-500 text-white p-2 rounded-lg box-content ' /> */}
						<div className="relative flex items-center gap-2">
						<div className="flex items-center gap-2">
  <img src={worko_new} alt="LinkedIn" className="w-8 h-8" />
  <span className="text-xl font-bold">×</span>
  <img src={worko_new} alt="Tesla" className="w-8 h-8" />
</div>
						</div>
					</div>
					{/* Signup form */}
					<div className="scale-90 sm:scale-100  flex flex-1 sm:mx-auto sm:w-[85%] ">
						<SignupForm activeFrame={activeFrame} runCognitoBasicSignup={runCognitoBasicSignup} handleVerifyOtp={handleVerifyOtp} setCompanyName={setCompanyName} fetchLinkedinSessionData={fetchLinkedinSessionData} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default LinkedInSignup;
