import { Amplify } from "aws-amplify";
import { Hub } from "@aws-amplify/core";
import {
  AuthError,
  ConfirmSignUpInput,
  SignInInput,
  SignInOutput,
  confirmSignUp,
  fetchAuthSession,
  getCurrentUser,
  resendSignUpCode,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
  ResendSignUpCodeInput,
  updatePassword,
  confirmSignIn,
} from "@aws-amplify/auth";
import Awsconfig from "../aws-config";
import { BehaviorSubject } from "rxjs";
import { AwsconfigDto } from "src/aws-config";
import secureStorage from "./SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";

/**
 * Interface for user authentication credentials
 */
interface IUser {
  email: string;
  password: string;
}

/**
 * Interface for sign up parameters
 */
interface SignUpParameters {
  username: string;
  password: string;
  phone_number?: string;
  name: string;
}

/**
 * Interface for authentication response
 */
interface AuthResponse<T = any> {
  response?: T;
  error?: AuthError;
}

/**
 * CognitoService class for handling AWS Cognito authentication
 */
class CognitoService {
  private authenticationSubject: BehaviorSubject<boolean>;
  private linkedinAccessToken: string = "";
  private UserRegistered: boolean = false;
  private linkedinSignInDetails: any;

  /**
   * Constructor for CognitoService
   * @param config - Configuration object containing storage service and Amplify config
   */
  constructor() {
    this.authenticationSubject = new BehaviorSubject<boolean>(false);
    // console.log('Amplify Configuration:', Awsconfig);
    // Configure Amplify
    Amplify.configure(Awsconfig as AwsconfigDto);

    // Set up Hub listener for auth events
    this.setupAuthListener();
  }

  /**
   * Sets up the authentication listener using Amplify Hub
   * @private
   */
  private setupAuthListener(): void {
    Hub.listen("auth", async ({ payload }: any) => {
      switch (payload.event) {
        case "signInWithRedirect":
          const user = await getCurrentUser();
          secureStorage.setItem(SecureStorageKeyEnum.SIGNINDETAILS, user);
          break;
        case "signInWithRedirect_failure":
          // Handle sign in failure
          break;
        case "customOAuthState":
          // Handle custom OAuth state
          break;
      }
    });
  }

  /**
   * Handles social sign-in with LinkedIn
   * @returns Promise<void>
   */
  public async handleSocialSignIn(): Promise<void> {
    const provider = { custom: "LinkedIn" };
    try {
      // debugger;
      const res = await signInWithRedirect({ provider });
      Hub.dispatch("auth", { event: "signInWithRedirect_success", data: res });
    } catch (error) {
      console.error("Social sign-in error:", error);
      throw error;
    }
  }

  /**
   * Handles user sign-in
   * @param user - User credentials
   * @returns Promise with sign-in response or error
   */
  public async handleSignIn(user: IUser): Promise<AuthResponse<SignInOutput>> {
    try {
      const login: SignInInput = {
        username: user.email,
        password: user.password,
      };

      const authData = await signIn(login);
      this.authenticationSubject.next(true);
      secureStorage.setItem(SecureStorageKeyEnum.SIGNINDETAILS, "false");
      await this.setAccessToken();
      console.log(authData)
      return { response: authData };
    } catch (error) {
      console.error("Error signing in:", error);
      if (error instanceof AuthError) {
        return { error };
      }
      throw error;
    }
  }

  /**
   * Checks if user is logged in
   * @returns Promise<boolean>
   */
  public async isLoggedIn(): Promise<boolean> {
    // console the initiator of this function by logging an error
    
    
    console.error("isLoggedIn function initiated");

    this.UserRegistered = secureStorage.getItem(SecureStorageKeyEnum.REDACTED_SECRET) || false;
    this.linkedinSignInDetails = secureStorage.getItem(SecureStorageKeyEnum.SIGNINDETAILS) || "{}";
    //debugger;
    if (this.UserRegistered === true) {
      return this.handleLinkedInLogin();
    }
    return this.handleRegularLogin();
  }

  /**
   * Handles LinkedIn login verification
   * @private
   * @returns Promise<boolean>
   */
  private async handleLinkedInLogin(): Promise<boolean> {
    const { tokens } = await fetchAuthSession();
    if (tokens) {
      if (!secureStorage.getItem(SecureStorageKeyEnum.USEREMAIL)) {
        secureStorage.setItem(
          SecureStorageKeyEnum.USEREMAIL,
          tokens?.idToken?.payload["email"]?.toString().toLowerCase() || ""
        );
        secureStorage.setItem(
          SecureStorageKeyEnum.COGNITOUSERDETAILS,
          tokens?.idToken?.payload || ""
        );
      }
      return true;
    }
    await this.handleSignOut();
    return false;
  }

  /**
   * Handles regular login verification
   * @private
   * @returns Promise<boolean>
   */
  private async handleRegularLogin(): Promise<boolean> {
    try {
      const { tokens } = await fetchAuthSession();
      if (tokens) {
        if (!secureStorage.getItem(SecureStorageKeyEnum.USEREMAIL)) {
          secureStorage.setItem(
            SecureStorageKeyEnum.USEREMAIL,
            tokens?.idToken?.payload["email"]?.toString().toLowerCase() || ""
          );
          secureStorage.setItem(
            SecureStorageKeyEnum.COGNITOUSERDETAILS,
            tokens?.idToken?.payload || ""
          );
        }
        return true;
      }
      // If no tokens are found, simply report not-logged-in without clearing storage.
      // Clearing here was wiping any locally cached state (e.g., pending apply data)
      // when this lightweight check runs from places like the Header.
      return false;
    } catch (err) {
      console.error("Error fetching auth session:", err);
      return false;
    }
  }

  /**
   * Handles user sign-out
   * @returns Promise<void>
   */
  public async handleSignOut(): Promise<void> {
    try {
      this.clearStorage();
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  /**
   * Clears all storage items
   * @private
   */
  private clearStorage(): void {
    // const keysToRemove = ['useremail', 'LinkedinUserType', 'REDACTED_SECRET', 'signInDetails', 'isCompanyListingRoute', 'type', 'companySK', 'userType', 'dynamicRoute', 'cognitoUserId'];

    // keysToRemove.forEach((key:SecureStorageKeyEnum) => secureStorage.clear(key));
    // Clear the storage
    secureStorage.clear();
    this.removeAccessToken();
    localStorage.clear();
  }

  /**
   * Handles user sign-up
   * @param params - Sign up parameters
   * @returns Promise with sign-up response or error
   */
  public async handleSignUp(params: SignUpParameters): Promise<AuthResponse> {
    try {
      const signUpResponse = await signUp({
        username: params.username,
        password: params.password,
        options: {
          userAttributes: {
            name: params.name,
            ...(params.phone_number && { phone_number: params.phone_number }),
          },
          autoSignIn: true,
        },
      });

      return { response: signUpResponse };
    } catch (error) {
      if (error instanceof AuthError) {
        return { error };
      }
      throw error;
    }
  }

  /**
   * Handles password change
   * @param params - Old and new password
   * @returns Promise with response or error
   */
  public async handleChangePassword(params: {
    oldPassword: string;
    newPassword: string;
  }): Promise<AuthResponse> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const accessToken = this.getAccessToken();
      if (!accessToken) {
        throw new Error("Access token is missing or expired");
      }

      const response = await updatePassword({
        oldPassword: params.oldPassword,
        newPassword: params.newPassword,
      });

      return { response };
    } catch (error: any) {
      console.error("Password change error:", error);
      return { error };
    }
  }

  
public async handleForceNewPassword(newPassword: string): Promise<AuthResponse<SignInOutput>> {
  try {
    const result = await confirmSignIn({
      challengeResponse: newPassword,
    });

    this.authenticationSubject.next(true);
    await this.setAccessToken();
    debugger
    return { response: result };
  } catch (error) {
    console.error("Error confirming new password:", error);
    if (error instanceof AuthError) {
      return { error };
    }
    throw error;
  }
}

  /**
   * Handles sign-up confirmation
   * @param params - Confirmation parameters
   * @returns Promise with confirmation response or error
   */
  public async handleSignUpConfirmation(params: ConfirmSignUpInput): Promise<AuthResponse> {
    try {
      const response = await confirmSignUp(params);
      return { response };
    } catch (error: any) {
      console.error("Confirmation error:", error);
      return { error };
    }
  }

  /**
   * Resends OTP for sign-up confirmation
   * @param params - Username for OTP resend
   * @returns Promise with response or error
   *
   * @example
   * ```typescript
   * const params = { username: 'xyz@example.com' };
   * const { response, error } = await CognitoServiceObj.resendOtp(params);
   * ```
   */
  public async resendOtp(params: ResendSignUpCodeInput): Promise<AuthResponse> {
    try {
      const response = await resendSignUpCode(params);
      return { response };
    } catch (error: any) {
      console.error("OTP resend error:", error);
      return { error };
    }
  }

  /**
   * Gets the access token from local storage
   * @returns string
   */
  public getAccessToken(): string {
    let accessToken = "";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("CognitoIdentityServiceProvider.") && key.includes(".accessToken")) {
        accessToken = localStorage.getItem(key) || "";
        break;
      }
    }
    return accessToken;
  }

  /**
   * Sets the access token and user type in storage
   * @returns Promise<boolean>
   */
  public async setAccessToken(): Promise<boolean> {
    try {
      const { tokens } = await fetchAuthSession();
      const userType = tokens?.idToken?.payload["cognito:groups"];
      const userId = tokens?.idToken?.payload["sub"];

      if (userId) {
        secureStorage.setItem(SecureStorageKeyEnum.COGNITOUSERID, userId);
      }

      if (Array.isArray(userType)) {
        const roles: UserRole[] = [];
        for (const role of userType) {
          switch (role) {
            case UserRole.CORPORATE_ADMIN:
            case UserRole.CORPORATE_RECRUITER: {
              secureStorage.setItem<typeof role>(SecureStorageKeyEnum.CORPORATEUSERTYPE, role);
              roles.push(UserRole.CORPORATE);
              break;
            }
            case UserRole.ADMIN: {
              roles.push(UserRole.ADMIN);
              break;
            }
            case UserRole.EVALUATOR: {
              roles.push(UserRole.EVALUATOR);
              break;
            }
            case UserRole.LINKEDIN: {
              roles.push(UserRole.LINKEDIN);
              break;
            }
            case UserRole.GENERAL_USER: {
              roles.push(UserRole.GENERAL_USER);
              break;
            }
          }
        }
        secureStorage.setItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE, roles);
      } else {
        secureStorage.setItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE, [UserRole.GENERAL_USER]);
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("CognitoIdentityServiceProvider.") && key.includes(".accessToken")) {
          const value = localStorage.getItem(key);
          if (value) {
            secureStorage.setItem<string>(SecureStorageKeyEnum.ACCESSTOKEN, value);
          }
        }
      }

      return true;
    } catch (error: any) {
      console.error("Error setting access token:", error);
      return false;
    }
  }

  /**
   * Removes the access token from storage
   */
  public removeAccessToken(): void {
    secureStorage.remove(SecureStorageKeyEnum.ACCESSTOKEN);
  }
}
const CognitoServiceObj = new CognitoService();

export default CognitoServiceObj;
