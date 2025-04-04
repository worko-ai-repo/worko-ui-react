import { Login_Boy } from "@Assets";
import LoginForm from "./LoginForm";
import { useEffect, useState } from "react";
import MessageModal from "@Components/Modals/MessageModal";
import { AppContext, useAppContext } from "@Context/App.context";
import { useNavigate } from "react-router-dom";
import CognitoServiceObj from "@Utils/Cognito.utils";

const Login = () => {
  const navigateTo = useNavigate();
  const [modalData, setModalData] = useState<{
    type: "none" | "error" | "warning" | "success" | "info";
    heading?: { message: string; type: "error" | "warning" | "success" | "info" };
    message: string;
    buttons?: { label: string; action: () => void; type?: "primary" | "danger" | "warning" | "success" }[];
  } | null>(null);

  const { isLoggedIn, setUpdateCheck } = useAppContext();

  // Function to close the modal
  const handleForceLogin = () => {
    CognitoServiceObj.handleSignOut();
    setModalData(null);
    setUpdateCheck((prev) => !prev);
  };

  useEffect(() => {
    if (isLoggedIn) {
      setModalData({
        type: "warning",
        heading: { message: "Already Logged In!", type: "warning" },
        message: "You Are Already Logged In. Do you wish to logout and continue?",
        buttons: [
          { label: "Continue", action: handleForceLogin, type: "danger" },
          { label: "Back to Home", action: () => navigateTo("/") },
        ],
      });
    }
  }, []);

  return (
    <div className=" scale-90 flex justify-center relative w-full h-min max-w-[1120px] overflow-hidden rounded-xl sm:rounded-3xl bg-white shadow z-20 ">
      <div className="flex justify-around items-center w-full  py-8 ">
        {/* Image Section (Hidden on Small Screens) */}
        <div className="hidden sm:flex flex-1 max-w-[40%]">
          <img src={Login_Boy} alt="login_img" className="w-full h-auto object-contain" />
        </div>

        {/* Login Form Section */}
        <div className="flex-1 max-w-[550px] w-full">
          <LoginForm />
        </div>
      </div>
      {/* Show modal only when modalData is set */}
      {modalData && (
        <MessageModal
          {...modalData}
          onClose={() => {
            setModalData(null);
          }}
          showCloseButton={false}
        />
      )}
    </div>
  );
};
export default Login;
