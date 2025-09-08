import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchAuthSession } from '@aws-amplify/auth';
import { useQuery } from '@tanstack/react-query';
import secureStorage from '@Utils/SecureStorage.utils';

import CognitoServiceObj from '@Utils/Cognito.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import httpServiceObj from '@Services/ApiHandler.service';
import { LinkedinIcon } from 'lucide-react';
import { useAppContext } from '@Context/App.context';
import { AuthLoginForGeneralUserDto } from '@Interfaces/Auth.dto';
import { continueReferralRequestDataDto } from '@Pages/request-referral/RequestReferral';
import { useCrossAppAuth } from '@Hooks/useCrossAppAuth.hook';
import { NormalizedUser, normalizeUserData } from '@Utils/NormalizeUser';
import { UserRole } from '@Interfaces/RoleBasedAccessControl';

export default function CheckRedirection() {
	const navigate = useNavigate();
	const location = useLocation();
	const appHref = useCrossAppAuth();

	const { setUpdateCheck, PendingApply, setPendingApply, setUserDetails } = useAppContext();
	let isCandidateNotPresent: any;
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

	// Define the type for profile completion
	type ProfileCompletion = {
		candidate: { curPerc: number }[];
		employee: { curPerc: number }[];
	};

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

				isCandidateNotPresent = await getCandidateDetails();
				// debugger;
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
		if (isCandidateNotPresent) {
			navigate('/auth/linkedinSignup', { state: { formType: 'EMP' } });
		}
	};

	const candidateSignUp = async () => {
		if (isCandidateNotPresent) {
			navigate('/auth/linkedinSignup', { state: { formType: 'CAND' } });
		}
	};

	const signIn = async () => {
		// debugger;
		if (isCandidateNotPresent) {
			setRegisterOptionScreen(true);
			handleRegister();
		}
	};

	const getCandidateDetails = async (): Promise<boolean> => {
		try {
			// Step 1: Get Auth Session
			const { tokens } = await fetchAuthSession();
			const email = tokens?.idToken?.payload['email']?.toString().toLowerCase();
			const name = tokens?.idToken?.payload['given_name']?.toString();
			const groups = tokens?.idToken?.payload['cognito:groups'] as string[];

			// Step 2: Store User Data
			if (email) setUserEmail(email);
			if (name) setUserName(name);

			// Step 3: Store Admin Status in Secure Storage
			if (Array.isArray(groups) && groups.includes('admin')) {
				secureStorage.setItem(SecureStorageKeyEnum.USERTYPE, [UserRole.ADMIN]);
			}

			// Step 4: Fetch User Details
			const { response: userDetails } = await httpServiceObj.get<UserDetails>(`/user/${email}/details`, true);
			if (!userDetails) return true;

			// Step 5: Store User Details in Secure Storage
			// const userDetail: Partial<AuthLoginForGeneralUserDto> = userDetails?.[0];
			const userDetail: NormalizedUser = normalizeUserData( userDetails?.[0]);
			setUserDetails(userDetail);
			
			secureStorage.setItem(SecureStorageKeyEnum.REDACTED_SECRET, 'true');
			secureStorage.setItem(SecureStorageKeyEnum.LASTACCESSED_DASH, userDetail.lastAccessedDash);
			secureStorage.setItem(SecureStorageKeyEnum.USERNAME, userDetail.fullName);
			secureStorage.setItem(SecureStorageKeyEnum.USEREMAIL, email);
			secureStorage.setItem<NormalizedUser>(SecureStorageKeyEnum.LOGINDETAILS, userDetail);

			// Step 6: Handle Dynamic Routes (If Coming From Company Listing)
			const isCompanyListingRoute = secureStorage.getItem(SecureStorageKeyEnum.IS_COMPANY_LISTING_ROUTE);
			if (isCompanyListingRoute) {
				const dynamicRoute = secureStorage.getItem(SecureStorageKeyEnum.DYNAMIC_ROUTE);
				if (typeof dynamicRoute === 'string') {
					navigate(decodeURIComponent(dynamicRoute));
				}
				return false;
			}

			// Step 8: Get Profile Completion Percentage
			const { response: profileCompletion } = await httpServiceObj.get<ProfileCompletion>(
				`/user/${email}/profilePercentage`,
				true
			);
			if (profileCompletion) {
				const profileType =
					userDetail.lastAccessedDash === 'CAND' ? profileCompletion.candidate : profileCompletion.employee;
				const totalPercentage = profileType.reduce((sum: number, element: { curPerc: number }) => sum + element.curPerc, 0);

				// Step 9: Set update check before navigation
				setUpdateCheck(true);

				// construct the dashboard path based on the last accessed dashboard
				let dashboardPath = totalPercentage >= 60
					? '/'
					: userDetail.lastAccessedDash === 'CAND'
					
						? `${window.location.origin}/${import.meta.env.APP_PROXY_DASH}/candidate/profile`
						: `${window.location.origin}/${import.meta.env.APP_PROXY_DASH}/employee/profile`;

	
				// Step 10: If Total Percentage >= 60, Check Pending Application
				if (totalPercentage >= 60) {
					// Step 11: Check Pending Application
					let pendingReferral =
						PendingApply || secureStorage.getItem<continueReferralRequestDataDto>(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS);

					// Sync PendingApply and SecureStorage
					if (PendingApply) {
						secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
						window.location.href = PendingApply.url; // Redirect to referral page
						return false; // Stop further execution
					} else if (pendingReferral) {
						setPendingApply(pendingReferral);
						window.location.href = pendingReferral.url; // Redirect if referral found in storage
						return false; // Stop further execution
					}
					else {
						navigate(dashboardPath);
						return false; // Stop further execution
					}
				}
				else {
					appHref(dashboardPath) // Redirect to Angular app
					return false; // Stop further execution
				}
			}
			navigate('/jobs');
			return false;
		} catch (error) {
			console.error('Error getting candidate details:', error);
			return false;
		}
	};


	const handleRegister = () => {
		if (registrationType === 'candidate') {
			navigate('/auth/linkedinSignup', { state: { formType: 'CAND' } });
		} else if (registrationType === 'employee') {
			navigate('/auth/linkedinSignup', { state: { formType: 'EMP' } });
		}
	};

	
	/**registerOptionScreen */
	if (registerOptionScreen) {
		return (
			<div className="bg-white min-w-[300px] max-w-[400px]  p-8 rounded-lg shadow-md">
				<div className="heading text-left ">
					<div className="flex justify-between items-start ">
						<h2 className="text-xl text-left font-bold mb-4 ">Select Account Type</h2>
						<LinkedinIcon className="  bg-blue-500 text-white p-2 w-4 h-4   rounded-lg box-content " />
					</div>
					<p className="font-medium text-gray-500 text-sm">
						It appears you're not yet part of our registered user community. No need to fret! Joining is a breeze.
						<br />
						<br /> Continue sign up as :<br />
						<br />
					</p>
				</div>
				<div className="space-y-4">
					<div className="flex gap-4 ">
						<button onClick={() => setRegistrationType('candidate')} className={`w-full p-2 drop-shadow-lg  rounded-lg ${registrationType === 'candidate' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
							Candidate
						</button>
						<button onClick={() => setRegistrationType('employee')} className={`w-full p-2 drop-shadow-lg  rounded-lg ${registrationType === 'employee' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
							Employee
						</button>
					</div>
					<button onClick={handleRegister} className="w-full btn_primary" disabled={!registrationType}>
						Continue
					</button>
				</div>
			</div>
		);
	}
}
