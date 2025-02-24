import { logo_text } from '@Assets';
import { CompanyShortDto } from '@Interfaces/JobsAndCompany.dto';
import { Users } from 'lucide-react';

const CompanyCard = ({ companyData }: { companyData: CompanyShortDto }) => {
	return (
		<>
			<div className="h-fit  bg-white shadow-[0px_0px_16px_6px_rgba(0,_0,_0,_0.1)] p-4 w-full rounded-2xl border">
				{/* first col with images title and starts */}
				<div className=" flex items-start justify-start gap-2 md:gap-5 mb-2 ">
					{/* Left Section: Company Logo */}
					<div className="border flex items-center justify-center min-w-[60px] w-[60px] h-[60px] overflow-hidden  bg-gray-100 rounded-xl ">
						<img src={companyData.logoUrl || logo_text} alt="Logo" className="w-full h-full object-contain " />
					</div>
					{/* Right Section */}
					<div className=" flex flex-col items-start justify-between w-[70%]   ">
						<h3 className="text-sm font-medium  mb-0 leading-6  sm:text-lg truncate w-[100%] text-left  !capitalize ">{companyData.name.charAt(0).toUpperCase() + companyData.name.slice(1).toLocaleLowerCase() }</h3>
						{/* <p className="text-gray-500 text-[10px] sm:text-xs capitalize truncate w-[100%] text-left ">{companyData.industry}</p>
						<p className="text-black text-[10px] sm:text-xs font-semibold ">
							<i className=" text-gray-500 fa-solid fa-users"></i>
							{` ${companyData.teamSize}`}
						</p> */}
					</div>
				</div>

				{/** 2 Social pages and Referral and huidance button */}

				<div className=" flex justify-center flex-col gap-1 px-1  text-gray-700  ">
					<div className="flex justify-between gap-2">
						<div className="linkedin_ref flex  justify-start  items-end gap-2 text-black  md:my-1 ">
							<i className="fa-brands fa-linkedin  "></i>
							<a href={companyData.linkedIn} target="_blank" className=" text-[12px] md:text-xs text-gray-700  " rel="noreferrer">
								LinkedIn Page
							</a>
						</div>
						<button className="scale-90 btn_secondary bg-[#4B7EFF] text-[12px] w-[150px] px-0 ">Request Referral</button>
					</div>
					<div className="flex justify-between gap-2  ">
						<div className="linkedin_ref flex  justify-start  items-start gap-2  md:my-1  relative top-2 ">
						<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24"><g fill="none" stroke="#000"strokeLinejoin="round" strokeWidth={2}><path d="M12 12h.01M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m14 7a18.15 18.15 0 0 1-20 0"></path><rect width={20} height={14} x={2} y={6} rx={2}></rect></g></svg>
							<a href={companyData.linkedIn} target="_blank" className=" text-[12px] md:text-xs " rel="noreferrer">
								Career Page
							</a>
						</div>
						<button className="scale-90 btn_secondary bg-[#4B7EFF] text-[12px] w-[150px] px-0 ">Request Guidance</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default CompanyCard;
