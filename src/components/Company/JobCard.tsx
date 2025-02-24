import { useMemo, useState } from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import CustomModal from '@Components/Modals/FormModal';

const JobCard = ({ job }: any) => {
  const { 
    companyLogo, 
    title, 
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

  const timeAgo = useMemo(() => {
    const now = new Date();
    const posted = new Date(createdAt);
    const diff = Math.floor((now.getTime() - posted.getTime()) / 1000 / 60);
    return `${diff} mins ago`;
  }, [createdAt]);

  return (
    <div className="relative w-full bg-white rounded-[15px] sm:rounded-[20px] border-[0.8px] sm:border border-black/5 shadow-[0px_3px_12px_rgba(0,0,0,0.05)] sm:shadow-[0px_4px_16px_rgba(0,0,0,0.05)] p-4 sm:p-6">
      <div className="flex">
        {/* Company Logo */}
        <div className="relative">
          <img 
            src={companyLogo} 
            alt={title} 
            className="w-[60px] h-[60px] sm:w-20 sm:h-20 rounded-[6.75px] sm:rounded-[9px] object-cover"
          />
        </div>

        {/* Main Content */}
        <div className="ml-[35px] sm:ml-11 flex-1">
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-2xl text-left font-semibold text-[#0D0D0D]">{title}</h2>
            <p className="text-[9px] sm:text-sm text-left text-[#313131]">{department}</p>
            
            {/* Rating */}
            {/* <div className="flex items-center gap-1">
              <div className="flex">
                {[1,2,3,4,5].map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-[9.8px] h-[9px] sm:w-3 sm:h-3 text-yellow-400 -ml-[0.7px] sm:-ml-[1px] first:ml-0" 
                    fill="currentColor" 
                  />
                ))}
              </div>
              <span className="text-[6px] sm:text-xs text-[#9B9B9B] ml-1">23 reviews</span>
            </div> */}

            {/* Salary */}
            <div className="flex items-center gap-1 text-[#0D0D0D] text-[9px] sm:text-base">
              <span>₹</span>
              <span>{salary}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mt-5 sm:mt-6 flex gap-2">
        <span className="px-[4.5px] py-[3px] sm:px-[4px] sm:py-1 rounded-[75px] sm:rounded-full bg-[#6DE5E5] text-[7.5px] sm:text-xs">
          16 applicants
        </span>
        <span className="px-[4.5px] py-[3px] sm:px-[4px] sm:py-[6px] rounded-[75px] sm:rounded-full bg-[#6DE5E5] text-[7.5px] sm:text-xs">
          {timeAgo}
        </span>
        <span className="px-[4.5px] py-[3px] sm:px-[4px] sm:py-1 rounded-[75px] sm:rounded-full bg-[#6DE5E5] text-[7.5px] sm:text-xs">
          Be an early applicant
        </span>
      </div>

      {/* Footer Section */}
<div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
  {/* Footer Info */}
  <div className="flex gap-6 sm:gap-8">
    <div className="flex items-center gap-1 text-[#313131]">
      <MapPin className="w-[11.3px] h-[11.3px] sm:w-4 sm:h-4" />
      <span className="text-[9px] sm:text-sm">{location}</span>
    </div>
    <div className="flex items-center gap-1 text-[#313131]">
      <Clock className="w-[12px] h-[12px] sm:w-4 sm:h-4" />
      <span className="text-[9px] sm:text-sm">{employmentType}</span>
    </div>
  </div>

  {/* Buttons */}
  <div className="flex items-center gap-3 sm:gap-4">
    <button 
      onClick={() => setShowModal(true)}
      className="px-[22.5px] py-[5.5px] sm:px-8 sm:py-2 border-[0.8px] sm:border border-[#0D0D0D] rounded-[6px] sm:rounded-lg text-[11.16px] sm:text-sm font-bold"
    >
      Refer A Friend
    </button>
    <button className="px-[22.5px] py-[5.5px] sm:px-8 sm:py-2 bg-[#4B7EFF] text-white rounded-[6px] sm:rounded-lg text-[12px] sm:text-base font-bold">
      View Details
    </button>
  </div>
</div>


      {/* Match Score - Hidden on mobile */}
      <div className="sm:block absolute right-[10px] top-8 w-[122px] h-[100px] rounded-lg bg-gradient-to-b from-[#316BFF] via-[#57E1E1] to-[#316BFF] overflow-hidden text-white p-4">
        <p className="text-sm font-bold">Strong Match</p>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-3 border-[#6DE5E5] bg-[#367BFB] flex items-center justify-center">
              <span className="font-bold">{matchPercentage}%</span>
            </div>
          </div>
        </div>
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