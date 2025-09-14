import { currentSession, handleRememberDevice } from "@Components/Auth/Login/LoginForm";
import { CorporateUserDetail, useAppContext } from "@Context/App.context";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { useCrossAppAuth } from "@Hooks/useCrossAppAuth.hook";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";
import httpServiceObj from "@Services/ApiHandler.service";
import CognitoServiceObj from "@Utils/Cognito.utils";
import { validationRules } from "@Utils/FormValidator.utils";
import secureStorage from "@Utils/SecureStorage.utils";
import { getToastOptions } from "@Utils/Toast.utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CorporateLoginForm = () => {
  const appHref = useCrossAppAuth();
  const navigate = useNavigate();
  const { checkUserLoggedIn, setUpdateCheck, fetchCorporateCompanyDetails } = useAppContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  // Form submission handler
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
        throw new Error(error.message);
      } else {
        // Fetch stored user data and check if the user is a corporate user
        const userType = secureStorage.getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE);
        if (!userType?.includes(UserRole.CORPORATE)) {
          toast.error(
            "Oops! You don't have access to log in to this portal. Please contact support for assistance.",
            getToastOptions({ autoClose: false })
          );
          CognitoServiceObj.handleSignOut();
          return;
        }

        /**
         * If the account is confirmed, proceed with the sign-in process
         */
        if (response?.isSignedIn) {
          // const email = data.email.toLowerCase();
          // const { response: userResponse, error: userError } = await httpServiceObj.get<[{}]>(`/user/${email}/details`, true, {});
          const { response: dynamoResponse, error } = await httpServiceObj.get<
            [Partial<CorporateUserDetail>]
          >(`/user/${loginData.email}/details`, true, {});
          if (error) {
            toast.error("Error: " + error, getToastOptions({ autoClose: false }));
            CognitoServiceObj.handleSignOut();
          }
          const userResponse = dynamoResponse?.[0] || {};
          if (userResponse?.isDeleted === true) {
            toast.error(
              "Your account has been deactivated. Please contact support for assistance.",
              getToastOptions({ autoClose: false })
            );
            CognitoServiceObj.handleSignOut();
            return;
          }
          await checkUserLoggedIn();
          await handleRememberDevice();
          await currentSession();
          setUpdateCheck(true);
          await fetchCorporateCompanyDetails();
          toast.success("Successfully signed in", getToastOptions({}));
          setTimeout(() => {
            window.location.href = `/${import.meta.env.APP_PROXY_DASH}/corporate/jobs`;
          }, 2000);
        }
      }
    } catch (error: any) {
      // toast.error(error?.message || 'Something went wrong', getToastOptions({ autoClose: false }));
      console.log("Error during sign-in:", error);
      // CognitoServiceObj.handleSignOut();
    }
  };

  return (
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
      className="w-full ">
      <p className="font-semibold text-gray-700 text-2xl text-center ">Corporate Login </p>
      <div className="mainForm min-w-full grid sm:grid-cols-[repeat(auto,_minmax(500px,500px))] grid-row-[min-content]   w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[250px] ">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            className="input_primary auth_input "
            {...register("email", validationRules.corporateEmail)}
          />
          {errors.email && (
            <p className="text-sm text-left text-red-500">{errors.email.message?.toString()}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <label className="block font-medium">Password</label>
          <input
            type={showPassword ? "text" : "password"}
            className={`input_primary auth_input  ${errors.password && "error"}`}
            {...register("password", validationRules.password)}
          />
          <span
            className="absolute right-3 top-9 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <i className="fa-regular fa-eye-slash mt-2"></i>
            ) : (
              <i className="fa-regular fa-eye mt-2"></i>
            )}
          </span>
          {errors.password && (
            <p className="text-sm text-left text-red-500">{errors.password.message?.toString()}</p>
          )}
        </div>
        <a
          onClick={() => navigate("/auth/resetpassword", { state: { pagetype: "CORP" } })}
          className="text-right cursor-pointer text-sm text-blue-500 ">
          Forgot password?
        </a>
      </div>
      <button type="submit" className="btn_primary w-[250px]">
        Login
      </button>
    </form>
  );
};

export default CorporateLoginForm;
