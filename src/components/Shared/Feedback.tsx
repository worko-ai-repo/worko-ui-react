import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export interface FeedbackModalProps {
  title: string;
  details?: string; // Accepts HTML content
  showCloseButton?: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ title  , details, showCloseButton = true, onClose }) => {
    const formattedDetails = details ? details.replace(/\n/g, "<br>") : "We encountered an error while processing. Please try again after some time.";

    return  createPortal (
    <div className="  fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
    <div className={` relative max-h-[500px] max-sm:max-w-[90vw]  min-w-[300px] p-4 rounded-3xl bg-blue-600 backdrop-blur-[10px] border border-white/10 shadow-md shadow-black flex flex-col items-center gap-2`}>

  
        {/* Title */}
        <div className="text-center">
          <h6 className="text-lg sm:text-2xl text-white font-semibold ">{title ? title : 'Feedback' }</h6>
        </div>
      <div className="pt-6 overflow-auto bg-blue-800 text-white p-6 rounded-lg  w-full max-w-md">

        {/* Details (supports HTML content) */}

          <div className="text-justify max-h-[350px]  ">
            <div className="text-white text-xs sm:text-sm " dangerouslySetInnerHTML={{ __html: formattedDetails }} />
          </div>

      </div>
        {/* Close Button */}
        {showCloseButton && (
          <div className=" flex justify-center  w-full ">
            <button
              onClick={onClose}
              className="px-4 py-2 border text-white rounded-md hover:bg-gray-200/10 transition"
            >
              Close
            </button>
          </div>
        )}
    </div>
    </div>,
 document.body
  );
};

export default FeedbackModal;
