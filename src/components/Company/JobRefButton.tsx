import { CompanyPageModeEnum } from "@Interfaces/CompanyContext.dto";
import { useEffect, useState } from "react";
import { useCompanyContext } from "../../context/Company.context";
import { useNavigate } from "react-router-dom";

const JobRefButton = () => {
  const Navigate = useNavigate();

  const { companyPageMode } = useCompanyContext();

  const [activeFrame, setActiveFrame] = useState<CompanyPageModeEnum>(companyPageMode);

  const toggleCompanyPageMode = (event: any) => {
    if (event.target.name === "job_toggle") {
      Navigate(`/jobs`);
    } else {
      // window.location.href = `/referrals`;
      Navigate(`/referrals`);
    }
  };

  useEffect(() => {
    const urlMode = location.pathname.includes("referrals") ? CompanyPageModeEnum.REFERRAL : CompanyPageModeEnum.JOB;
    setActiveFrame(urlMode);
  }, [location.pathname, companyPageMode]);

  return (
    <div>
      <div className="group relative flex w-full rounded-lg border-3 border-white bg-white shadow-md p-1">
        {/* Sliding background */}
        <div className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-blue-500 transition-all duration-300 ease-in-out ${activeFrame === CompanyPageModeEnum.REFERRAL ? "translate-x-[100%]" : "translate-x-0"}`} />

        {/* Jobs Toggle */}
        <div className="relative flex-1">
          <input type="radio" onClick={(e) => toggleCompanyPageMode(e)} id="jobs" name="job_toggle" value="jobs" checked={activeFrame === CompanyPageModeEnum.JOB} onChange={() => setActiveFrame(CompanyPageModeEnum.JOB)} className="peer absolute opacity-0 w-full h-auto cursor-pointer" />
          <label htmlFor="jobs" className="relative block w-full text-center px-4 py-1 text-sm font-medium cursor-pointer transition-colors duration-200">
            <span className={activeFrame === CompanyPageModeEnum.JOB ? "text-white" : "text-gray-600 hover:text-gray-800"}>Jobs</span>
          </label>
        </div>

        {/* Referrals Toggle */}
        <div className="relative flex-1">
          <input type="radio" onClick={(e) => toggleCompanyPageMode(e)} id="referrals" name="ref_toggle" value="referrals" checked={activeFrame === CompanyPageModeEnum.REFERRAL} onChange={() => setActiveFrame(CompanyPageModeEnum.REFERRAL)} className="peer absolute opacity-0 w-full h-full cursor-pointer" />
          <label htmlFor="referrals" className="relative block w-full text-center px-4 py-1 text-sm font-medium cursor-pointer transition-colors duration-200">
            <span className={activeFrame === CompanyPageModeEnum.REFERRAL ? "text-white" : "text-gray-600 hover:text-gray-800"}>Referrals</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default JobRefButton;
