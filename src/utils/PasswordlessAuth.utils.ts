import { Amplify } from 'aws-amplify';
import { signUp, confirmSignUp, signIn, confirmSignIn, resendSignUpCode, getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import CognitoServiceObj from './Cognito.utils';
import Awsconfig from '../aws-config';
import { AwsconfigDto } from 'src/aws-config';
import secureStorage from './SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';

/**
 * Evaluator-specific Amplify configuration for passwordless authentication
 */
const evaluatorAmplifyConfig = {
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.APP_COGNITO_USER_POOL_ID,
            userPoolClientId: import.meta.env.APP_EVALUATOR_USER_POOL_CLIENT_ID,
        }
    }
};

/**
 * Interface for evaluator authentication user data
 */
export interface EvaluatorAuthUser {
    email: string;
    cognitoUserId: string;
    name?: string;
}

/**
 * Interface for evaluator authentication result
 */
export interface EvaluatorAuthResult {
    success: boolean;
    user?: EvaluatorAuthUser;
    error?: string;
    isNewUser?: boolean;
    requiresSignInOTP?: boolean;
}

interface EvaluatorAuthConfig {
	userPoolId: string;
	userPoolClientId: string;
}
/**
 * PasswordlessAuth Utility Class
 * Handles all evaluator-specific passwordless authentication operations
 */
class PasswordlessAuth {
    private static instance: PasswordlessAuth;
    private isConfigured = false;
    private evaluatorConfig: EvaluatorAuthConfig | null = null;

    /**
     * Private constructor for singleton pattern
     */
    private constructor() { }

    /**
     * Get singleton instance
     */
    public static getInstance(): PasswordlessAuth {
        if (!PasswordlessAuth.instance) {
            PasswordlessAuth.instance = new PasswordlessAuth();
        }
        return PasswordlessAuth.instance;
    }

    /**
     * Configure Amplify for evaluator authentication
     * @private
     */
    private configureAmplify(): void {
        if (!this.isConfigured) {
            // console.log('Configuring Amplify for evaluator authentication');
            Amplify.configure(evaluatorAmplifyConfig);
            this.isConfigured = true;
        }
    }

    /**
     * Generate temporary password for Cognito requirements
     * This is required by Cognito but not used in passwordless flow
     * @private
     */
    private generateTemporaryPassword(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';

        // Ensure password meets Cognito requirements
        password += 'A'; // Uppercase
        password += 'a'; // Lowercase  
        password += '1'; // Number
        password += '!'; // Special character

        // Add random characters to make it longer
        for (let i = 4; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return password;
    }

    /**
     * Check if error indicates user already exists
     * @private
     */
    private isUserExistsError(error: any): boolean {
        const errorMessage = error?.message?.toLowerCase() || '';
        const errorCode = error?.code || error?.name || '';

        return errorCode === 'UsernameExistsException' ||
            errorMessage.includes('user already exists') ||
            errorMessage.includes('already exists') ||
            errorMessage.includes('username exists');
    }

    /**
     * Initialize evaluator authentication using signup-first strategy
     * This method attempts signup first, then falls back to signin if user exists
     * @param email - Evaluator email
     * @returns Promise<EvaluatorAuthResult>
     */
    public async initializeAuth(email: string): Promise<EvaluatorAuthResult> {
        this.configureAmplify();

        try {
            // console.log('Initializing evaluator authentication for:', email);

            // Strategy: Always try signup first, fallback to signin if user exists
            try {
                const signUpResult = await signUp({
                    username: email,
                    password: this.generateTemporaryPassword(),
                    options: {
                        userAttributes: {
                            email: email,
                        }
                    }
                });

                if (signUpResult.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
                    // console.log('New user - signup successful, starting verification flow');
                    return {
                        success: true,
                        isNewUser: true
                    };
                }
            } catch (signUpError: any) {
                // console.log('SignUp error:', signUpError);

                if (this.isUserExistsError(signUpError)) {
                    // Existing user flow: SignIn -> OTP -> Get Token
                    // console.log('User exists - switching to passwordless sign-in flow');

                    try {
                        const signInResult = await signIn({
                            username: email,
                            options: {
                                authFlowType: 'CUSTOM_WITHOUT_SRP'
                            }
                        });

                        if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
                            // console.log('OTP challenge initiated for existing user');
                            return {
                                success: true,
                                isNewUser: false
                            };
                        } else {
                            throw new Error('Unexpected sign-in flow');
                        }
                    } catch (signInError: any) {
                        console.error('Sign-in error:', signInError);
                        if (signInError.name === 'UserNotFoundException') {
                            return { success: false, error: 'User account not found. Please contact support.' };
                        } else if (signInError.message?.includes('Email not available')) {
                            return { success: false, error: 'Passwordless login not available for this account. Please contact support.' };
                        } else {
                            return { success: false, error: signInError.message || 'Failed to initiate sign in' };
                        }
                    }
                } else {
                    // Some other signup error occurred
                    return { success: false, error: signUpError.message || 'Failed to create account' };
                }
            }

            return { success: false, error: 'Unexpected authentication flow' };
        } catch (error: any) {
            console.error('Initialize evaluator auth error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
 * Initiate sign-in to trigger OTP challenge
 * Used after sign-up is confirmed for new users
 * @param email - Evaluator email
 * @returns Promise<EvaluatorAuthResult>
 */
    public async signIn(email: string): Promise<EvaluatorAuthResult> {
        this.configureAmplify();

        try {
            const signInResult = await signIn({
                username: email,
                options: {
                    authFlowType: 'CUSTOM_WITHOUT_SRP'
                }
            });

            if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
                // console.log('OTP challenge initiated for sign-in');
                return { success: true };
            } else {
                return { success: false, error: 'Unexpected sign-in step' };
            }
        } catch (error: any) {
            console.error('Sign-in error:', error);
            return { success: false, error: error.message || 'Failed to initiate sign-in' };
        }
    }

    /**
     * Confirm evaluator signup with OTP (for new users)
     * @param email - Evaluator email
     * @param otp - OTP code from email
     * @returns Promise<EvaluatorAuthResult>
     */
    public async confirmSignUp(email: string, otp: string): Promise<EvaluatorAuthResult> {
        this.configureAmplify();

        try {
            const confirmResult = await confirmSignUp({
                username: email,
                confirmationCode: otp
            });

            if (confirmResult.nextStep?.signUpStep === 'DONE') {
                // console.log('Signup confirmed successfully');
                return { success: true };
            } else {
                return { success: false, error: 'Signup confirmation failed' };
            }
        } catch (error: any) {
            console.error('Confirm signup error:', error);

            if (error.name === 'CodeMismatchException') {
                return { success: false, error: 'Invalid verification code. Please try again.' };
            }
            if (error.name === 'ExpiredCodeException') {
                return { success: false, error: 'Verification code has expired. Please request a new one.' };
            }

            return { success: false, error: error.message || 'Invalid verification code' };
        }
    }

    /**
     * Confirm evaluator signin with OTP (for existing users)
     * @param otp - OTP code from email
     * @returns Promise<EvaluatorAuthResult>
     */
    public async confirmSignIn(otp: string): Promise<EvaluatorAuthResult> {
        this.configureAmplify();

        try {
            const signInResult = await confirmSignIn({
                challengeResponse: otp
            });

            if (signInResult.isSignedIn) {
                // console.log('Sign in confirmed successfully');

                // Get user details
                const user = await getCurrentUser();
                const attributes = await fetchUserAttributes();

                // Set access token and user details using existing Cognito utils
                await CognitoServiceObj.setAccessToken();

                return {
                    success: true,
                    user: {
                        email: attributes.email || '',
                        cognitoUserId: user.userId,
                        name: attributes.name,
                    }
                };
            } else {
                return { success: false, error: 'Sign in confirmation failed' };
            }
        } catch (error: any) {
            console.error('Confirm signin error:', error);

            if (error.name === 'CodeMismatchException') {
                return { success: false, error: 'Invalid verification code. Please try again.' };
            }
            if (error.name === 'ExpiredCodeException') {
                return { success: false, error: 'Verification code has expired. Please request a new one.' };
            }

            return { success: false, error: error.message || 'Invalid verification code' };
        }
    }

    /**
     * Resend OTP for evaluator signup
     * @param email - Evaluator email
     * @returns Promise<EvaluatorAuthResult>
     */
    public async resendSignUpCode(email: string): Promise<EvaluatorAuthResult> {
        this.configureAmplify();

        try {
            await resendSignUpCode({
                username: email
            });
            // console.log('Signup confirmation code resent');
            return { success: true };
        } catch (error: any) {
            console.error('Resend signup code error:', error);
            return { success: false, error: error.message || 'Failed to resend verification code' };
        }
    }

    /**
     * Resend OTP for evaluator signin (reinitiate signin process)
     * @param email - Evaluator email
     * @returns Promise<EvaluatorAuthResult>
     */
    public async resendSignInOTP(email: string): Promise<EvaluatorAuthResult> {
        this.configureAmplify();

        try {
            const signInResult = await signIn({
                username: email,
                options: {
                    authFlowType: 'CUSTOM_WITHOUT_SRP'
                }
            });

            if (signInResult.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE') {
                // console.log('New OTP sent for existing user');
                return { success: true };
            } else {
                return { success: false, error: 'Failed to resend OTP' };
            }
        } catch (error: any) {
            console.error('Resend signin OTP error:', error);
            return { success: false, error: error.message || 'Failed to resend verification code' };
        }
    }

    /**
     * Get current authenticated evaluator user
     * @returns Promise<EvaluatorAuthUser | null>
     */
    public async getCurrentUser(): Promise<EvaluatorAuthUser | null> {
        this.configureAmplify();

        try {
            const user = await getCurrentUser();
            const attributes = await fetchUserAttributes();

            return {
                email: attributes.email || '',
                cognitoUserId: user.userId,
                name: attributes.name,
            };
        } catch (error) {
            console.error('Get current evaluator user error:', error);
            return null;
        }
    }

    /**
     * Sign out evaluator user
     * @returns Promise<EvaluatorAuthResult>
     */
    public async signOut(): Promise<EvaluatorAuthResult> {
        this.configureAmplify();

        try {
            // Use existing Cognito service sign out which handles storage cleanup
            await CognitoServiceObj.handleSignOut();
            return { success: true };
        } catch (error: any) {
            console.error('Evaluator sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if evaluator is currently authenticated
     * @returns Promise<boolean>
     */
    public async isAuthenticated(): Promise<boolean> {
        this.configureAmplify();

        try {
            const user = await getCurrentUser();
            if (user) {
                // Ensure access token is set using existing Cognito service
                await CognitoServiceObj.setAccessToken();
                return true;
            }
            return false;
        } catch (error) {
            // Use existing Cognito service sign out for cleanup
            await CognitoServiceObj.handleSignOut();
            return false;
        }
    }

    /**
     * Get access token using existing Cognito service
     * @returns string
     */
    public getAccessToken(): string {
        return CognitoServiceObj.getAccessToken();
    }


    public configureForEvaluator(evaluatorConfig?: EvaluatorAuthConfig): void {
		if (evaluatorConfig) {
			this.evaluatorConfig = evaluatorConfig;
			const evaluatorAmplifyConfig = {
				Auth: {
					Cognito: {
						userPoolId: evaluatorConfig.userPoolId,
						userPoolClientId: evaluatorConfig.userPoolClientId,
					}
				}
			};
			// console.log('Configuring Amplify for evaluator authentication');
			Amplify.configure(evaluatorAmplifyConfig);
		} else {
			// Reset to default configuration
			this.evaluatorConfig = null;
			Amplify.configure(Awsconfig as AwsconfigDto);
		}
	}

	public async handleSignOut(): Promise<void> {
		try {
			this.clearStorage();
			// Reset to default configuration after sign out
			if (this.evaluatorConfig) {
				this.configureForEvaluator();
			}
			await signOut();
		} catch (error) {
			console.error('Sign out error:', error);
			throw error;
		}
	}
    private clearStorage(): void {
		secureStorage.clear();
		this.removeAccessToken();
		localStorage.clear();
	}
    public removeAccessToken(): void {
		secureStorage.remove(SecureStorageKeyEnum.ACCESSTOKEN);
	}
}

// Export singleton instance
export const PasswordlessAuthService = PasswordlessAuth.getInstance();
export default PasswordlessAuthService;