import { useLocation } from "react-router-dom";
import { useCallback } from "react";
import { signInWithRedirect } from '@aws-amplify/auth';
import CognitoServiceObj from "@Utils/Cognito.utils";

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
        const jobRoutePattern =
          /^(\/company\/jobs\/[^/]+-jobs(?:\/[^/]+-[A-Za-z0-9]+)?|\/company\/jobs\/[^/]+-jobs-[A-Za-z0-9]+|\/[^/]+-jobs)$/;

        const isCompanyRoute = jobRoutePattern.test(currentUrl);

        // Store route information if needed
        if (isCompanyRoute) {
          localStorage.setItem("isCompanyListingRoute", "true");
          localStorage.setItem("dynamicRoute", currentUrl);
        } else {
          localStorage.removeItem("isCompanyListingRoute");
          localStorage.removeItem("dynamicRoute");
        }

        // Store user type
        localStorage.setItem("LinkedinUserType", userType);
        localStorage.setItem("REDACTED_SECRET", "true");

        // Initiate LinkedIn OAuth flow
         await CognitoServiceObj.handleSocialSignIn()
       /*  await signInWithRedirect({ 
          provider: { 
            custom: 'LinkedIn'
          }
        }); */

      } catch (error) {
        console.error('LinkedIn sign in error:', error);
        throw error;
      }
    },
    [location.pathname]
  );
};

export default useLinkedInSignup;
