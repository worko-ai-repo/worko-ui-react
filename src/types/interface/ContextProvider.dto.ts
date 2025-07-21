import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import React, { ReactNode } from "react";

/**
 * Interface for the ContextProvider
 * @interface
 */
export interface ContextProviderProps {
  children: ReactNode;
}

export interface AppContextType<T> {
  isLoggedIn: boolean;
  tokenData: any | null;
  setAuthState: (tokenData: any, isLoggedIn: boolean) => void;
  setUpdateCheck: React.Dispatch<React.SetStateAction<boolean>>;
  userDetails: any | null;
  PendingApply: continueReferralRequestDataDto<T> | null ;
  setPendingApply: React.Dispatch<React.SetStateAction<continueReferralRequestDataDto<T> | null >>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}