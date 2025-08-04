import ToggleBtn from "@Components/Shared/Tooggle";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import httpServiceObj from "@Services/ApiHandler.service";
import CognitoServiceObj from "@Utils/Cognito.utils";
import { validationRules } from "@Utils/FormValidator.utils";
import secureStorage from "@Utils/SecureStorage.utils";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchAuthSession, rememberDevice } from "@aws-amplify/auth";
import { useAppContext } from "@Context/App.context";
import { AuthLoginForGeneralUserDto } from "@Interfaces/Auth.dto";
import useLinkedInSignup from "@Hooks/useSignupLinkedIn.hook";
import CustomModal from "@Components/Modals/FormModal";
import { getToastOptions } from "@Utils/Toast.utils";
import { NormalizedUser, normalizeUserData } from "@Utils/NormalizeUser";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";

/**
 * currentSession
 *
 * This function is called to get the current session of the user
 *
 * @returns void
 */
export const currentSession = async () => {
  try {
    const session = await fetchAuthSession({ forceRefresh: false }); // Use false to avoid unnecessary refresh
    const authToken = session.tokens?.idToken?.toString();
    const refreshToken = session.tokens?.accessToken?.toString();

    if (authToken) {
      secureStorage.setItem(SecureStorageKeyEnum.USERTOKEN, authToken);
    }

    if (refreshToken) {
      secureStorage.setItem(SecureStorageKeyEnum.ACCESSTOKEN, refreshToken);
    }
  } catch (err) {
    console.error("Session retrieval error", err);
  }
};

// Functions
export const handleRememberDevice = async (isToggleEnabled = true) => {
  try {
    // console.log('Is Remembered me enabled :', isToggleEnabled);
    // Remember the device
    await rememberDevice();
    // If the device is successfully remembered, refresh the session
    await fetchAuthSession({ forceRefresh: isToggleEnabled });
  } catch (error) {
    console.log(error);
  }
};

const LoginForm = () => {
  // Use Navigate Hook
  const navigate = useNavigate();

  // LinkedIn Signup Hook
  const signUpWithLinkedIn = useLinkedInSignup();

  // Update Check from App Context to broadcast the changes
  const { PendingApply, setUpdateCheck, setPendingApply ,setUserDetails} = useAppContext();

  // States
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isToggleEnabled, setIsToggleEnabled] = React.useState<boolean>(false);
  const [confirmAccount, setConfirmAccount] = React.useState<boolean>(false);
  const [confEmail, setConfEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  /**
   * onSubmit
   *
   * This function is called when the form is submitted and the data is validated
   *
   * @param data - Form data
   * @returns void
   */
  const onSubmit = async (data: any): Promise<void> => {
    const loginData = {
      email: data.email,
      password: data.password,
    };

    try {
      const { response, error } = await CognitoServiceObj.handleSignIn(loginData);
      // If error occurs, show the error message and reset the form
      if (error) {
        toast.error(error.message, getToastOptions({ autoClose: false }));
        reset(undefined, { keepValues: false });
        throw new Error(error.message);
      } else {
        // Fetch stored user data and check if the user is a corporate user
        const userType = secureStorage.getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE);

        /**
         * After successful sign-in, check if the user account is a corporate account.
         * If corporate, show a popup and log out the user.
         */
        if (userType?.includes(UserRole.CORPORATE)) {
          toast.error("Oops! You don't have access to log in to this portal. Please contact support for assistance.", getToastOptions({ autoClose: false }));
          CognitoServiceObj.handleSignOut();
          return;
        }

        /**
         * If the account is not confirmed, prompt the user to confirm the email.
         */
        if (response?.nextStep?.signInStep === "CONFIRM_SIGN_UP") {
          toast.error("Please confirm your email address before signing in.", getToastOptions({ autoClose: false }));
          const { response, error } = await CognitoServiceObj.resendOtp({ username: data.email });
          if (error) {
            toast.error(error.message, getToastOptions({ autoClose: false }));
            reset(undefined, { keepValues: false });
          }
          setConfEmail(data.email);
          setConfirmAccount(true);
          return;
        }
        /**
         * If the account is confirmed, proceed with the sign-in process
         */
        if (response?.isSignedIn) {
          const email = data.email.toLowerCase();
          const { response: userResponse, error: userError } = await httpServiceObj.get<[{}]>(`/user/${email}/details`, true, {});

          if (userError) {
            toast.error("Error: " + userError, getToastOptions({ autoClose: false }));
            reset(undefined, { keepValues: false });
            throw new Error();
          } else {
            // Extract the first element from the array response
            const user: NormalizedUser = normalizeUserData(userResponse?.[0] || {});
            setUserDetails(user);

            if (!user) {
              toast.error("Error: No user data found", getToastOptions({ autoClose: false }));
              reset(undefined, { keepValues: false });
              throw new Error();
            }

            // Store user details
            secureStorage.setItem(SecureStorageKeyEnum.LASTACCESSEDDASH, user.lastAccessedDash);
            secureStorage.setItem(SecureStorageKeyEnum.USERNAME, user.fullName);
            secureStorage.setItem<NormalizedUser>(SecureStorageKeyEnum.LOGINDETAILS, user);

            // console.log(secureStorage.getItem(SecureStorageKeyEnum.LASTACCESSEDDASH));

            // Refresh session
            await handleRememberDevice();
            await currentSession();
            setUpdateCheck(true);
            toast.success("Successfully signed in", getToastOptions({}));
            setTimeout(() => {
              // Retrieve pending referral data from context and secure storage
              let pendingReferral = PendingApply || secureStorage.getItem<any>(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS);

              // Sync PendingApply and secureStorage
              if (PendingApply && !secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)) {
                secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
              } else if (!PendingApply && secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)) {
                setPendingApply(pendingReferral);
              }
              // debugger;
              if (PendingApply) {
                secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
                window.location.href = PendingApply.url; // Redirect to the referral page
              } else {
                window.location.href = "/jobs"; // Redirect to home page
              }
            }, 3000);
          }
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong", getToastOptions({ autoClose: false }));
      // CognitoServiceObj.handleSignOut();
    }
  };

  // Simulate OTP verification
  const handleVerifyOtpProcess = async () => {
    try {
      let signupform = {
        username: confEmail,
        confirmationCode: otp,
      };

      // Call handleSignUpConfirmation and await the result
      // debugger;
      await toast.promise(
        CognitoServiceObj.handleSignUpConfirmation(signupform),
        {
          pending: "Verifying Otp",
          success: "Otp verified successfully",
          error: "Error verifying Otp",
        },
        getToastOptions({})
      );
      // Get form values and submit login
      const formData = getValues();

      toast.promise(
        () => onSubmit(formData),
        {
          pending: "Signing in...",
          success: "Successfully signed in",
          error: "Error: An error occurred while signing in",
        },
        getToastOptions({})
      );
    } catch (error) {
      console.error("OTP verification failed", error);
    } finally {
      // close the modal and reset the states and form
      setConfirmAccount(false);
      setOtp("");
      reset(undefined, { keepValues: false });
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit((data) =>
          toast.promise(
            () => onSubmit(data),
            {
              pending: "Signing in...",
              error: "Error: An error occurred while signing in",
            },
            getToastOptions({})
          )
        )}
        className=" min-w-full h-full ">
        <div className="mainForm  min-w-full  grid grid-rows-[min-content] justify-items-center  sm:grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-2 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[350px] items-baseline ">
          <p className="font-bold text-xl mb-2 md:text-2xl text-gray-700 mx-auto text-left w-full  max-w-[350px] mt-2 "> Nice to see you again </p>
          {/* Name */}
          <div className="w-full max-w-[350px] sm:max-w-[350px] ">
            <label className="font-medium hidden sm:block">Email</label>
            <input type="text" placeholder="Enter Email" className={`input_primary auth_input ${errors.email && "error"}`} {...register("email", validationRules.personalEmail)} />
            {errors.email && <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>}
          </div>
          {/* Password */}
          <div className="relative w-full max-w-[350px] sm:max-w-[350px] ">
            <label className="hidden sm:block font-medium">Password</label>
            <input type={showPassword ? "text" : "password"} placeholder="Enter Password" className={`input_primary auth_input ${errors.password && "error"}`} {...register("password", validationRules.password)} />
            <span className="absolute right-3 top-2 sm:top-9 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <i className="fa-regular fa-eye-slash mt-2"></i> : <i className="fa-regular fa-eye mt-2"></i>}
            </span>
            {errors.password && <p className="text-sm text-left text-red-500">{errors.password.message?.toString()}</p>}
          </div>

          {/* Remember me and ForgotPassword */}
          <div className="w-full max-w-[350px] sm:max-w-[350px] flex justify-between items-center my-2  ">
            <div className="flex items-center">
              <ToggleBtn isToggleEnabled={isToggleEnabled} setIsToggleEnabled={() => setIsToggleEnabled(!isToggleEnabled)} />
              <label className="text-sm">Remember me</label>
            </div>
            <a onClick={() => navigate("/auth/resetpassword", { state: { pagetype: "GEN" } })} className="cursor-pointer text-sm text-blue-500 ">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <div className="w-full ">
            <button type="submit" className="cursor-pointer btn_primary px-4 py-2 w-full max-w-[350px] sm:max-w-[350px] " disabled={!isValid || isSubmitting}>
              Sign in
            </button>
          </div>
          <hr className="w-full my-5 max-w-[350px] " />
          {/* LinkedIn  */}
          <div className="w-full ">
            <button className="border px-4 py-2.5 rounded-lg bg-[#333333] text-white text-xs  w-full max-w-[350px] sm:max-w-[350px] " disabled={isSubmitting} type="button" onClick={() => signUpWithLinkedIn("SignIn")}>
              <i className="fa-brands fa-linkedin-in bg-[#0062ff] p-1 pb-0.5  rounded-sm   text-white mx-2 "></i>Or sign in with Linkedin
            </button>
          </div>

          {/* Register */}
          <div className="w-full ">
            <p className="text-center text-sm mt-3 ">
              Don't have an account? &nbsp;
              <div onClick={() => navigate("/auth/signup")} className="inline cursor-pointer text-blue-500 ">
                Sign up now
              </div>
            </p>
          </div>
        </div>
      </form>

      {/* Verify Otp form */}
      {confirmAccount && (
        <CustomModal
          type="info"
          title="Verify Account"
          onSubmit={handleVerifyOtpProcess}
          onClose={() => setConfirmAccount(false)}
          isdisabled={otp.length !== 6} // Disable if OTP is not entered
        >
          <div className="flex flex-col gap-3">
            <p>An one time password has been sent to your registered email address.Please enter it in to verify your account.</p>
            <input type="text" placeholder="Enter OTP" className={`input_primary auth_input ${otp.length !== 6 && "error"}`} value={otp} onChange={(e) => setOtp(e.target.value)} />
            <label className="text-xs text-gray-500">OTP will expire in 5 minutes</label>
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default LoginForm;
