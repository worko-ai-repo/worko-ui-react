import { SignupMode } from "@Components/Auth/Signup/Signup";
import { ContextProviderProps } from "@Interfaces/ContextProvider.dto";
import { useContext, useMemo, createContext, useState } from "react";

// Create the context object
export const AppContext = createContext<any | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: ContextProviderProps) => {

    // Function to set authentication state
    const [authContextActiveFrame,setAuthContextActiveFrame] = useState<SignupMode>('CAND');



    // Memoized context value
    const memoizedValue = useMemo(
        () => ({
            authContextActiveFrame,
            setAuthContextActiveFrame
        }),
        [authContextActiveFrame, setAuthContextActiveFrame]
    );

    return <AppContext.Provider value={memoizedValue}>{children}</AppContext.Provider>;
};

/**
 * useAuthContext Hook
 *
 * This hook is used to access the context object
 */
export const useAuthContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AppProvider');
    }
    return context;
};
