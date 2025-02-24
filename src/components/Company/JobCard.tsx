import { useMemo, useState } from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import CustomModal from '@Components/Modals/FormModal';
import GaugeComponent from './Gauge';
import { logo_text } from '@Assets';

const JobCard = ({ job }: any) => {
  const { 
    title, 
	companyLogo,
    department, 
    salary, 
    location, 
    employmentType, 
    createdAt,
    matchPercentage 
  } = job;


  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ phone: "", email: "" });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = () => {
    alert(`Job shared with: ${formData.phone}, ${formData.email}`);
    setShowModal(false);
  };

  const isEarlyApplicant = useMemo(() => {
	const createdDate = new Date(createdAt);
	const threeDaysAgo = new Date();
	threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
	return createdDate >= threeDaysAgo;
}, [createdAt]);

const timeAgo = useMemo(() => {
	const now = new Date();
	const posted = new Date(createdAt);
	const diffMinutes = Math.floor((now.getTime() - posted.getTime()) / 1000 / 60);
	
	if (diffMinutes < 60) {
	  return `${diffMinutes} mins ago`;
	} else if (diffMinutes < 1440) { // Less than 24 hours
	  const diffHours = Math.floor(diffMinutes / 60);
	  return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
	} else {
	  const diffDays = Math.floor(diffMinutes / 1440); // 1440 = 60 mins * 24 hours
	  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
	}
  }, [createdAt]);

  return (
    <div className="relative w-full bg-white rounded-[15px] sm:rounded-[20px] py-2 px-2 sm:pt-6 sm:px-4">
      {/* Top Section */}
      <div className="flex flex-wrap  ">
        {/* Company Logo */}
        <div className="relative">
          <img 
            src={companyLogo || logo_text} 
            alt={title} 
            className="w-[60px] object-contain border h-[60px] sm:w-20 sm:h-20 rounded-[6.75px] sm:rounded-[9px]"
          />
        </div>

        {/* Job Info */}
        <div className="ml-[5px] sm:ml-5 flex-1">
          <div className="flex flex-col">
            <h2 className="text-sm  sm:text-[24px] text-left font-semibold text-[#0D0D0D] capitalize ">{title}</h2>
            <p className="text-[9px] sm:text-[12px] text-left text-[#313131] capitalize ">{department}</p>
            
            {/* Salary */}
            <div className="flex items-center gap-1 text-[#0D0D0D] font-semibold text-[9px] sm:text-base">
              <span>₹</span>
              <span>{salary}</span>
            </div>
          </div>
        </div>

        {/* Match Score - Moved inside the flex container */}
        <div className="sm:py-4 box-content ml-auto rounded-xl w-[91.5px] h-[75px] sm:w-[122px] sm:h-[100px] 
          flex-shrink-0 bg-gradient-to-b from-blue-500 to-blue-600
          overflow-hidden text-white p-3 sm:p-4 flex flex-col items-center justify-end max-[375px]:scale-75">
          
          {/* Gauge Component */}
          <div className="w-full pt-2  h-full  border-3 border-[#6DE5E5] 
             flex items-center justify-center sm:scale-90">
            <GaugeComponent score={matchPercentage} />
          </div>

          {/* Text Below Gauge */}
          <p className="text-[10px] sm:text-sm font-bold  whitespace-nowrap">Strong Match</p>
        </div>
      </div>

      {/* Tags Section - Now will naturally wrap */}
      <div className="flex flex-wrap -mt-5 gap-1 sm:gap-2">
        {/* <span className="px-[4.5px] py-[3px] sm:px-2 sm:py-1 rounded-[75px] sm:rounded-full bg-[#6DE5E5] text-[7.5px] sm:text-sm">
          16 applicants
        </span> */}
        <span className="px-[4.5px] py-[3px] sm:px-2 sm:py-1 rounded-[75px] sm:rounded-full bg-[#6DE5E5] text-[7.5px] sm:text-sm">
          {timeAgo}
        </span>
		{isEarlyApplicant && (
			 <span className="px-[4.5px] py-[3px] sm:px-2 sm:py-1 rounded-[75px] sm:rounded-full bg-[#6DE5E5] text-[7.5px] sm:text-sm">
			 Be an early applicant
		   </span>
		)}
      </div>

      {/* Footer Section */}
      <div className="mt-2 sm:mt-6 flex items-center justify-between w-full gap-1 sm:gap-4 flex-wrap sm:flex-nowrap">
        {/* Footer Info */}
        <div className="flex gap-1 sm:gap-6 items-center">
          <div className="flex items-center gap-1 text-[#313131]">
            <MapPin className="w-[8px] h-[8px] sm:w-4 sm:h-4" />
            <span className="text-[8px] font-semibold sm:text-sm capitalize">{location}</span>
          </div>
          <div className="flex items-center gap-1 text-[#313131]">
            <Clock className="w-[8px] h-[8px] sm:w-4 sm:h-4" />
            <span className="text-[8px] font-semibold sm:text-sm capitalize ">{employmentType}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-3 sm:mt-2 flex items-center justify-end gap-2 sm:gap-4">
        <button 
          onClick={() => setShowModal(true)}
          className="px-3 py-1 sm:px-6 sm:py-2 border border-[#0D0D0D] rounded-[4px] sm:rounded-lg text-[10px] sm:text-base font-bold"
        >
          Refer A Friend
        </button>
        <button className="px-3 py-1 sm:px-6 border border-[#4B7EFF] sm:py-2 bg-[#4B7EFF] text-white rounded-[4px] sm:rounded-lg text-[10px] sm:text-base font-bold">
          View Details
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <CustomModal
          type="share"
          title="Share Job with a Friend"
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        >
          <form className="space-y-4">
            <div>
              <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">
                Phone Number:
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input_primary text-semibold text-gray-500"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">
                Email:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input_primary text-semibold text-gray-500"
                placeholder="Enter email"
                required
              />
            </div>
          </form>
        </CustomModal>
      )}
    </div>
  );
};

export default JobCard;