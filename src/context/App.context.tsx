import { JwtPayload } from "jwt-decode";
import { fetchAuthSession } from "@aws-amplify/auth";
import CognitoServiceObj from "@Utils/Cognito.utils";
import secureStorage from "@Utils/SecureStorage.utils";
import httpServiceObj from "@Services/ApiHandler.service";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { AuthLoginForGeneralUserDto, CorporateUserDto } from "@Interfaces/Auth.dto";
import { AppContextType, ContextProviderProps } from "@Interfaces/ContextProvider.dto";
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useEffect,
  useRef,
} from "react";
import {
  continueReferralRequestDataDto,
  ReferralRequestFormDto,
} from "@Pages/request-referral/RequestReferral";
import { NormalizedUser, normalizeUserData } from "@Utils/NormalizeUser";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";

// Corporate User Interface
export interface CorporateUserDetail extends AuthLoginForGeneralUserDto {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  cognitoUserId: string;
  corporateUserType: string;
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  cvDuplicacyAccess?: boolean;
}

/**
 * Cognito Meta Data Interface
 *
 * @description This is an interface for Cognito Meta Data. All the properties are optional
 * and define the structure of the decoded Cognito ID token payload.
 */
export interface CognitoMetaDataDto extends JwtPayload {
  "cognito:groups"?: string[];
  email_verified?: boolean;
  phone_number_verified?: boolean;
  "cognito:username"?: string;
  origin_jti?: string;
  event_id?: string;
  token_use?: string;
  auth_time?: number;
  name?: string;
  phone_number?: string;
  email?: string;
}

// Create the context object
export const AppContext = createContext<AppContextType<any> | undefined>(undefined);

// Create the provider component
export const AppProvider = <T,>({ children }: ContextProviderProps) => {
  // State variables
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [tokenData, setTokenData] = useState<any | null>(null);
  const [userDetails, setUserDetails] = useState<NormalizedUser | null>(null);
  const [updateCheck, setUpdateCheck] = useState<boolean>(false);
  const [PendingApply, setPendingApply] = useState<continueReferralRequestDataDto<T> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Transient CV file (in-memory only)
  const [tempCvFile, setTempCvFile] = useState<File | null>(null);
  const companyIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    companyIdRef.current = userDetails?.companyId;
  }, [userDetails?.companyId]);

  /**
   * fetchCorporateCompanyDetails
   *
   * Accepts companyId as a parameter instead of relying on the stale
   * userDetails closure — because setUserDetails is async and the state
   * may not have updated yet when this is called right after setUserDetails.
   *
   * Falls back to userDetails?.companyId for direct external calls
   * (e.g. from consumers who call this after state has settled).
   */
  const fetchCorporateCompanyDetails = useCallback(async (companyId?: string) => {
    // //@hotfix: keep auth refresh stable by avoiding a userDetails-driven callback loop
    const id = companyId ?? companyIdRef.current;
    if (!id) {
      console.error("Company ID is missing in user details");
      return;
    }
    try {
      const { response, error } = await httpServiceObj.get<any>(`/company/${id}`, true, {});
      if (error) {
        console.error("Error fetching company details:", error);
        return;
      }
      if (response) {
        secureStorage.setItem(SecureStorageKeyEnum.CORPORATECOMPANYDERAILS, response[0]);
      }
    } catch (error) {
      console.error("Error in fetchCorporateCompanyDetails:", error);
    }
  }, []);

  /**
   * fetchUserDetails
   *
   * Wrapped in useCallback so checkUserLoggedIn (which depends on this)
   * does not capture a stale version of this function.
   *
   * Key fix: passes normalizedUser.companyId directly to fetchCorporateCompanyDetails
   * instead of relying on userDetails state, which hasn't updated yet at call time.
   */
  const fetchUserDetails = useCallback(
    async (
      userType: string[] | undefined,
      userId: string | undefined,
      userEmail: string | undefined
    ) => {
      try {
        let userResponse;
        const isCorporateUser =
          userType?.includes("corporate-admin") || userType?.includes("corporate-recruiter");

        if (isCorporateUser) {
          const { response, error } = await httpServiceObj.get<[CorporateUserDetail]>(
            `/corporate-user/${userId}/cognito`,
            true,
            {}
          );
          if (error) {
            throw new Error(error.message);
          }
          userResponse = response?.[0] || {};
          if (userResponse?.isDeleted === true) {
            toast.error(
              "Your account has been deactivated. Please contact support for assistance.",
              getToastOptions({ autoClose: 3000 })
            );
            CognitoServiceObj.handleSignOut();
            return;
          }
        } else {
          const { response, error } = await httpServiceObj.get<[Partial<CorporateUserDetail>]>(
            `/user/${userEmail}/details`,
            true,
            {}
          );
          if (error) {
            throw new Error(error.message);
          }
          userResponse = response?.[0] || {};
        }

        const normalizedUser: NormalizedUser = normalizeUserData(userResponse);
        setUserDetails(normalizedUser);
        secureStorage.setItem(SecureStorageKeyEnum.LOGINDETAILS, normalizedUser);

        // Pass companyId directly from the fresh normalizedUser response —
        // do NOT rely on userDetails state here since setUserDetails above
        // is async and the state won't have updated yet at this point.
        if (isCorporateUser) {
          await fetchCorporateCompanyDetails(normalizedUser.companyId);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    },
    [fetchCorporateCompanyDetails]
  );

  /**
   * checkUserLoggedIn
   *
   * Wrapped in useCallback with fetchUserDetails as a dependency so it
   * always holds a fresh reference to fetchUserDetails and never calls
   * a stale closure.
   */
  const checkUserLoggedIn = useCallback(
    async (forceRefetch = false, forceRefreshSession = false) => {
      try {
        console.info("Checking user authentication status...");
        const isUserLoggedIn = await CognitoServiceObj.isLoggedIn();
        setIsLoggedIn(isUserLoggedIn);

        if (!isUserLoggedIn) return;

        // Sync local secure storage with Cognito tokens
        await CognitoServiceObj.sessionSync(forceRefetch);

        const { tokens } = await fetchAuthSession({ forceRefresh: forceRefreshSession });
        const cognitoUserDetails: CognitoMetaDataDto | undefined = tokens?.idToken?.payload;
        const userType: string[] | undefined = cognitoUserDetails?.["cognito:groups"];
        const userEmail = cognitoUserDetails?.email;
        const userId = cognitoUserDetails?.sub;

        const token = CognitoServiceObj.getAccessToken();
        setTokenData(token);

        // Sync refreshed tokens to secure storage
        await CognitoServiceObj.setAccessToken();

        // If forceRefetch is true, skip cache and always fetch fresh data
        if (forceRefetch) {
          await fetchUserDetails(userType, userId, userEmail);
          return;
        }

        const storedUserDetails = secureStorage.getItem<NormalizedUser>(
          SecureStorageKeyEnum.LOGINDETAILS
        );
        if (storedUserDetails && Object.keys(storedUserDetails).length > 0) {
          setUserDetails(storedUserDetails);
        } else {
          await fetchUserDetails(userType, userId, userEmail);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        await CognitoServiceObj.handleSignOut();
        setIsLoggedIn(false);
      }
    },
    [fetchUserDetails]
  );

  /**
   * Token Refresh Effect
   *
   * On mount: checks auth state using cache (forceRefetch: false).
   * Schedules a silent token refresh 1 minute before the access token expires.
   * After each refresh, reschedules the next one using the new token's expiry.
   *
   * Fixes vs original:
   * - Uses a scoped timeoutRef so recursive scheduleRefresh calls don't
   *   overwrite the outer timeoutId variable, keeping cleanup reliable.
   * - Uses a `cancelled` flag to prevent any async work after unmount.
   * - Calls checkUserLoggedIn(true) on refresh so a fresh token is actually fetched.
   * - Math.max(..., 5000) floor prevents tight loops if the token is already expired.
   */
  useLayoutEffect(() => {
    const timeoutRef = { current: null as NodeJS.Timeout | null };
    let cancelled = false;

    const scheduleRefresh = () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken || cancelled) return;

      try {
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const expiryTime = payload.exp * 1000;
        // Refresh 1 min before expiry; floor at 5s to avoid tight loops
        const refreshIn = Math.max(expiryTime - Date.now() - 60 * 1000, 5000);

        console.info(`Token refresh scheduled in ${Math.round(refreshIn / 1000)}s`);

        timeoutRef.current = setTimeout(async () => {
          if (cancelled) return;
          try {
            console.info("Refreshing token...");
            await checkUserLoggedIn(true, true);
            scheduleRefresh(); // schedule next refresh using new token
          } catch (err) {
            console.error("Token refresh failed:", err);
          }
        }, refreshIn);
      } catch {
        console.error("Could not parse access token for refresh scheduling");
      }
    };

    checkUserLoggedIn(false); // initial mount: use cache
    scheduleRefresh();

    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checkUserLoggedIn]); // checkUserLoggedIn is stable (useCallback)

  /**
   * Manual Re-check Effect
   *
   * Triggered externally via setUpdateCheck(prev => !prev).
   * Forces a fresh fetch whenever updateCheck flips.
   * Includes isLoggedIn and checkUserLoggedIn as proper deps.
   */
  useLayoutEffect(() => {
    if (isLoggedIn) {
      checkUserLoggedIn(true);
    }
  }, [updateCheck, isLoggedIn, checkUserLoggedIn]);

  // Function to set authentication state
  const setAuthState = useCallback((data: any, loggedIn: boolean) => {
    setTokenData(data);
    setIsLoggedIn(loggedIn);
  }, []);

  // Memoized context value
  const memoizedValue = useMemo(
    () => ({
      isLoggedIn,
      tokenData,
      setAuthState,
      setUpdateCheck,
      userDetails,
      setUserDetails,
      PendingApply,
      setPendingApply,
      isModalOpen,
      setIsModalOpen,
      checkUserLoggedIn,
      fetchCorporateCompanyDetails,
      tempCvFile,
      setTempCvFile,
    }),
    [
      isLoggedIn,
      tokenData,
      setAuthState,
      userDetails,
      setUpdateCheck,
      PendingApply,
      setPendingApply,
      isModalOpen,
      checkUserLoggedIn,
      fetchCorporateCompanyDetails,
      tempCvFile,
    ]
  );

  return <AppContext.Provider value={memoizedValue}>{children}</AppContext.Provider>;
};

/**
 * useAppContext Hook
 *
 * This hook is used to access the context object.
 * Must be used within an AppProvider.
 */
export const useAppContext = <T,>() => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context as AppContextType<T>;
};
