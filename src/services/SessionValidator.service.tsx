import { Navigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';

interface ProtectedRouteProps {
	component: React.ComponentType;
	requiredRoles?: string[]; // Array of roles allowed to access the route
}

/**
 * ProtectedRoute
 *
 * @description A wrapper for the Route component that checks if the user is authenticated and has the required roles to access the route
 *
 * @param {ProtectedRouteProps} { component: Component, requiredRoles, ...rest }
 *
 * @example
 *  //Protected Routes
 *  <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
 *  <Route path="/admin" element={<ProtectedRoute component={AdminPage} requiredRoles={['admin']} />} />
 * @returns
 */
const ProtectedRoute = ({ component: Component, requiredRoles, ...rest }: ProtectedRouteProps) => {
	// Get the token from secure storage
	const token:any = secureStorage.getItem(SecureStorageKeyEnum.USERTOKEN);

	if (!token) {
		// console.log('Token not found. Redirecting to login.');
		return <Navigate to="/login" />;
	}

	try {
		// Decode the token
		const decodedToken: JwtPayload & { role?: string } = jwtDecode(token);
		const currentTime = Date.now() / 1000; // Convert to seconds

		// Check if the token is expired
		if (decodedToken.exp && decodedToken.exp < currentTime) {
			// console.log('Token has expired. Redirecting to login.');
			return <Navigate to="/login" />;
		}

		// Check for required roles if specified
		if (requiredRoles && (!decodedToken.role || !requiredRoles.includes(decodedToken.role))) {
			// console.log('User does not have the required role. Redirecting to unauthorized page.');
			return <Navigate to="/unauthorized" />;
		}

		// Render the component if all checks pass
		localStorage.setItem('isLoggedIn', 'true');
		return <Component {...rest} />;
	} catch (error) {
		console.error('Error decoding token:', error);
		return <Navigate to="/login" />;
	}
};

export default ProtectedRoute;
