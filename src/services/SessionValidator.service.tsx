import { Navigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { UnauthorizedAccessError } from '@Utils/ErrorBoundary.utils';
import ErrorFallback from '@Pages/errors/base-error/ErrorFallback';
import { UserRole } from '@Interfaces/RoleBasedAccessControl';

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
 * Interface defining the props for the ProtectedRoute component.
 * @property {JSX.Element} element - The component/element to render if the user is authorized.
 * @property {UserRole[]} [requiredRoles] - Optional array of roles that are allowed to access this route.
 */
interface ProtectedRouteProps {
	element: JSX.Element;
	requiredRoles?: UserRole[];
	tokenRequired?: boolean; 
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
 * @param {UserRole[]} [requiredRoles] - Optional roles required for access
 * @returns {JSX.Element} Either the protected component or a redirect
 */

const ProtectedRoute = ({
	element,
	requiredRoles,
	tokenRequired = true,
}: ProtectedRouteProps) => {
	const token: any = CognitoServiceObj.getAccessToken();
	const userType = secureStorage.getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE);

	const currentTime = Date.now() / 1000;

	//  Step 1: If token is required but not present
	if (tokenRequired && !token) {
		if (requiredRoles?.includes(UserRole.CORPORATE)) {
			return <Navigate to="/auth/corporate/login" />;
		}
		return <Navigate to="/auth/login" />;
	}

	//  Step 2: If token is present, validate it
	if (token) {
		try {
			const decodedToken: JwtPayload & { role?: string } = jwtDecode(token);

			if (decodedToken.exp && decodedToken.exp < currentTime) {
				return <Navigate to="/auth/login" />;
			}
		} catch (err) {
			console.error("Error decoding token:", err);
			return <ErrorFallback error={err instanceof Error ? err : undefined} />;
		}
	}

	//  Step 3: Check role if requiredRoles is specified
	if (requiredRoles?.length) {
		// If no userType (i.e. not logged in), and token is not required, allow access (as anonymous user)
		if (!userType && !tokenRequired) {
			// Allow access if no token but general users are allowed anonymously
			if (requiredRoles.includes(UserRole.GENERAL_USER)) {
				return element;
			}
			return <Navigate to="/auth/login" />;
		}
		if (Array.isArray(userType) && !userType.some(role => requiredRoles.includes(role))) {
			return (
				<ErrorFallback
					error={
						new UnauthorizedAccessError(
							userType.includes(UserRole.GENERAL_USER) ? UserRole.GENERAL_USER : userType[0]
						)
					}
				/>
			);
		}
	}
	return element;
};

export default ProtectedRoute;