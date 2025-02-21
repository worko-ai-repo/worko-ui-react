import { useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import CognitoServiceObj from '@Utils/Cognito.utils';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import { toast } from 'react-toastify';

/**
 * Custom hook for handling LinkedIn signup/signin
 * @returns A callback function that initiates LinkedIn OAuth flow
 */
const useLinkedInSignup = () => {
	const location = useLocation();

	return useCallback(
		async (userType: string) => {
			try {
				const currentUrl = location.pathname;

				// Define regex for company/job-related routes
				const jobRoutePattern = /^(\/company\/jobs\/[^/]+-jobs(?:\/[^/]+-[A-Za-z0-9]+)?|\/company\/jobs\/[^/]+-jobs-[A-Za-z0-9]+|\/[^/]+-jobs)$/;

				const isCompanyRoute = jobRoutePattern.test(currentUrl);

				// Store route information if needed
				if (isCompanyRoute) {
					secureStorage.setItem(SecureStorageKeyEnum.IS_COMPANY_LISTING_ROUTE, 'true');
					secureStorage.setItem(SecureStorageKeyEnum.DYNAMIC_ROUTE, currentUrl);
				} else {
					secureStorage.remove(SecureStorageKeyEnum.IS_COMPANY_LISTING_ROUTE);
					secureStorage.remove(SecureStorageKeyEnum.DYNAMIC_ROUTE);
				}

				// Store user type
				secureStorage.setItem(SecureStorageKeyEnum.LINKEDINUSERTYPE, userType);
				secureStorage.setItem(SecureStorageKeyEnum.REDACTED_SECRET, 'true');

				const Toast = await CognitoServiceObj.isLoggedIn();
      			// toast.info(`Is user logged In : ${Toast}`);
			
				// Initiate LinkedIn OAuth flow
				await CognitoServiceObj.handleSocialSignIn();
			
			} catch (error: any) {
				toast.error(error.message);
				console.error('LinkedIn sign in error:', error);
				throw error;
			}
		},
		[location.pathname]
	);
};

export default useLinkedInSignup;
