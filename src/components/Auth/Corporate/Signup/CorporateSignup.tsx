import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import httpServiceObj from "@Services/ApiHandler.service";
import CorporateSignupForm from "./CorporateSignupForm";
import MessageModal from "@Components/Modals/MessageModal";
import { toast } from "react-toastify";
import MainLoader from "@Components/Loader/Loader"; // Assuming you have a loader component
import CognitoServiceObj from "@Utils/Cognito.utils";

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
    if (status === 404) return { errorType: "invalid" };
    if (error) throw new Error("Error fetching data" + error);

    if (['EXPIRED', 'ACCEPTED', 'DELETED'].includes(response?.inviteStatus)) {
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

  // Handle errors in useEffect to prevent infinite loop
  useEffect(() => {
    if (error) {
      toast.error(error.message);
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
    function prepareDataforDB( cognitoId: string): any {
      return {
        cognitoUserId: cognitoId, // This is the cognito id of the user
        companyId: data.companyId,
        email: data.email,
        inviteId: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        corporateUserType: data.corporateUserType,
      }
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
      // phone_number: "+91" + this.userForm.get('phoneNumber')?.value
    };
    const { response, error } = await CognitoServiceObj.handleSignUp(signupData);
    if (error) {
      toast.error(error.message);
      return;
    }
    if(response){
    // Prepare data for DB
    const dbData = prepareDataforDB( response.userId);
    // debugger;
    const { response: dbResponse, error: dbError } = await httpServiceObj.post<any>("/corporate-user/", dbData, true);
    if (dbError) {
      toast.error("Something went wrong. Please try again later.");
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
    <div id="Authlayout" className="h-[100vh] flex justify-center items-center bg-gradient-to-t from-blue-700 via-blue-500 to-slate-50">
      {isLoading ? (
        <MainLoader />
      ) : (
        <div className="w-full max-w-[1300px] flex items-center justify-center gap-4 z-20">
          <div className="corporate_text hidden md:block">
            <p className="text-left text-4xl tracking-wide mb-2 font-semibold text-white">
              Find & hire the right talent with us
            </p>
            <p className="text-left text-white">Trusted by 10k+ candidates | 2.7k+ employers</p>
          </div>
          <div className="min-h-[500px] px-8 pt-8 pb-16 sm:px-14 flex justify-between rounded-3xl w-full items-center bg-white shadow">
            <CorporateSignupForm inviteData={data} handleFormSubmit={handleFormSubmit}/>
          </div>
        </div>
      )}

      {/* Show modal only when modalData is set */}
      {modalData && (
        <MessageModal
          {...modalData}
          onClose={() => setModalData(null)}
          showCloseButton={false}
        />
      )}
    </div>
  );
};

export default CorporateSignup;
