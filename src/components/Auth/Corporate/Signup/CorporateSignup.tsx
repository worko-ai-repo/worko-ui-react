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

  // Fetch data function
  const fetchData = async () => {
    const { response, error, status } = await httpServiceObj.get<any>(`/corporate-invite/${id}`, true);
    // debugger;
    if (status === 404) throw new Error("Invalid Request");
    if (error) throw new Error("Error fetching data" + error);

    if (["EXPIRED", "ACCEPTED", "DELETED"].includes(response?.inviteStatus)) {
      showModalsError("invalid");
    }
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

  /*   useEffect(() => {
    console.log("Data fetched:", data);
  }, [data]); */
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
      cognitoUserId: cognitoId, // This is the cognito id of the user
      companyId: data.companyId,
      email: data.email,
      inviteId: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      corporateUserType: data.corporateUserType,
      
    };
  }

  /**
   * handleFormSubmit
   *
   * @param data
   * @returns
   */
  async function handleFormSubmit(formData: any) {
    // signup in Cognito
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
      // push the phn number to dbData if exists
        dbData.phoneNumberDetails = formData.phoneNumberDetails;
      // debugger;
      const { response: dbResponse, error: dbError } = await httpServiceObj.post<any>("/corporate-user/", dbData, true);
      if (dbError) {
        toast.error("Something went wrong. Please try again later.", getToastOptions());
      } else {
        setModalData({
          type: "success",
          heading: { message: "Signup Successful", type: "success" },
          message: "You have successfully signed up. You will be redirected to the login page in 5 seconds.",
          buttons: [{ label: "Go to Login", action: () => navigateTo("/login") }],
        });
        setTimeout(() => navigateTo("/auth/corporate/login"), 5000);
      }
    }
  }
  return (
    <div id="Authlayout" className="h-[100vh] flex justify-center items-center w-full bg-white relative overflow-hidden">
      <div className="absolute bottom-0 -left-48 w-[25vw] h-[20vw] rounded-[10vh] rotate-[245deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
      <div className="absolute top-0 -right-48 w-[25vw] h-[20vw]   rounded-[10vh] rotate-[65deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
      {/* worko logo */}
      <div className="absolute top-4 center-4 z-20">
        <img src={logo_text} alt="Worko Logo" className="w-32 h-auto" />
      </div>
      {isLoading && !data ? (
        <MainLoader />
      ) : (
        <div className=" flex items-center justify-center gap-4 z-20 w-min">
          {/* <div className="min-h-[500px] px-8 pt-8 pb-16 sm:px-14 flex justify-between rounded-3xl w-full items-center bg-white shadow"> */}
          <CorporateSignupForm inviteData={data} handleFormSubmit={handleFormSubmit} />
          {/* </div> */}
        </div>
      )}

      {/* Show modal only when modalData is set */}
      {modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}
    </div>
  );
};

export default CorporateSignup;
