import { createContext, useState, useContext, useCallback } from 'react';
import { AppContextType, ContextProviderProps } from '@Interfaces/ContextProvider.dto';

// Create the context object
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the provider component
export const AppProvider = ({ children }: ContextProviderProps) => {
	// Set the initial state of the context
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [tokenData, setTokenData] = useState<any | null>(null);

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

	return <AppContext.Provider value={{ isLoggedIn, tokenData, setAuthState }}>{children}</AppContext.Provider>;
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
