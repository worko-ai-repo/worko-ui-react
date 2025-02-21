import { useMemo, useState } from 'react';
import { Briefcase, MapPin, Watch, Zap } from 'lucide-react';

import GaugeComponent from './Gauge';
import CustomModal from '@Components/Modals/FormModal';

const JobCard = ({ job }: any) => {
	const { companyLogo, title, department, salary, location, employmentType, skills, createdAt, workMode, matchPercentage } = job;

	const isEarlyApplicant = useMemo(() => {
		const createdDate = new Date(createdAt);
		const threeDaysAgo = new Date();
		threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
		return createdDate >= threeDaysAgo;
	}, [createdAt]);

	const [showModal, setShowModal] = useState(false);
	const [formData, setFormData] = useState({ phone: "", email: "" });
  
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	  setFormData({ ...formData, [e.target.name]: e.target.value });
	};
  
	const handleSubmit = () => {
	  alert(`Job shared with: ${formData.phone}, ${formData.email}`);
	  setShowModal(false);
	};

	return (
		<div className="flex h-fit flex-col gap-4  mx-auto bg-white shadow-md rounded-2xl p-3 sm:p-3 md:p-4 w-[95%] sm:mx-5 md:max-w-[100%] mx-auto21 border-[1px] border-gray-300 ">
			{/* first col with images title and starts */}
			<div className="flex items-start justify-start gap-2 md:gap-5 ">
				{/* Left Section: Company Logo */}
				<div className="border-[1px] border-gray-400 flex items-center justify-center w-[60px] h-[60px] sm:w-[70px] sm:h-[70px]  md:min-w-[80px] md:min-h-[80px] overflow-hidden  bg-gray-100 rounded-xl shadow-2xl ">
					<img src={companyLogo} alt={title} className="w-full h-full object-contain " />
				</div>
				{/* Right Section */}
				<div className=" flex flex-col items-start justify-between w-fit max-w-[calc(100%-100px)] md:max-w-[80%] ">
					<h3 className="text-sm font-semibold capitalize mb-0 leading-6  sm:text-lg truncate max-w-full sm:max-w-[35ch] md:max-w-[100%] ">{title}</h3>
					<p className="text-gray-500 text-[10px] sm:text-xs capitalize ">{department}</p>
					<p className="text-black text-[10px] sm:text-xs font-semibold ">{` ₹ ${salary}`}</p>
				</div>
			</div>

			<div className="flex flex-col  gap-0">
				{/* Skills & Early Applicant */}
				<div className="  relative basic_details_and_score flex flex-row justify-between items-start sm:mt-6 h-min gap-1">
					<div className="  flex flex-col flex-wrap gap-2  h-min max-w-[75%]">
						<div className="skill flex gap-1 flex-wrap">
							{skills.slice(0, 4).map((skill: string, index: string) => (
								<span key={index} className="h-min bg-blue-500 shadow-md  shadow-sky-300  text-white px-3 py-1 capitalize text-[10px] sm:text-xs rounded-2xl">
									{skill}
								</span>
							))}
							{
								isEarlyApplicant && <span className="h-min flex items-center gap-1 bg-green-600 font-semibold text-white px-2 py-1 text-[10px] sm:text-xs rounded-lg">
									<Zap size={14} /> Be an early applicant
								</span>
							}
						</div>

						<div className="time_location">
							{/* Time & Location */}
							<div className="flex items-baseline  gap-2 text-gray-500 text-[10px] sm:text-xs">
								<span className="flex font-semibold gap-1 capitalize">
									<MapPin size={14} />
									<span>{location}</span>
								</span>

								<span className="flex font-semibold gap-1 capitalize">
									<Briefcase size={14} />
									<span>{employmentType}</span>
								</span>

								<span className="flex font-semibold gap-1 capitalize">
									<Watch size={14} />
									<span>{workMode}</span>
								</span>
							</div>
						</div>
					</div>

					<div className=" min-w-auto max-w-[100px] sm:absolute right-0 -top-16  gauge  rounded-lg  bg-blue-600 shadow-md shadow-sky-400 sm:min-w-[120px] h-min p-1  ">
						<GaugeComponent score={matchPercentage} />
					</div>
				</div>

				{/* Bottom Section */}
				<div className="flex justify-end  items-center mt-5 relative ">
					<div className="flex gap-2 scale-75 justify-end relative -right-7 sm:scale-90 sm:-right-5 md:scale-100 md:-right-0">
						<button className="bg-gray-200 px-4 py-2 rounded-lg text-sm border-[0.5px] border-gray-500 " onClick={() => setShowModal(true)}>Refer a Friend</button>
						<button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Apply for Job</button>
					</div>
				</div>
			</div>

			
			{showModal && (
        <CustomModal
          type="share"
          title="Share Job with a Friend"
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        >
          <form className="space-y-4 ">
            <div>
              <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Phone Number :</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input_primary text-semibold text-gray-500 "
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Email :</label>
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
