import { useEffect, useState } from "react";
import { XCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface MessagePopupProps {
  type: "error" | "warning" | "success" | "info";
  message: string;
  buttons?: { label: string; action: () => void }[];
  onClose?: () => void;
  showCloseButton?: boolean;
}

const icons = {
  error: <XCircle className="text-red-500 w-6 h-6" />, 
  warning: <AlertTriangle className="text-yellow-500 w-6 h-6" />, 
  success: <CheckCircle className="text-green-500 w-6 h-6" />, 
  info: <Info className="text-blue-500 w-6 h-6" />,
};

export default function MessageModal({
  type,
  message,
  buttons = [],
  onClose,
  showCloseButton = true,
}: MessagePopupProps) {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-5 transform transition-transform scale-95 opacity-1 animate-fadeIn">
        <div className="flex items-start gap-4">
          {icons[type]}
          <p className="text-gray-700 flex-1">{message}</p>
          {showCloseButton && onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✖
            </button>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {buttons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.action}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
