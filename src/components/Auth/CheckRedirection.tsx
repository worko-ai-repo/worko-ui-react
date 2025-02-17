import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAuthSession} from '@aws-amplify/auth';
import { useQuery } from '@tanstack/react-query';
import secureStorage from '@Utils/SecureStorage.utils';

import CognitoServiceObj from '@Utils/Cognito.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import httpServiceObj from '@Services/ApiHandler.service';
import { LinkedinIcon } from 'lucide-react';


export default function CheckRedirection() {
	const navigate = useNavigate();
	const location = useLocation();
	let isCandidatePresent :any ;
	const [registrationType, setRegistrationType] = useState<'candidate' | 'employee' | ''>('');
	const [userEmail, setUserEmail] = useState<string>('');
	const [userName, setUserName] = useState<string>('');
	const [registerOptionScreen, setRegisterOptionScreen] = useState(false);

	// Define the type for user details
	type UserDetails = {
		lastAccessedDash: string;
		name: string;
		[key: string]: any;
	};

	// Fetch user details query
	const { data: userDetails, error: userError } = useQuery<UserDetails>({
		queryKey: ['userDetails', userEmail],
		queryFn: async () => {
			const { response, error } = await httpServiceObj.get<UserDetails>(`user/${userEmail}/details`, true);
			if (error) {
				throw new Error(error.message);
			}
			return response as UserDetails;
		},
		enabled: !!userEmail, //Only run when the userEmail is present 
		retry: 1,
	});

	// Define the type for profile completion
	type ProfileCompletion = {
		candidate: { curPerc: number }[];
		employee: { curPerc: number }[];
	};

	// Fetch profile completion query
	const { data: profileCompletion } = useQuery<ProfileCompletion>({
		queryKey: ['profileCompletion', userEmail],
		queryFn: async () => {
			const { response } = await httpServiceObj.get<ProfileCompletion>(`user/${userEmail}/profilePercentage`, true);
			return response as ProfileCompletion;
		},
		enabled: !!userEmail && !!userDetails,
		retry: 1,
	});

	/**
	 * useEffect that will run after we are redirect back by linkedin signin or you can say on page mount 
	 */
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const code = params.get('code');

		// Infer action
		if (code) {
			executeProperAction('checkRedirection'); // Assume it's a login redirection
		} else {
			executeProperAction('logout'); // If no code is found, assume logout
		}
	}, [location.search]);

	/**
	 * executeProperAction
	 * 
	 * @description - A function that will check if the action by linkedIn is for logout or sign up/In and will take action according to that.
	 * @param action 
	 */
	const executeProperAction = async (action: 'checkRedirection' | 'logout') => {
		try {
			if (action === 'checkRedirection') {
				await handleCheckRedirection();
			} else if (action === 'logout') {
				await handleLogout();
			}
		} catch (error) {
			console.error('Error executing action:', error);
		}
	};

	/**
	 * handleCheckRedirection 
	 * 
	 * @description - This will exec only when the user has opt for signup/In and will store the token and proceed to signin if the user is present in cognito else signUp
	 */
	const handleCheckRedirection = async () => {
		try {
			const { tokens } = await fetchAuthSession();
			const accessToken = tokens?.accessToken?.toString();

			if (accessToken) {
				secureStorage.setItem(SecureStorageKeyEnum.ACCESSTOKEN, accessToken);

				const userType = secureStorage.getItem(SecureStorageKeyEnum.LINKEDINUSERTYPE);
				
				isCandidatePresent = await getCandidateDetails();

				if (userType === 'employeeSignUp') {
					await employeeSignUp();
				} else if (userType === 'candidateSignUp') {
					await candidateSignUp();
				} else {
					await signIn();
				}
			}
		} catch (error) {
			console.error('Redirection error:', error);
		}
	};

	const handleLogout = async () => {
		try {
			await CognitoServiceObj.handleSignOut();
			// navigate('/');
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const employeeSignUp = async () => {
		if (isCandidatePresent) {
			navigate('/auth/linkedinSignup', {state:{formType: 'EMP'}});
		}
	};

	const candidateSignUp = async () => {
		if (isCandidatePresent) {
			navigate('/auth/linkedinSignup' , {state:{formType: 'CAND'}} );
		}
	};

	const signIn = async () => {
		if (isCandidatePresent) {
			setRegisterOptionScreen(true);
		}
	};

	const getCandidateDetails = async (): Promise<boolean> => {
		try {
			// Get the token form the amplify -auth
			const { tokens } = await fetchAuthSession();
			// Store the data in the vars 
			const email = tokens?.idToken?.payload['email']?.toString().toLowerCase();
			const name = tokens?.idToken?.payload['given_name']?.toString();
			const groups = tokens?.idToken?.payload['cognito:groups'] as string[];

			// set the username and email for Backend Api call dynamodb
			if (email) setUserEmail(email);
			if (name) setUserName(name);

			if (Array.isArray(groups) && groups.includes('admin')) {
				secureStorage.setItem(SecureStorageKeyEnum.USERTYPE, 'Admin');
			}

			// once the user email is set it will fetch the data related to use to check if the dynamodb has the data or not related to user if not then we will return true 
			if (!userDetails || userError) {
				return true;
			}

			// if the userDetail is present then we will move to navigate the user to dashboard
			const userDetail = userDetails;
			secureStorage.setItem(SecureStorageKeyEnum.IS_LINKEDIN_USER, 'true');
			secureStorage.setItem(SecureStorageKeyEnum.LASTACCESSED_DASH, userDetail.lastAccessedDash);
			secureStorage.setItem(SecureStorageKeyEnum.USERNAME, userDetail.name);
			secureStorage.setItem(SecureStorageKeyEnum.USEREMAIL, email);

			const isCompanyListingRoute = secureStorage.getItem(SecureStorageKeyEnum.IS_COMPANY_LISTING_ROUTE);

			if (isCompanyListingRoute) {
				const dynamicRoute = secureStorage.getItem(SecureStorageKeyEnum.DYNAMIC_ROUTE);
				if (typeof dynamicRoute === 'string') {
					navigate(decodeURIComponent(dynamicRoute));
				}
				return false;
			}

			// If we have an account that has admin access then we will move him to switcher page 
			if (groups.includes('admin')) {
				navigate('/switcher');
				return false;
			}

			if (profileCompletion) {
				const profileType = userDetail.lastAccessedDash === 'CAND' ? profileCompletion.candidate : profileCompletion.employee;

				const totalPercentage = profileType.reduce((sum: number, element: { curPerc: number }) => sum + element.curPerc, 0);

				if (userDetail.lastAccessedDash === 'CAND') {
					navigate(totalPercentage >= 60 ? '/candidate/dashboard' : '/candidate/edit-profile');
				} else {
					navigate(totalPercentage >= 60 ? '/employee/Dashboard' : '/employee/Edit-profile');
				}
			}

			return false;
		} catch (error) {
			console.error('Error getting candidate details:', error);
			return true;
		}
	};

	const handleRegister = () => {
		if (registrationType === 'candidate') {
			navigate('/auth/linkedinSignup' , {state:{formType: 'CAND'}} );
		} else if (registrationType === 'employee') {
			navigate('/auth/linkedinSignup', {state:{formType: 'EMP'}});
		}
	};
	/**registerOptionScreen */
	if (true) {
		return (
			<div className="bg-white min-w-[300px] max-w-[400px]  p-8 rounded-lg shadow-md">
				<LinkedinIcon className='mx-auto mb-3  bg-blue-500 text-white p-2 rounded-lg box-content ' />
				<div className="heading text-center ">
					<h2 className="text-2xl text-center font-bold mb-4">Select Account Type</h2>
					<p>
						It appears you're not yet part of our registered user community. No need to fret! Joining is a breeze.
						<br />
						<br /> Continue sign up as :<br />
						<br />
					</p>
				</div>
				<div className="space-y-4">
					<button onClick={() => setRegistrationType('candidate')} className={`w-full p-2 rounded-lg ${registrationType === 'candidate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
						Candidate
					</button>
					<button onClick={() => setRegistrationType('employee')} className={`w-full p-2 rounded-lg ${registrationType === 'employee' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
						Employee
					</button>
					<button onClick={handleRegister} className="w-full btn_primary" disabled={!registrationType}>
						Continue
					</button>
				</div>
			</div>
		);
	}
}
