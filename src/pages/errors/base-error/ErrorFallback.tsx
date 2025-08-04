import { base_error_bg, logo_text } from "@Assets";
import MessageModal from "@Components/Modals/MessageModal";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";
import { UnauthorizedAccessError } from "@Utils/ErrorBoundary.utils";
import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorFallback = ({ error }: { error?: Error }) => {
  const nav = useNavigate();
  const [modalData, setModalData] = React.useState<{
    type: "none" | "error" | "warning" | "success" | "info";
    heading?: { message: string; type: "error" | "warning" | "success" | "info" };
    message: string;
    buttons?: { label: string; action: () => void; type?: "primary" | "danger" | "warning" | "success" }[];
  } | null>(null);

  React.useEffect(() => {
    if (error instanceof UnauthorizedAccessError) {
      // Get the primary role (first role or the most specific one)
      const primaryRole = error.userRoles?.[0];
      const hasRole = (role: UserRole) => error.userRoles?.includes(role) || false;

      // Check for specific roles and handle accordingly
      if (hasRole(UserRole.CORPORATE)) {
        setModalData({
          type: "error",
          heading: { message: "Corporate Access Denied", type: "error" },
          message: "You do not have access to this page.",
          buttons: [
            { label: "Go to Home", action: () => (window.location.href = `/${import.meta.env.APP_PROXY_DASH}/corporate/jobs`), type: "primary" },
            { label: "Contact Us", action: () => window.open("mailto:support@worko.ai"), type: "warning" },
          ],
        });
      } else if (hasRole(UserRole.ADMIN)) {
        setModalData({
          type: "error",
          heading: { message: "Admin Access Denied", type: "error" },
          message: "You do not have access to this page.",
          buttons: [
            { label: "Go to Home", action: () => nav("/"), type: "primary" },
            { label: "Login as Admin", action: () => nav("/auth/login"), type: "warning" },
          ],
        });
      } else {
        setModalData({
          type: "error",
          heading: { message: "Access Denied", type: "error" },
          message: "You do not have access to this page. Please contact your administrator.",
          buttons: [
            { label: "Go to Home", action: () => nav("/"), type: "primary" },
            { label: "Login", action: () => nav("/auth/login"), type: "warning" },
          ],
        });
      }
    }
  }, [error, nav]);

  if (error instanceof UnauthorizedAccessError) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">{modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}</div>;
  }

  // Default fallback
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white ">
      <div className="max-w-[300px] sm:max-w-[600px] text-center">
        <h1 className="text-blue-500 font-semibold animate-pulse mb-3">Oops! Something went wrong.</h1>
        <p className="text-gray-400">It looks like our platform is facing some issues. Try reloading the page or try again later.</p>
      </div>
      <img src={logo_text} onClick={() => (window.location.href = "/")} className="cursor-pointer w-32 absolute top-2 left-4 sm:top-5 sm:left-10" loading="lazy" alt="logo" />
      <img src={base_error_bg} className="fixed top-[-20px] right-[-20px] w-[200px] sm:top-0 sm:right-0 sm:w-[300px] bg-transparent" alt="" loading="lazy" />
    </div>
  );
};

export default ErrorFallback;