import { Navigate } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import CognitoServiceObj from '@Utils/Cognito.utils';
import { UnauthorizedAccessError } from '@Utils/ErrorBoundary.utils';
import ErrorFallback from '@Pages/errors/base-error/ErrorFallback';
import { UserRole } from '@Interfaces/RoleBasedAccessControl';
import { useState, useEffect } from 'react';

interface ProtectedRouteProps {
  element: JSX.Element;
  requiredRoles?: UserRole[];
  tokenRequired?: boolean;
}

const ProtectedRoute = ({
  element,
  requiredRoles,
  tokenRequired = true,
}: ProtectedRouteProps) => {
  // Track whether we've finished the async auth check
  const [authStatus, setAuthStatus] = useState<'pending' | 'ok' | 'expired' | 'no-token' | 'error'>('pending');
  const [decodeError, setDecodeError] = useState<Error | undefined>();

  const userType = secureStorage.getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE);

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      // 1. Try to get a fresh token via Amplify session (no UI flash)
      //    This resolves immediately if token is still valid, or refreshes it if needed.
      try {
        const synced = await CognitoServiceObj.sessionSync(false);
        if (cancelled) return;

        if (!synced) {
          setAuthStatus(tokenRequired ? 'no-token' : 'ok');
          return;
        }
      } catch {
        if (cancelled) return;
        setAuthStatus(tokenRequired ? 'no-token' : 'ok');
        return;
      }

      // 2. Now read the freshly-synced token
      const token = CognitoServiceObj.getAccessToken();

      if (tokenRequired && !token) {
        setAuthStatus('no-token');
        return;
      }

      if (token) {
        try {
          const decoded: JwtPayload = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            // Token still expired even after sync attempt — genuine expiry
            setAuthStatus('expired');
            return;
          }
        } catch (err) {
          setDecodeError(err instanceof Error ? err : undefined);
          setAuthStatus('error');
          return;
        }
      }

      setAuthStatus('ok');
    };

    verifyAuth();
    return () => { cancelled = true; };
  }, []); // Runs once on mount (each navigation mounts a fresh instance)

  // --- Render states ---

  if (authStatus === 'pending') {
    // Don't render anything (or a spinner) while we verify
    // This prevents the flicker/redirect race condition
    return null; // or <PageLoader /> if you have one
  }

  if (authStatus === 'error') {
    return <ErrorFallback error={decodeError} />;
  }

  if (authStatus === 'no-token') {
    alert("You must be logged in to access this page.");
    return requiredRoles?.includes(UserRole.CORPORATE)
      ? <Navigate to="/auth/corporate/login" />
      : <Navigate to="/auth/login" />;
  }

  if (authStatus === 'expired') {
    alert("Your session has expired. Please log in again.");
    return <Navigate to="/auth/login" />;
  }

  // Role check (same as before, runs only when authStatus === 'ok')
  if (requiredRoles?.length) {
    if (!userType && !tokenRequired) {
      return requiredRoles.includes(UserRole.GENERAL_USER)
        ? element
        : <Navigate to="/auth/login" />;
    }
    if (Array.isArray(userType) && !userType.some(role => requiredRoles.includes(role))) {
      return (
        <ErrorFallback
          error={new UnauthorizedAccessError(
            userType.includes(UserRole.GENERAL_USER) ? UserRole.GENERAL_USER : userType[0]
          )}
        />
      );
    }
  }

  return element;
};

export default ProtectedRoute;