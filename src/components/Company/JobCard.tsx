import { useState, useMemo, useEffect } from "react";
import { MapPin, Clock, ChevronDown } from "lucide-react";
import GaugeComponent from "./Gauge";
import CustomModal from "@Components/Modals/FormModal";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@Context/App.context";
import { toast } from 'react-toastify';
import { DaysFormatter } from "@Utils/DaysFormatter.utils";
import httpServiceObj from "@Services/ApiHandler.service";
import { JobDto } from "@Interfaces/JobsAndCompany.dto";
import countryCodes from "@Utils/CountryCodes.utils";

export const JobCard = ({ job }: any) => {
  const { isLogoAvailable,companyLogo, title, department, salary, location, employmentType, createdAt, matchPercentage, jobId, companyName, isExternalJob, badJob, FullJob, companyId, jobUrl } = job;
  const { isLoggedIn } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "" });
  const [strengthLabel, setStrengthLabel] = useState<string>("Strong Match");
  const [imgError, setImgError] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const {userDetails} = useAppContext()
  // const userId = userDetails?.id

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCountryCodeSelect = (code: string) => {
    setCountryCode(code);
    setShowCountryDropdown(false);
  };

  const nav = useNavigate();

  const handleReferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const requestData = {
  recipientDetails: {
    name: formData.fullName,
    email: formData.email,
    phoneNumber: formData.phone,
    phoneCountryCode: countryCode.replace('+','')
  },
  companyDetails: {
    id: companyId,
    name: companyName
  },
  jobDetails: {
    id: jobId,
    title: title,
    url: jobUrl
  }
};
  
    try {
      const { response, error, status } = await
        httpServiceObj.post('https://jobs.dev.worko.work/refer-and-earn', requestData, true, {}, true)
       
      if (status === 409) {
        toast.error('You have already referred this person for this job.');
        return;
      }
      if (status === 201) {
        toast.success('Referral applied successfully!');
        return;
      }
  
      setShowModal(false);
    } catch (error: any) {
      console.error('Error details:', error);
      toast.error(error?.message || 'Failed to submit referral');
    }
    finally{
      setFormData({ fullName: "", phone: "", email: "" });
      setShowModal(false);
    }
  };
   
  
  

  const isEarlyApplicant = useMemo(() => {
    const createdDate = new Date(createdAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return createdDate >= threeDaysAgo;
  }, [createdAt]);

  const timeAgo = useMemo(() => DaysFormatter(createdAt), [createdAt]);
  

  const handleReferralNav = () => {
    // console.log(companyName);
    // Replace any whitespace special characters with underscore in company name
    const refinedCompanyName = companyName.replace(/\s/g, "_");
    nav(`/jobs/${refinedCompanyName}/${jobId}`,{state:{FullJob:FullJob as JobDto}});
  };

  useEffect(() => {
    // Update the strength label based on the match score
    if (matchPercentage < 40) {
      setStrengthLabel("Poor Match");
    } else if (matchPercentage < 60) {
      setStrengthLabel("Moderate Match");
    } else if (matchPercentage < 80) {
      setStrengthLabel("Good Match");
    } else {
      setStrengthLabel("Strong Match");
    }
  }, [matchPercentage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.country-dropdown-container')) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-white rounded-[20px] md:rounded-[15px] border border-black/5 shadow-[0px_4px_16px_rgba(0,0,0,0.05)] md:shadow-[0px_3px_12px_rgba(0,0,0,0.05)] p-6 md:p-4">
      <div className="flex flex-col gap-4">
        {/* Header Section - Changed to flex-col on mobile */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          {/* Left section with image, title, and tags - Full width on mobile */}
          <div className="flex flex-col w-full md:max-w-[70%] gap-2">
            {/* Top row with image, title, department, and salary */}
            <div className="flex w-full gap-4">
              {/* Image column */}
              <div data-tooltip-id="my-tooltip" data-tooltip-content={companyName}  className=" relative cursor-pointer flex-shrink-0 w-[70px] h-[70px]  rounded-[6.75px] sm:rounded-[9px] flex items-center justify-center border overflow-hidden">{isLogoAvailable && !imgError ?  <img src={companyLogo} onError={() => setImgError(true)} alt={title} className="w-[60px] object-contain border h-[60px] sm:w-20 sm:h-20 rounded-[6.75px] sm:rounded-[9px]" /> : <div className="w-full text-wrap truncate text-[60%] font-extrabold text-sky-400 ">{companyName}</div>}</div>

              {/* Content column */}
              <div className="flex flex-col flex-1 min-w-0">
                <h2 className="text-xl text-left sm:text-2xl md:text-lg font-semibold text-[#0D0D0D] mb-1 truncate capitalize sm:overflow-visible sm:text-ellipsis sm:whitespace-normal">{title}</h2>
                <p className="text-xs text-left md:text-[9px] text-[#313131] mb-1 capitalize ">{department}</p>

                {/* Salary */}
                <div className="text-left text-sm md:text-xs font-semibold text-[#0D0D0D]">₹ {salary}</div>
              </div>
            </div>

            {/* Mobile layout: Arrange tags and gauge on same row */}
            <div className="flex flex-row justify-between mt-2 md:mt-1">
              {/* Tags - Flex-wrap on mobile */}
              <div className="flex flex-wrap gap-1 overflow-hidden">
                <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">{timeAgo}</span>
                {isEarlyApplicant && <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">Be an early applicant</span>}
                {!isExternalJob && <span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">Posted Job by Worko</span>}
                {/* {<span className="px-3 py-1 max-h-[25px] bg-[#6DE5E5] rounded-full text-xs md:text-[10.5px] text-black whitespace-nowrap">{jobStatus}</span>} */}
                {badJob && <span className="px-3 py-1 max-h-[25px] bg-red-400 rounded-full text-xs md:text-[10.5px]  whitespace-nowrap animate-pulse text-white ">Removing irrelevant job...</span>}
              </div>

              {/* Gauge on mobile only */}
              <div
                className=" md:hidden flex flex-col items-center justify-center flex-shrink-0 
    rounded-xl w-[90px] h-[90px] sm:w-[122px] sm:h-[120px] 
    bg-gradient-to-b from-[#316BFF] to-[#316BFF] 
    overflow-hidden text-white p-3 sm:p-5">
                {/* Gauge Wrapper */}
                <div
                  className="w-[75%] h-[75%] sm:w-[85%] sm:h-[85%] 
      flex items-center justify-center  ">
                  <GaugeComponent score={matchPercentage} />
                </div>

                {/* Text Below Gauge */}
                {isLoggedIn ? (
                  <p className="text-[10px] sm:text-sm font-bold mt-1 whitespace-nowrap">
  {matchPercentage !== -1 ? strengthLabel : "Processing"}
</p>
                ) : (
                  <div className="flex  items-center  w-full gap-1 mt-1 text-center">
                    <small className="text-[8px] sm:text-xs"  data-tooltip-id="my-tooltip" data-tooltip-content="Please login to view scores">Account Required</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Score - Moved inside the flex container */}
          <div
            className="hidden md:flex py-4 box-content ml-auto rounded-xl w-[91.5px] h-[75px] sm:w-[122px] sm:h-[100px] 
              flex-shrink-0 bg-gradient-to-b from-blue-500 to-blue-600
              overflow-hidden text-white p-3 sm:p-5  flex-col items-center justify-center scale-90">
            {/* Gauge Component */}
            <div
              className="w-full pt-2  h-full  border-3 border-[#6DE5E5] 
            flex items-center justify-center sm:scale-90">
              <GaugeComponent score={matchPercentage} />
            </div>

            {/* Text Below Gauge */}
            {isLoggedIn ? (
              <p className="text-[10px] sm:text-sm font-bold whitespace-nowrap">{matchPercentage !== -1 ? strengthLabel : "Processing"}</p>
            ) : (
              <>
                <small  data-tooltip-id="my-tooltip" data-tooltip-content="Please login to view scores">Account Required</small>
              </>
            )}
          </div>
        </div>

        {/* Location, Job Type, and Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Location and Job Type */}
          <div className="flex flex-wrap gap-6 md:gap-4 text-xs md:text-[12px] text-[#313131]">
            <div className="flex items-center gap-1">
              <MapPin size={16} className="md:w-3 md:h-3" />
              <span className="capitalize ">{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="md:w-3 md:h-3" />
              <span>{employmentType ? (employmentType.includes("_") ? employmentType.replace(/_/g, " ") : employmentType) : ""}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:justify-end">
            { !isExternalJob && 
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 md:flex-initial md:w-[140px] px-6 py-2 border border-[#0D0D0D] rounded-lg text-sm md:text-xs font-bold h-auto sm:h-9">
              Refer A Friend
            </button> 
            }
            <button onClick={() => handleReferralNav()} className="flex-1 sm:mr-2 md:flex-initial md:w-[140px] px-6 py-2 bg-[#4B7EFF] text-white rounded-lg text-sm md:text-xs font-bold h-auto sm:h-9">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
  <CustomModal 
    type="share" 
    title="Refer a Friend and Earn Rewards!" 
    onSubmit={()=>{}}// Pass function directly
    onClose={() => setShowModal(false)}
    hideDefaultButtons={true}
  >
    <div className="text-center px-4">
      <p className="text-gray-600 text-sm mb-4">
        Enter the details of the candidate you believe is a great fit for the role. If your referral gets hired, you'll receive a monetary reward as a bonus!
      </p>
    </div>
    <form className="space-y-4 px-4" onSubmit={handleReferSubmit}> 
      <div>
        <input 
          type="text" 
          name="fullName" 
          value={formData.fullName} 
          onChange={handleChange} 
          className="input_primary text-gray-500 w-full p-2 border rounded" 
          placeholder="Full Name" 
          required 
        />
      </div>
      <div>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          className="input_primary text-gray-500 w-full p-2 border rounded" 
          placeholder="E-Mail ID" 
          required 
        />
      </div>
      <div>
        {/* Phone input with country code dropdown */}
        <div className="flex items-center">
          {/* Country code dropdown */}
          <div className="relative country-dropdown-container">
            <div 
              className="input_primary flex items-center gap-1 text-gray-500 p-2 border rounded cursor-pointer border-r-0"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            >
              <span>{countryCode}</span>
              <ChevronDown size={14} />
            </div>
            
            {/* Dropdown list */}
            {showCountryDropdown && (
              <div className="absolute z-10 top-full left-0 mt-1 w-48 max-h-44 overflow-y-auto bg-white shadow-lg rounded border">
                {countryCodes.map((item) => (
                  <div 
                    key={item.code} 
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                    onClick={() => handleCountryCodeSelect(item.code)}
                  >
                    <span className="font-medium">{item.code}</span>
                    <span className="text-gray-500">{item.country}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Phone input */}
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            className="input_primary text-gray-500 flex-1 p-2 border rounded" 
            placeholder="Contact Number" 
            required 
          />
        </div>
      </div>
      <div className="text-center mt-4">
        <button 
          type="submit" 
          className="bg-blue-500 text-white font-semibold py-2 px-6 rounded w-full"
        >
          Submit Referral
        </button>
      </div>
    </form>
    <p className="text-gray-400 text-xs text-center mt-4 px-4">
      Your information is secure and will only be used to process your referral and communicate about the program.
    </p>
  </CustomModal>
)}

    </div>
  );
};

export default JobCard;