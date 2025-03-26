import { useEffect, useState, ReactNode } from "react";
import { XCircle, AlertTriangle, CheckCircle, Info, Share } from "lucide-react";
import { createPortal } from "react-dom";

interface ModalProps {
  type: "error" | "warning" | "success" | "info" | "share";
  isdisabled?: boolean;
  title: string;
  children: ReactNode;
  onSubmit: () => void | Promise<any>;
  onClose?: () => void;
  showCloseButton?: boolean;
  hideDefaultButtons? :boolean;
}

const icons = {
  error: <XCircle className="text-red-500 w-6 h-6" />, 
  warning: <AlertTriangle className="text-yellow-500 w-6 h-6" />, 
  success: <CheckCircle className="text-green-500 w-6 h-6" />, 
  info: <Info className="text-blue-500 w-6 h-6" />,
  share : <Share className="text-blue-500 w-6 h-6" />,
};

export default function CustomModal({
  type,
  isdisabled,
  title,
  children,
  onSubmit,
  onClose,
  showCloseButton = true,
  hideDefaultButtons = false,
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
        <div className="mt-4">{children}</div>
        {!hideDefaultButtons && ( // for removing btns as required..
          <div className="flex justify-end gap-2 mt-4">
            <button
              disabled = {isdisabled || false}
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