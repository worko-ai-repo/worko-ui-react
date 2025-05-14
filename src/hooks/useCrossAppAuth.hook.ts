import { useCallback } from "react";
import { getToastOptions } from "@Utils/Toast.utils";
import { toast } from "react-toastify";
import CognitoServiceObj from "@Utils/Cognito.utils";
import { set } from "react-hook-form";

export const useCrossAppAuth = () => {
  const isLoggedIn  = CognitoServiceObj.getAccessToken() 
  const navigate = useCallback((targetHref: string) => {
    // Add logic to check if user is allowed
    if (!isLoggedIn) {
        // reload the curernt page
        toast.error("Access Denied : It looks like your session is expired and the page you are trying to access is not available anymore. Please login again to access the page.", getToastOptions());
        setTimeout(() => {
            window.location.reload();
        }
        , 5000);
      return;
    }
    window.location.href = targetHref;
  }, [isLoggedIn]);

  return navigate;
};
