import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import httpServiceObj from "@Services/ApiHandler.service";
import CorporateSignupForm from "./CorporateSignupForm";
import MessageModal from "@Components/Modals/MessageModal";
import { toast } from "react-toastify";
import MainLoader from "@Components/Loader/Loader"; // Assuming you have a loader component
import CognitoServiceObj from "@Utils/Cognito.utils";
import { getToastOptions } from "@Utils/Toast.utils";
import { logo_text } from "@Assets";

const CorporateSignup = () => {
  const { id } = useParams();
  const navigateTo = useNavigate();
  const queryClient = useQueryClient();

  const [modalData, setModalData] = useState<{
    type: "none" | "error" | "warning" | "success" | "info";
    heading?: { message: string; type: "error" | "warning" | "success" | "info" };
    message: string;
    buttons?: { label: string; action: () => void; type?: "primary" | "danger" | "warning" | "success" }[];
  } | null>(null);
  const [hasProcessedExisting, setHasProcessedExisting] = useState<boolean>(false);

  // Function to show error modals
  const showModalsError = (caseType: string) => {
    switch (caseType) {
      case "invalid":
        setModalData({
          type: "error",
          heading: { message: "Invalid Request", type: "error" },
          message: "The invite you are trying to access is invalid. Please contact the company for a valid invite.",
          buttons: [{ label: "Back to Home", action: () => navigateTo("/") }],
        });
        setTimeout(() => navigateTo("/"), 10000);
        break;
      case "expired_in":
        setModalData({
          type: "error",
          heading: { message: "Invite Expired", type: "error" },
          message: "The invite you are trying to access has expired. Please contact the company for a new invite.",
          buttons: [{ label: "Back to Home", action: () => navigateTo("/") }],
        });
        setTimeout(() => navigateTo("/"), 10000);
        break;
      default:
        setModalData({
          type: "error",
          heading: { message: "Something Went Wrong!", type: "error" },
          message: "Looks like something went wrong. Please try again later.",
          buttons: [{ label: "Back to Home", action: () => navigateTo("/") }],
        });
    }
  };

  // Function to save data to DynamoDB for existing evaluator
  const saveExistingEvaluatorData = async (formData: any) => {
    try {
      const dbData: any = {
        cognitoUserId: data.evaluatorCognitoUserId,
        companyId: data.companyId,
        email: data.email,
        inviteId: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        corporateUserType: data.corporateUserType,
      };

      // Add phone number if provided
      if (formData?.phoneNumberDetails) {
        dbData.phoneNumberDetails = formData.phoneNumberDetails;
      }

      const { response: dbResponse, error: dbError } = await httpServiceObj.post<any>("/corporate-user/", dbData, true);
      
      if (dbError) {
        toast.error("Failed to save user data. Please try again later.", getToastOptions());
        return false;
      }
      
      return true;
    } catch (error) {
      toast.error("Something went wrong while saving data. Please try again later.", getToastOptions());
      return false;
    }
  };

  // Fetch data function
  const fetchData = async () => {
    const { response, error, status } = await httpServiceObj.get<any>(`/corporate-invite/${id}`, true);
    
    if (status === 404) throw new Error("Invalid Request");
    if (error) throw new Error("Error fetching data" + error);

    if (["EXPIRED", "ACCEPTED", "DELETED"].includes(response?.inviteStatus)) {
      showModalsError("invalid");
    }
    
    // Don't navigate immediately if evaluatorCognitoUserId exists
    // Let the form handle it after data submission
    
    return response;
  };

  // Fetch data using react-query
  const { isLoading, error, data } = useQuery({
    queryKey: ["inviteData", id],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2, // Retry twice before failing
    enabled: !!id, // Only run query if `id` exists
  });

  // Handle errors in useEffect to prevent infinite loop
  useEffect(() => {
    if (error) {
      toast.error(error.message, getToastOptions());
    }
  }, [error]);

  useEffect(() => {
    if (error) {
      showModalsError("invalid");
    }
  }, [error]);

  /**
   * Prepare Form Data for Submission
   */
  function prepareDataforDB(cognitoId: string): any {
    return {
      cognitoUserId: cognitoId,
      companyId: data.companyId,
      email: data.email,
      inviteId: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      corporateUserType: data.corporateUserType,
    };
  }

  /**
   * handleFormSubmit - Updated to handle existing evaluator case
   */
  async function handleFormSubmit(formData: any) {
    // Check if evaluatorCognitoUserId exists - handle existing evaluator
    if (data?.evaluatorCognitoUserId) {
      const saved = await saveExistingEvaluatorData(formData);
      if (saved) {
        // Navigate to forgot password page after successful data save
        navigateTo("/auth/resetpassword", { 
          state: { 
            from: "corporate-signup", 
            email: data.email 
          } 
        });
      }
      return;
    }

    // Original signup flow for new users
    const signupData = {
      password: formData.password,
      username: formData.email,
      name: formData.name,
    };
    
    const { response, error } = await CognitoServiceObj.handleSignUp(signupData);
    
    if (error) {
      toast.error(error.message, getToastOptions());
      return;
    }
    
    if (response) {
      // Prepare data for DB
      const dbData = prepareDataforDB(response.userId);
      // Add phone number to dbData if exists
      if (formData?.phoneNumberDetails) {
        dbData.phoneNumberDetails = formData.phoneNumberDetails;
      }
      
      const { response: dbResponse, error: dbError } = await httpServiceObj.post<any>("/corporate-user/", dbData, true);
      
      if (dbError) {
        toast.error("Something went wrong. Please try again later.", getToastOptions());
      } else {
        setModalData({
          type: "success",
          heading: { message: "Signup Successful", type: "success" },
          message: "You have successfully signed up. You will be redirected to the login page in 5 seconds.",
          buttons: [{ label: "Go to Login", action: () => navigateTo("/auth/corporate/login") }],
        });
        setTimeout(() => navigateTo("/auth/corporate/login"), 5000);
      }
    }
  }

  // Auto-handle existing evaluator: save to DB and redirect to reset password
  useEffect(() => {
    const handleExisting = async () => {
      if (!data?.evaluatorCognitoUserId || hasProcessedExisting) return;
      setHasProcessedExisting(true);
      const saved = await saveExistingEvaluatorData(undefined);
      if (saved) {
        navigateTo("/auth/resetpassword", {
          state: {
            from: "corporate-signup",
            email: data.email,
            pagetype: "CORP",
          },
        });
      } else {
        setHasProcessedExisting(false);
      }
    };
    handleExisting();
  }, [data?.evaluatorCognitoUserId]);

  return (
    <div id="Authlayout" className="h-[100vh] flex justify-center items-center w-full bg-white relative overflow-hidden">
      <div className="absolute bottom-0 -left-48 w-[25vw] h-[20vw] rounded-[10vh] rotate-[245deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
      <div className="absolute top-0 -right-48 w-[25vw] h-[20vw] rounded-[10vh] rotate-[65deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
      
      {/* worko logo */}
      <div className="absolute top-4 center-4 z-20">
        <img src={logo_text} alt="Worko Logo" className="w-32 h-auto" />
      </div>
      
      {isLoading && !data ? (
        <MainLoader />
      ) : data && data.evaluatorCognitoUserId ? (
        // Show loader or message while processing existing evaluator
        <div className="flex flex-col items-center justify-center gap-4 z-20">
          <MainLoader />
          <p className="text-gray-600 text-center">Setting up your account...</p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-4 z-20 w-min">
          <CorporateSignupForm 
            inviteData={data} 
            handleFormSubmit={handleFormSubmit}
          />
        </div>
      )}

      {/* Show modal only when modalData is set */}
      {modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}
    </div>
  );
};

export default CorporateSignup;