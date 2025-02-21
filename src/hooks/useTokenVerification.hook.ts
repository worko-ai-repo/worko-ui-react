import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import { useAppContext } from '../context/App.context';

interface DecodedToken {
	exp: number;
	[key: string]: any; // Extend fields based on your token structure
}

export const useTokenVerification = (token: string | null) => {
	const [isVerified, setIsVerified] = useState<boolean | null>(null);
	const { setAuthState } = useAppContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) {
			navigate('/404'); // Navigate to 404 if token is missing
			return;
		}

		const verifyToken = async () => {
			try {
				const decoded = jwtDecode<DecodedToken>(token);

				const isExpired = decoded.exp * 1000 < Date.now();

				if (isExpired) {
					navigate('/sessionExpired'); // Navigate if token is expired
					return;
				}

				// Store token in secure storage
				secureStorage.setItem(SecureStorageKeyEnum.USERTOKEN, token);

				// Update authentication state
				setAuthState(decoded, true);

				setIsVerified(true); // Mark token as valid
			} catch (error) {
				console.error('Token verification failed:', error);
				navigate('/404'); // Navigate to 404 for invalid token format
			}
		};

		verifyToken();
	}, [token, navigate, setAuthState]);

	return isVerified;
};
