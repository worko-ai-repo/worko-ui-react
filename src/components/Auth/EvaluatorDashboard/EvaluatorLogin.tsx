import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Shield, ArrowRight, RefreshCw, CheckCircle, AlertCircle, User } from 'lucide-react';
import PasswordlessAuthService, { EvaluatorAuthUser } from '../../../utils/PasswordlessAuth.utils';
import { EvaluatorService, getEvaluatorById, fetchEvaluationDetails} from '../../../services/EvaluatorService.service';
import CognitoServiceObj from '../../../utils/Cognito.utils';
import { fetchAuthSession } from '@aws-amplify/auth';
import { logo_text } from '@Assets';


const EvaluatorLogin: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const rawEmail = searchParams.get('evaluatorEmail') || '';
  // const evaluatorEmail = rawEmail.toLowerCase();

  const [step, setStep] = useState<'loading' | 'otp' | 'name' | 'success' | 'error'>('loading');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [requiresSignInOTP, setRequiresSignInOTP] = useState(false);
  const [evaluatorEmail, setEvaluatorEmail] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);


  const jobApplicationId = searchParams.get('jobApplicationId') || '';
  const evaluationRequestId = searchParams.get('evaluationRequestId') || '';
  //@TODO change v2 to some sensible variable name
  const v2 = import.meta.env.APP_PROXY_DASH
//   useEffect(() => {
//     const getEvaluationDetails = async () => {
//       try {
//         const details = await fetchEvaluationDetails(jobApplicationId,evaluationRequestId);
//         const rawEmail = details.evaluatorDetails.email
//         setEvaluatorEmail(rawEmail)
//         console.log("rawemail",rawEmail)
//       } catch (err) {
//         console.error('Error fetching evaluation details:', err);
//       } 
//     }
//     getEvaluationDetails()
//   }, [])

//   useEffect(() => {
//     if (!evaluatorEmail) {
//       setError('We couldn’t find evaluator access linked to this email address, or the provided ID is invalid.');
//       setStep('error');
//       return;
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(evaluatorEmail)) {
//       console.log(emailRegex)
//       setError('Invalid email format');
//       setStep('error');
//       return;
//     }

//     // Configure Cognito for evaluator authentication
//     CognitoServiceObj.configureForEvaluator({
//       //@todo remove this line
//       userPoolId: import.meta.env.APP_COGNITO_USER_POOL_ID,
//       userPoolClientId: import.meta.env.APP_EVALUATOR_USER_POOL_CLIENT_ID
//     });
//     initializeAuth();
//   }, [evaluatorEmail]);

//   useEffect(() => {
//   const checkSession = async () => {
//     try {
//       const session = await fetchAuthSession();

//       if (session?.tokens?.idToken) {
//         const token = session.tokens.idToken.toString();
//         const payload = JSON.parse(atob(token.split('.')[1]));

//         console.log('Decoded token:', payload);

//         // Redirect
//         // window.location.href = `${window.location.origin}/${v2}/evaluator-dashboard/?evaluatorEmail=${encodeURIComponent(payload.email)}`;
//         window.location.href = `${window.location.origin}/${v2}/evaluator-dashboard/?jobApplicationId=${jobApplicationId}&evaluationRequestId=${evaluationRequestId}`;
//       } else {
//         console.log('No ID token found. Starting login flow...');
//         // initializeAuth();
//       }
//     } catch (err) {
//       console.log('Not logged in. Starting login flow...');
//       // initializeAuth();
//     }
//   };

//   checkSession();
// }, []);

useEffect(() => {
  const init = async () => {
    try {
      // Fetch evaluator details first
      let details;
      try {
        details = await fetchEvaluationDetails(jobApplicationId, evaluationRequestId);
        // console.log('[DEBUG] fetchEvaluationDetails response:', details);
      } catch (err) {
        // console.error('[ERROR] fetchEvaluationDetails threw an error:', err);
        setError('Unable to fetch evaluator access. Please verify the link If the issue persists, contact HR for assistance.');
        setStep('error');
        return;
      }

      const expectedEmail = details?.evaluatorDetails?.email;
      if (!expectedEmail) {
        setError('No evaluator email found from the provided ID. Please check your link or request.');
        setStep('error');
        return;
      }

      // Check if user is already logged in
      const session = await fetchAuthSession();
      // console.log(session);

      if (session?.tokens?.idToken) {
        const token = session.tokens.idToken.toString();
        const payload = JSON.parse(atob(token.split('.')[1]));
        // console.log('Decoded token:', payload);

        // Step 3: Compare token email with expected email
        if (payload.email !== expectedEmail) {
          setError('Logged in user does not match the evaluator email.');
          setStep('error');
          return;
        }

        // Redirect only if email matches
        window.location.href = `${window.location.origin}/${v2}/evaluator-dashboard/?jobApplicationId=${jobApplicationId}&evaluationRequestId=${evaluationRequestId}`;
        return; // Exit early — session is valid and user matches
      }

      // Step 4: Validate email format for authentication
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(expectedEmail)) {
        setError('Invalid email format');
        setStep('error');
        return;
      }

      // Step 5: Configure Cognito and initialize authentication
      PasswordlessAuthService.configureForEvaluator({
        userPoolId: import.meta.env.APP_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.APP_EVALUATOR_USER_POOL_CLIENT_ID
      });

      setEvaluatorEmail(expectedEmail);
      initializeAuth(expectedEmail);

    } catch (error) {
      console.error('Unexpected error during initialization:', error);
      setError('An unexpected error occurred. Please try again later.');
      setStep('error');
    }
  };

  init();
}, []);


  const initializeAuth = async (emailParam?: string) => {
    try {
      setIsLoading(true);
      setError('');

      const emailToUse = emailParam || evaluatorEmail;
      // console.log('Initializing authentication for:', evaluatorEmail);

      // Use signup-first strategy from PasswordlessAuthService
      const result = await PasswordlessAuthService.initializeAuth(emailToUse);

      if (!result.success) {
        throw new Error(result.error || 'Authentication initialization failed');
      }
      setOtpCooldown(30);
      // Set user type based on result
      setIsNewUser(result.isNewUser || false);
      setStep('otp');

      // console.log(result.isNewUser ? 'New user flow initiated' : 'Existing user flow initiated');
    } catch (error: any) {
      console.error('Initialize auth error:', error);
      setError(error.message);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    try {
      setIsLoading(true);
      setError('');

      if (isNewUser && !requiresSignInOTP) {
        // Step 1: Confirm SignUp for new user
        // console.log('Confirming signup for new user');
        const confirmResult = await PasswordlessAuthService.confirmSignUp(evaluatorEmail, otp);

        if (!confirmResult.success) {
          throw new Error(confirmResult.error || 'Signup confirmation failed');
        }

        // console.log('Signup confirmed successfully');

        // Step 2: Now initiate SignIn so that token can be generated
        const signInInit = await PasswordlessAuthService.signIn(evaluatorEmail);
        if (!signInInit.success) {
          throw new Error(signInInit.error || 'Failed to initiate sign-in');
        }

        // console.log('Sign-in OTP triggered after signup confirmation');
        setOtp('');
        setRequiresSignInOTP(true); // This will show OTP input again
        return;
      }

      // Step 3: Confirm SignIn (for both new and existing users now)
      // console.log('Confirming sign in');
      const signInResult = await PasswordlessAuthService.confirmSignIn(otp);

      if (!signInResult.success) {
        throw new Error(signInResult.error || 'Sign in confirmation failed');
      }

      const currentUser = await PasswordlessAuthService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated after sign in');

      // Optionally refresh session or fetch tokens if your service supports it
      // await CognitoServiceObj.refreshSession();  // Uncomment if you have such method

      const accessToken = PasswordlessAuthService.getAccessToken();
      if (!accessToken) throw new Error('Access token not found after sign in');

      // console.log('Sign in confirmed successfully');

      
      // Step 4: Now check backend for registration
      const groupCheck = await EvaluatorService.checkEvaluatorGroup(evaluatorEmail);

      if (!groupCheck.inGroup) {
        // console.log('User authenticated but not in DB, show name input');
        setStep('name');
      } else {
        // console.log('User exists in DB, redirecting');
        await redirectToDashboard();
      }

    } catch (error: any) {
      console.error('OTP submission error:', error);
      setError(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    const accessToken = session.tokens?.accessToken;
    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
};

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      setError('');

      // Get current authenticated user
      const currentUser = await PasswordlessAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated. Please try again.');
      }

      // console.log('Registering evaluator in database');

      // Register evaluator in database
      const registerResult = await EvaluatorService.registerEvaluator({
        name: name.trim(),
        email: evaluatorEmail,
        cognitoUserId: currentUser.cognitoUserId,
      });

      if (!registerResult.success) {
        throw new Error(registerResult.error || 'Failed to register evaluator');
      }

      // console.log('Evaluator registered successfully');
      refreshToken()
      await redirectToDashboard();
    } catch (error: any) {
      console.error('Name submission error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToDashboard = async () => {
    try {
      // Verify authentication
      const currentUser = await PasswordlessAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication failed. Please try again.');
      }

      // Verify that access token is properly set
      const accessToken = CognitoServiceObj.getAccessToken();
      if (!accessToken) {
        console.warn('Access token not found, but proceeding with redirect');
      }
      setStep('success');

      // Fetch job applications to verify everything is working
      try {
        const jobApplications = await EvaluatorService.getJobApplications(evaluatorEmail);
        // console.log('Job applications fetched:', jobApplications.data);
      } catch (error) {
        console.warn('Failed to fetch job applications:', error);
      }

      // Redirect after a short delay
      setTimeout(() => {
        // window.location.href = `${window.location.origin}/${v2}/evaluator-dashboard/?evaluatorEmail=${encodeURIComponent(evaluatorEmail)}`;
        window.location.href = `${window.location.origin}/${v2}/evaluator-dashboard/?jobApplicationId=${jobApplicationId}&evaluationRequestId=${evaluationRequestId}`;
      }, 2000);
    } catch (error: any) {
      console.error('Redirect error:', error);
      setError(error.message);
      setStep('error');
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      setError('');

      if (isNewUser && !requiresSignInOTP) {
        // Resend signup confirmation code
        const result = await PasswordlessAuthService.resendSignUpCode(evaluatorEmail);
        setOtpCooldown(30);
        if (!result.success) throw new Error(result.error || 'Failed to resend signup code');
        // console.log('Resent signup confirmation code');
      } else {
        // For existing users, reinitiate the sign-in process
        const result = await PasswordlessAuthService.resendSignInOTP(evaluatorEmail);
        setOtpCooldown(30);
        if (!result.success) {
          throw new Error(result.error || 'Failed to resend verification code');
        }
        // console.log('New OTP sent for existing user');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

useEffect(() => {
  if (otpCooldown === 0) return;

  const timer = setInterval(() => {
    setOtpCooldown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [otpCooldown]);


  // Loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#316BFF]  mx-auto mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Setting Up Your Access</h2>
            <p className="text-gray-600  text-lg">Please wait while we prepare your account...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome!</h2>
            <p className="text-gray-600 mb-6 text-lg">You're all set! Taking you to your dashboard...</p>
            <div className="animate-pulse bg-[#316BFF]/10 rounded-lg p-3">
              <p className="text-[#316BFF] font-medium">Redirecting you now</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Something Went Wrong</h2>
            <p className="text-gray-600 mb-6 text-lg">{error}</p>
            {/* <button
              onClick={initializeAuth}
              className="w-full bg-[#316BFF] text-white py-3 px-6 rounded-lg hover:bg-[#2557E6] transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button> */}
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo_text} alt="logo" className='w-60 h-auto mx-auto'/>
          {/* <div className="bg-[#316BFF]/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#316BFF]" />
          </div> */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome Back</h1>
          <p className="text-gray-600">
            {isNewUser ? 'Let\'s set up your account' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-[#316BFF]/5 rounded-lg p-4 mb-6 border border-[#316BFF]/20">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#316BFF]" />
            <div>
              <p className="text-sm text-[#316BFF] font-medium">
                {isNewUser ? 'Setting up account for:' : 'Signing in as:'}
              </p>
              <p className="font-semibold text-gray-900 text-lg">{evaluatorEmail}</p>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#316BFF] rounded-full animate-pulse"></div>
            <p className="text-[#316BFF] text-sm font-medium">
              {isNewUser && !requiresSignInOTP
                ? 'Verifying your email address'
                : isNewUser && requiresSignInOTP
                  ? 'Confirming your identity'
                  : 'Signing you in securely'
              }
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* OTP Form */}
        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316BFF] focus:border-[#316BFF] text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
              <p className="text-sm text-gray-600 mt-3 text-center">
                {isNewUser
                  ? 'We sent a 6-digit code to your email to complete setup'
                  : 'Check your email for a 6-digit verification code'
                }
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#316BFF] text-white py-4 px-6 rounded-lg hover:bg-[#2557E6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending || otpCooldown > 0}
              className="w-full text-[#316BFF] hover:text-[#2557E6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 py-2 font-medium"
            >
              {isResending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#316BFF]"></div>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>{otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send New Code'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Name Form */}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#316BFF] focus:border-[#316BFF] text-lg"
                  required
                  autoComplete="name"
                />
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This will be used to identify you in the evaluator dashboard
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#316BFF] text-white py-4 px-6 rounded-lg hover:bg-[#2557E6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default EvaluatorLogin;