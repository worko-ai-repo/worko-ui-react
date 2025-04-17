import React from "react";
import styles from "./referralloader.module.scss";
import { createPortal } from "react-dom";
import { CustomModalLoaderMessageBody, CustomModalLoaderMessageType } from "./messages";

interface ReferralLoaderProps {
  step?: 0 | 1 | 2 | 3 | 4; // Default step is 0
}

const ReferralLoader: React.FC<ReferralLoaderProps & { messageType?: CustomModalLoaderMessageType }> = ({ 
  step = 0, 
  messageType = "referral" 
}) => {
  return createPortal(
    <div className="overflow-y-hidden fixed inset-0 flex items-center justify-center bg-black/50 w-full backdrop-blur-sm z-50">
      <div className="w-[500px] h-[300px] rounded-3xl relative -top-5 flex items-center justify-center bg-sky-100 backdrop-blur-[10px] border border-white/10 shadow-md shadow-sky-200 flex-col gap-10">
        <div className={styles.loader}>
          <div className={styles.loaderOne}>
            {[...Array(13)].map((_, index) => (
              <div key={index} className={styles.box_one_sub}></div>
            ))}
          </div>
          <div className={styles.loaderTwo}>
            {[...Array(13)].map((_, index) => (
              <div key={index} className={`${styles.box_one_sub} ${styles.two}`}></div>
            ))}
          </div>
        </div>
        {/* Tailwind-based Text Loader - Show Only Current Step */}
        <div className="relative h-8 flex justify-center items-center font-semibold text-blue-500 w-full overflow-hidden">
          <span className={`opacity-100 !text-sky-500 ${styles.animate_fadeText}`}>
          {CustomModalLoaderMessageBody[messageType][step]}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReferralLoader;
