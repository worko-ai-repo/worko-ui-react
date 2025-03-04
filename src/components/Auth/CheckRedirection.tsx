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

export default function CheckRedirection() {
	const navigate = useNavigate();
	const location = useLocation();
	const { setUpdateCheck, PendingApply, setPendingApply } = useAppContext();
	let isCandidatePresent: any;
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

				isCandidatePresent = await getCandidateDetails();
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
		if (isCandidatePresent) {
			navigate('/auth/linkedinSignup', { state: { formType: 'EMP' } });
		}
	};

	const candidateSignUp = async () => {
		if (isCandidatePresent) {
			navigate('/auth/linkedinSignup', { state: { formType: 'CAND' } });
		}
	};

	const signIn = async () => {
		// debugger;
		if (isCandidatePresent) {
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
				secureStorage.setItem(SecureStorageKeyEnum.USERTYPE, 'Admin');
			}
	
			// Step 4: Fetch User Details
			const { response: userDetails } = await httpServiceObj.get<UserDetails>(`/user/${email}/details`, true);
			if (!userDetails) return true;
	
			// Step 5: Store User Details in Secure Storage
			const userDetail: Partial<AuthLoginForGeneralUserDto> = userDetails?.[0];
			const FinaluserDetails: Partial<AuthLoginForGeneralUserDto> = {
				lastAccessedDash: userDetail.lastAccessedDash,
				name: userDetail.name,
				email: userDetail.email,
				id: userDetail.id,
				profileImageAwsS3SignedUrl: userDetail.profileImageAwsS3SignedUrl,
				referralCount: userDetail.referralCount,
			};
			secureStorage.setItem(SecureStorageKeyEnum.IS_LINKEDIN_USER, 'true');
			secureStorage.setItem(SecureStorageKeyEnum.LASTACCESSED_DASH, userDetail.lastAccessedDash);
			secureStorage.setItem(SecureStorageKeyEnum.USERNAME, userDetail.name);
			secureStorage.setItem(SecureStorageKeyEnum.USEREMAIL, email);
			secureStorage.setItem<Partial<AuthLoginForGeneralUserDto>>(SecureStorageKeyEnum.LOGINDETAILS, FinaluserDetails);
	
			// Step 6: Handle Dynamic Routes (If Coming From Company Listing)
			const isCompanyListingRoute = secureStorage.getItem(SecureStorageKeyEnum.IS_COMPANY_LISTING_ROUTE);
			if (isCompanyListingRoute) {
				const dynamicRoute = secureStorage.getItem(SecureStorageKeyEnum.DYNAMIC_ROUTE);
				if (typeof dynamicRoute === 'string') {
					navigate(decodeURIComponent(dynamicRoute));
				}
				return false;
			}
	
			// Step 7: Redirect Admin Users to Switcher Page
			if (Array.isArray(groups) && groups.includes('admin')) {
				navigate('/switcher');
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
	
				// Step 10: Determine Navigation Path Based on Profile Percentage
				let dashboardPath =
					userDetail.lastAccessedDash === 'CAND'
						? totalPercentage >= 60
							? '/candidate/dashboard'
							: '/candidate/edit-profile'
						: totalPercentage >= 60
						? '/employee/Dashboard'
						: '/employee/Edit-profile';
	
				// Step 11: If Total Percentage >= 60, Check Pending Application
				if (totalPercentage >= 60) {
					let pendingReferral =
						PendingApply || secureStorage.getItem<continueReferralRequestDataDto>(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA);
	
					// Sync PendingApply and SecureStorage
					if (PendingApply) {
						secureStorage.setItem(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA, PendingApply);
						window.location.href = PendingApply.url; // Redirect to referral page
						return false; // Stop further execution
					} else if (pendingReferral) {
						setPendingApply(pendingReferral);
						window.location.href = pendingReferral.url; // Redirect if referral found in storage
						return false; // Stop further execution
					}
				}
	
				// Step 12: Navigate to Dashboard or Edit Profile if No Pending Application
				navigate(dashboardPath);
			}
	
			return false;
		} catch (error) {
			console.error('Error getting candidate details:', error);
			return true;
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
