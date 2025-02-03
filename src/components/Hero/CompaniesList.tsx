import { logo_text } from '@Assets';
import React from 'react';

const CompaniesList = () => {
	const companies = [{ logo: logo_text }, { logo: logo_text }, { logo: logo_text }, { logo: logo_text }, { logo: logo_text }, { logo: logo_text }];

	const CompanyCard = ({ company }: { company: (typeof companies)[0] }) => (
		<div className="w-[250px] mx-4 relative group h-full border-1 border-white cursor-pointer">
			<div className="w-[200px] h-[100px] shadow-md">
				<img src={company.logo} alt="Company logo" className="relative w-fit h-fit object-cover" />
				<div className="absolute opacity-0 inset-0 gap-2 flex flex-col items-center justify-center bg-black/75 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out">
					<button className=" btn_primary">Get Referral</button>
					<button className="btn_primary hover:bg-green-700 transition-colors">Apply Job</button>
				</div>
			</div>
		</div>
	);

	return (
		<div className="lg:max-w-[1120px] mx-auto w-full overflow-hidden py-8 bg-transparent flex items-center my-5">
			<div className="marquee-container w-full flex flex-col gap-4">
				<div className="flex  marquee-content ">
					{/* First set of companies */}
					{companies.map((company, index) => (
						<CompanyCard key={`first-${index}`} company={company} />
					))}

					{/* Duplicate set for seamless scrolling */}
					{companies.map((company, index) => (
						<CompanyCard key={`second-${index}`} company={company} />
					))}
				</div>
				<div className="h-0  marquee-content sm:flex sm:h-auto ">
					{/* First set of companies */}
					{companies.map((company, index) => (
						<CompanyCard key={`first-${index}`} company={company} />
					))}

					{/* Duplicate set for seamless scrolling */}
					{companies.map((company, index) => (
						<CompanyCard key={`second-${index}`} company={company} />
					))}
				</div>
			</div>
		</div>
	);
};

export default CompaniesList;
