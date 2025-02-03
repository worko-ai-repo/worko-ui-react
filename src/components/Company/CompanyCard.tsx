import { CompanyShortDto } from "@Interfaces/JobsAndCompany.dto";
import { Users } from "lucide-react";


const CompanyCard =({ companyData }: { companyData: CompanyShortDto }) => {

	return (
		<>
			<div className="h-fit border-4 border-gray-300 bg-white shadow-[0px_0px_16px_6px_rgba(0,_0,_0,_0.1)] p-2 w-full rounded-lg ">
				{/* first col with images title and starts */}
				<div className=" flex items-start justify-start gap-2 md:gap-5 mb-2 ">
					{/* Left Section: Company Logo */}
					<div className="border-[1px] border-gray-400 flex items-center justify-center min-w-[60px] w-[60px] h-[60px] overflow-hidden  bg-gray-100 rounded-xl shadow-2xl ">
						<img src={companyData.logoUrl} alt="Logo" className="w-full h-full object-contain " />
					</div>
					{/* Right Section */}
					<div className=" flex flex-col items-start justify-between w-[70%]   ">
						<h3 className="text-sm font-semibold capitalize mb-0 leading-6  sm:text-lg truncate w-[100%] text-left  ">{companyData.name}</h3>
						<p className="text-gray-500 text-[10px] sm:text-xs capitalize truncate w-[100%] text-left ">{companyData.industry}</p>
						<p className="text-black text-[10px] sm:text-xs font-semibold "><i className=" text-gray-500 fa-solid fa-users"></i>{` ${companyData.teamSize}`}</p>
					</div>
				</div>

				{/** 2 Social pages and Referral and huidance button */}

				<div className=" flex justify-center flex-col gap-2 px-1  text-gray-700  ">
					<div className="flex justify-between gap-2">
						<div className="linkedin_ref flex  justify-start  items-end gap-2 text-gray-700  md:my-1 ">
							<i className="fa-brands fa-linkedin  "></i>
							<a href={companyData.linkedIn} target="_blank" className=" text-[12px] md:text-sm  " rel="noreferrer">
								LinkedIn
							</a>
						</div>
						<button className="scale-90 btn_secondary text-[12px] w-[150px] px-0 ">Request Referral</button>
					</div>
					<div className="flex justify-between gap-2">
						<div className="linkedin_ref flex  justify-start  items-start gap-2  md:my-1  ">
							<i className="fa-solid fa-building  "></i>
							<a href={companyData.linkedIn} target="_blank" className=" text-[12px] md:text-sm " rel="noreferrer">
								Career Page
							</a>
						</div>
						<button className="scale-90 btn_secondary text-[12px] w-[150px] px-0 ">Request Guidance</button>
						</div>
				</div>
			</div>
		</>
	);
};

export default CompanyCard;
