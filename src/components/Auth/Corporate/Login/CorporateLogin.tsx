import { logo_text } from "@Assets";
import MainLoader from "@Components/Loader/Loader";
import CorporateLoginForm from "./CorporateLoginForm";
import { useEffect, useState } from "react";
import CognitoServiceObj from "@Utils/Cognito.utils";
import { useAppContext } from "@Context/App.context";
import MessageModal from "@Components/Modals/MessageModal";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";

const CorporateLogin = () => {
  const navigate = useNavigate();
  const { isLoggedIn, setUpdateCheck } = useAppContext();
  const [modalData, setModalData] = useState<{
    type: "none" | "error" | "warning" | "success" | "info";
    heading?: { message: string; type: "error" | "warning" | "success" | "info" };
    message: string;
    buttons?: { label: string; action: () => void; type?: "primary" | "danger" | "warning" | "success" }[];
  } | null>(null);

  // Function to close the modal
  const handleForceLogin = () => {
    CognitoServiceObj.handleSignOut();
    setModalData(null);
    setUpdateCheck((prev) => !prev);
  };

  useEffect(() => {
    if (isLoggedIn) {
      const userType = secureStorage.getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE);
      setModalData({
        type: "warning",
        heading: { message: "Already Logged In!", type: "warning" },
        message: "You Are Already Logged In. Do you wish to logout and continue?",
        buttons: [
          { label: "Continue", action: handleForceLogin, type: "danger" },
          { label: "Back to Home", action: () => navigate(userType?.includes(UserRole.CORPORATE) ?`/${import.meta.env.APP_PROXY_DASH}/corporate/jobs/` : "/") },
        ],
      });
    }
  }, []);

  return (
    <div id="Authlayout" className="h-[100vh] flex justify-center items-center w-full bg-white relative overflow-hidden">
      <div className="absolute bottom-0 -left-48 w-[25vw] h-[20vw] rounded-[10vh] rotate-[245deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
      <div className="absolute top-0 -right-48 w-[25vw] h-[20vw]   rounded-[10vh] rotate-[65deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
      {/* worko logo */}
      <div className="absolute top-4 center-4 z-20">
        <img src={logo_text} alt="Worko Logo" className="w-32 h-auto" />
      </div>
      {false ? (
        <MainLoader />
      ) : (
        <div className=" flex items-center justify-center gap-4 z-20  sm:max-w-[80%] w-[350px] h-min">
          <CorporateLoginForm />
        </div>
      )}
      {/* Show modal only when modalData is set */}
      {modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}
    </div>
  );
};

export default CorporateLogin;
