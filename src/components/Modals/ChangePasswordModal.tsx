import { useEffect, useState, ReactNode } from "react";
import { XCircle, AlertTriangle, CheckCircle, Info, Share } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  type: "error" | "warning" | "success" | "info" | "share";
  isdisabled?: boolean;
  title: string;
//   children: ReactNode;
  onSubmit: () => void | Promise<any>;
  onClose?: () => void;
  showCloseButton?: boolean;
  hideDefaultButtons? :boolean;
  password:string;
  setPassword:(value:string)=>void;
  showPassword:boolean;
  setShowPassword:(value:boolean)=>void;
  confirmPassword:string;
  setConfirmPassword:(value:string)=>void;
  showConfirmPassword:boolean;
  setShowConfirmPassword:(value:boolean)=>void;
  setStep:(value:"password" | "otp")=>void;
  step:string;
  setOtp:(value:string)=>void;
  otp:string;
}

const icons = {
  error: <XCircle className="text-red-500 w-6 h-6" />, 
  warning: <AlertTriangle className="text-yellow-500 w-6 h-6" />, 
  success: <CheckCircle className="text-green-500 w-6 h-6" />, 
  info: <Info className="text-blue-500 w-6 h-6" />,
  share : <Share className="text-blue-500 w-6 h-6" />,
};

export default function ChangePasswordModal({
  type,
  isdisabled,
  title,
//   children,
  onSubmit,
  onClose,
  showCloseButton = true,
  hideDefaultButtons = false,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  confirmPassword,
  setConfirmPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  setStep,
  step,
  setOtp,
  otp
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-5 transform transition-transform scale-95 opacity-1 animate-fadeIn">
        <div className="flex items-start gap-4">
          {icons[type]}
          <h2 className="text-gray-900 font-semibold flex-1">{title}</h2>
          {showCloseButton && onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✖
            </button>
          )}
        </div>

          {step === "password" ? (
            <div className="flex flex-col gap-3 mt-4">
              {/* Password */}
            <div className="relative">
              <input
                // disabled={step === 'otp'}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="input_primary auth_input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="fa-regular fa-eye-slash mt-2"></i>
                ) : (
                  <i className="fa-regular fa-eye mt-2"></i>
                )}
              </span>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <input
                // disabled={step === 'otp'}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className={`input_primary auth_input pr-10 ${
                  password !== confirmPassword && confirmPassword.length > 0
                    ? "error"
                    : ""
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <i className="fa-regular fa-eye-slash mt-2"></i>
                ) : (
                  <i className="fa-regular fa-eye mt-2"></i>
                )}
              </span>
            </div>

            {password !== confirmPassword && confirmPassword.length > 0 && (
              <label className="text-xs text-red-500">
                Passwords do not match
              </label>
            )}
          </div>
          ):(
              <div className="flex flex-col gap-3">
                <p>Please enter the OTP sent to your email</p>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  className={`input_primary auth_input ${
                    otp.length > 0 && otp.length !== 6 ? "error" : ""
                  }`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <label className="text-xs text-gray-500">
                  OTP will expire in 5 minutes
                </label>
              </div>
            )}
        {/* <div className="mt-4">{children}</div> */}
        {!hideDefaultButtons && ( // for removing btns as required..
          <div className="flex justify-end gap-2 mt-4">
            <button
              disabled={
                typeof isdisabled === "boolean"
                  ? isdisabled
                  : step === "password"
                    ? password !== confirmPassword || confirmPassword.length <= 0
                    : otp.length !== 6
              }
              onClick={onSubmit}
              className="btn_secondary disabled:opacity-50 disabled:pointer-events-all disabled:cursor-not-allowed "
            >
              Submit
            </button>
            {onClose && (
              <button
                onClick={onClose }
                className="btn_t1 logout !text-[18px] border-[1px] border-red-500 "
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}