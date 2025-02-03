import { useState } from "react";
import { CloudAlert } from "lucide-react";

interface ErrorWarningProps {
  isError: boolean;
  error: { message: string } | null;
  onDismiss?: () => void;
}

const ErrorWarning: React.FC<ErrorWarningProps> = ({ isError, error, onDismiss }) => {
  const [showMessage, setShowMessage] = useState(false);

  if (!isError || !error) return null;

  return (
    <div className="fixed bottom-10 left-10 z-50 flex flex-col items-start">
      {/* Error Message Popup */}
      {showMessage && (
        <div className="mb-2 bg-red-600 text-white p-3 rounded-lg shadow-md text-sm">
          {error.message}
        </div>
      )}

      {/* Error Icon */}
      <div
        className="cursor-pointer bg-[#FFC107] shadow-lg text-white p-5 w-min rounded-full flex items-center justify-center"
        onClick={() => setShowMessage(!showMessage)}
      >
        <CloudAlert size={24} />
      </div>
    </div>
  );
};

export default ErrorWarning;
