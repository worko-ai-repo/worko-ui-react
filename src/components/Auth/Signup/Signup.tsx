import { useCallback, useEffect, useState } from 'react';
import CustomButtonWithButton from '../../Shared/CustomButtonWithButton';
import SignupForm from './SignupForm';
import { AuthFormDto, AuthSignupBaseDto, DevEmployeeDto, CognitoSignupResponse, DevCandidateDto, AwsS3FileUploadResponse, FileUpload } from '@Interfaces/Auth.dto';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';
import httpServiceObj from '@Services/ApiHandler.service';
import { auth_bg, auth_bg2 } from '@Assets';

export type SignupMode = 'EMP' | 'CAND';
const Signup = () => {
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
		debugger;
		const fileUploadHandler = await httpServiceObj.put<null>(signedUrl, metaData.file, false, { awsS3Tag: metaData.awsS3Tag, fileType: resumeUserFileMimeType }, true);

		if (fileUploadHandler.error) {
			throw fileUploadHandler.error;
		} else {
			// Patch the data to the backend
			debugger;
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
			debugger;
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

			const { response, error } = await CognitoServiceObj.handleSignUp(signupform);

			if (error) {
				throw error;
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
		<div className=" flex justify-center  w-full min-h-[700px] md:min-w-[50%]  max-w-[1120px] overflow-hidden rounded-3xl bg-white shadow z-20 ">
			<img src={auth_bg} alt="auth_bg" className="absolute -left-20 top-10 z-10 " />
			<img src={auth_bg2} alt="auth_bg2" className="absolute z-10  bottom-10 right-0" />
			<div className=" flex justify-center relative w-full min-h-[700px] md:min-w-[50%]  max-w-[1120px] overflow-hidden rounded-lg bg-white shadow z-20 ">
				<div className="px-4 gap-2 py-5 sm:p-6  w-full flex flex-col ">
					{/* Header and toggle button */}
					<div className=" relative header flex justify-around flex-wrap w-full  items-center ">
						<p className="font-semibold text-sm md:text-xl text-gray-500 self-center mt-2 "> Create your account as </p>
						{/* onToggleChange={setActiveFrame} activeFrame={activeFrame} */}
						<div className="w-[90vw] sm:w-fit   min-w-[50%] sm:pl-16 ">
							<CustomButtonWithButton options={options} activeFrame={activeFrame} setActiveFrame={setActiveFrame} />
						</div>
					</div>
					{/* Signup form */}
					<div className="flex  flex-1 mx-auto sm:w-[80%] ">
						<SignupForm activeFrame={activeFrame} runCognitoBasicSignup={runCognitoBasicSignup} handleVerifyOtp={handleVerifyOtp} verifyOtp={verifyOtp} setCompanyName={setCompanyName} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Signup;
