import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import { NormalizedUser } from "@Utils/NormalizeUser";
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
  userDetails: NormalizedUser | null;
  setUserDetails: React.Dispatch<React.SetStateAction<NormalizedUser | null>>;
  PendingApply: continueReferralRequestDataDto<T> | null ;
  setPendingApply: React.Dispatch<React.SetStateAction<continueReferralRequestDataDto<T> | null >>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  checkUserLoggedIn: () => Promise<void>;
  fetchCorporateCompanyDetails: () => Promise<void>;
  /**
   * Transient CV file selected on hero/login. Persist only in-memory across navigation.
   */
  tempCvFile: File | null;
  setTempCvFile: React.Dispatch<React.SetStateAction<File | null>>;
}