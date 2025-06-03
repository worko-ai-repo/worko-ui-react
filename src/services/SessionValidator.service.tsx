import { Navigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { UnauthorizedAccessError } from '@Utils/ErrorBoundary.utils';
import ErrorFallback from '@Pages/errors/base-error/ErrorFallback';

/**
 * Interface defining the structure of a decoded Cognito token.
 * 
 * This interface represents the payload of a JWT token issued by Amazon Cognito.
 * It includes standard claims as well as custom claims specific to the application.
 */
export interface DecodedCognitoToken {
	sub: string;
	"cognito:groups"?: string[];
	email_verified: boolean;
	iss: string;
	phone_number_verified: boolean;
	"cognito:username": string;
	origin_jti: string;
	aud: string;
	event_id: string;
	token_use: string;
	auth_time: number;
	name: string;
	phone_number: string;
	exp: number;
	iat: number;
	jti: string;
	email: string;
}
/**
 * Custom userType for the users
 */
type CustomUserType = 'Admin' | 'Corporate' | 'General_Users';

/**
 * Interface defining the props for the ProtectedRoute component.
 * @property {JSX.Element} element - The component/element to render if the user is authorized.
 * @property {string[]} [requiredRoles] - Optional array of roles that are allowed to access this route.
 */
interface ProtectedRouteProps {
	element: JSX.Element;
	requiredRoles?: CustomUserType[];
}

/**
 * A component that protects routes by checking authentication and authorization.
 * This component performs the following checks:
 * 1. Verifies if a user token exists
 * 2. Validates that the token hasn't expired
 * 3. Checks if the user has the required role (if specified)
 * 
 * If any check fails, the user is redirected to the appropriate page.
 * 
 * @param {JSX.Element} element - The component to render if authorization passes
 * @param {string[]} [requiredRoles] - Optional roles required for access
 * @returns {JSX.Element} Either the protected component or a redirect
 */
const ProtectedRoute = ({ element, requiredRoles }: ProtectedRouteProps) => {
	// Retrieve user token from Cognito storage
	const token: any = CognitoServiceObj.getAccessToken();

	// If no token exists, redirect to login page
	if (!token) {
		// Checking roles with includes for better array handling
		switch (true) {
		  case !requiredRoles:
		  case requiredRoles?.includes('General_Users'):
		  case requiredRoles?.includes('Admin'):
			return <Navigate to="/auth/login" />;
			
		  case requiredRoles?.includes('Corporate'):
			return <Navigate to="/auth/corporate/login" />;
			
		  default:
			return <Navigate to="/auth/login" />;
		}
	  }
	  
	try {
		// Decode JWT token to access payload information
		const decodedToken: JwtPayload & { role?: string } = jwtDecode(token);
		const userType = secureStorage.getItem<CustomUserType>(SecureStorageKeyEnum.USERTYPE) || 'General_Users'; //@Visit 340 of Cognito.utils.tsx
		console.log('Decoded Token:', decodedToken);
		console.log('User Type:', userType);
		
		const currentTime = Date.now() / 1000;
		
		// Check if token has expired (exp is in seconds since epoch)
		if (decodedToken.exp && decodedToken.exp < currentTime) {
			 return <Navigate to="/auth/login" />;
		}
		
		// Check if user has the required role for this route
		if (requiredRoles && (!userType || !requiredRoles.includes(userType))) {
			if (userType === 'Corporate') {
				throw new UnauthorizedAccessError('Corporate');
			} else if (userType === 'Admin') {
				throw new UnauthorizedAccessError('Admin');
			} else {
				throw new UnauthorizedAccessError('General');
			}
		}
		
		// User is authenticated and authorized, mark as logged in
		// localStorage.setItem('isLoggedIn', 'true');

		// Render the protected component
		return element;
	} catch (error) {
		// Handle errors during token decoding
		console.error('Error decoding token:', error);
		return <ErrorFallback error={error instanceof Error ? error : undefined} />;
	}
};
export default ProtectedRoute;
