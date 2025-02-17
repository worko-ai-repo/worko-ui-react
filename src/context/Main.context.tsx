import { createContext, useState, useContext, useCallback, useLayoutEffect, useMemo } from 'react';
import { AppContextType, ContextProviderProps } from '@Interfaces/ContextProvider.dto';
import CognitoServiceObj from '@Utils/Cognito.utils';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';

// Create the context object
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the provider component
export const AppProvider = ({ children }: ContextProviderProps) => {
	// Set the initial state of the context
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [tokenData, setTokenData] = useState<any | null>(null);
	const [userDetails, setUserDetails] = useState<any | null>(null);
	const [updateCheck, setUpdateCheck] = useState<boolean>(false);
	/**
	 * UseLayoutEffect function to check if the use is Logged in that will run only once
	 */
	useLayoutEffect(() => {
		const checkUserLoggedIn = async () => {
			console.info('User Data is being checked');
			// debugger;
			const isUserLoggedIn: boolean = await CognitoServiceObj.isLoggedIn();
			setIsLoggedIn(isUserLoggedIn);
			if (isUserLoggedIn) {
				const tokenData = CognitoServiceObj.getAccessToken;
				setTokenData(tokenData);

				// Set the user details
				const userDetails = secureStorage.getItem(SecureStorageKeyEnum.LOGINDETAILS);
				setUserDetails(userDetails);
			}
		};
		checkUserLoggedIn();
	}, [updateCheck]);

	/**
	 * setAuthState function
	 *
	 * @description This function is used to set the authentication state.Here I used useCallback to memoize the function
	 * this way the function will not be recreated on every render
	 *
	 * @param {any} data The token data
	 * @param {boolean} loggedIn The login status
	 */
	const setAuthState = useCallback((data: any, loggedIn: boolean) => {
		setTokenData(data);
		setIsLoggedIn(loggedIn);
	}, []);
	const MemoisedVal = useMemo(
		() => ({
			isLoggedIn,
			tokenData,
			setAuthState,
			setUpdateCheck,
			userDetails,
		}),
		[isLoggedIn, tokenData, setAuthState, userDetails, setUserDetails,setUpdateCheck]
	);

	return <AppContext.Provider value={MemoisedVal}>{children}</AppContext.Provider>;
};

/**
 *  useAppContext hook
 *
 * This hook is used to access the context object
 *
 * @returns {AuthContextType} The context object
 */
export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useAppContext must be used within an AuthProvider');
	}
	return context;
};
