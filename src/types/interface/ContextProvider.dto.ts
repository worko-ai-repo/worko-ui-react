import { ReactNode } from "react";

/**
 * Interface for the ContextProvider
 * @interface
 */
export interface ContextProviderProps {
  children: ReactNode;
}

export interface AppContextType {
  isLoggedIn: boolean;
  tokenData: any | null;
  setAuthState: (tokenData: any, isLoggedIn: boolean) => void;
}