import { useCallback } from "react";
import { getToastOptions } from "@Utils/Toast.utils";
import { toast } from "react-toastify";
import CognitoServiceObj from "@Utils/Cognito.utils";
import { set } from "react-hook-form";

export const useCrossAppAuth = () => {

  const isLoggedIn  = CognitoServiceObj.isLoggedIn() 
  const navigate = useCallback((targetHref: string) => {
    // Add logic to check if user is allowed
    if (!isLoggedIn) {
        // reload the curernt page
        toast.error("Access Denied: Your session has expired. Please log in again to continue.", getToastOptions());
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
