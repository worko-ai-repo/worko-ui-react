import { document, lightening, shield, time } from '@Assets';
import React from 'react';

const CorporateCardsSection = () => {
	const features = [
		{
			title: 'Get verified results ',
			description: 'With 98% accuracy, every match you get will be backed by hard data.',
			svg: <img src={shield} />,
		},
		{
			title: 'Refine your matches',
			description: 'Worko learns from your feedback and gets smarter with every hire.',
			svg: <img src={document} />,
		},
		{
			title: 'Hire through referrals',
			description: 'Tap into your employees’ referrals to find culturally-fit people.',
			svg: <img src={lightening} />,
		},
		{
			title: 'Save time and effort',
			description: 'Cut hiring time from 23 hours to just 6 hours without affecting quality.',
			svg: <img src={time} />,
		},
	];

	return (
		<section className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
			<div className="flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-10 md:mb-16">
				<h2 className="text-center text-[#316BFF] text-3xl sm:text-4xl md:text-5xl max-w-4xl font-bold leading-tight tracking-wide">Tired of sifting through endless applications? </h2>
				<p className="w-full max-w-3xl px-4 text-center text-[#0D0D0D] text-base sm:text-lg md:text-xl font-medium leading-snug">Worko uses advanced-level matching algorithms to instantly shortlist pre-qualified, perfect-fit candidates from thousands of applications. 				</p>
			</div>

			<div className="w-full flex justify-center items-center">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3 md:gap-4 lg:gap-6 justify-items-center">
					{features.map((feature, index) => (
						<div key={index} className="w-full max-w-[235px] h-full py-8 px-4 relative bg-white shadow-lg rounded-[16px] overflow-hidden border border-[#57E1E166] flex flex-col items-center justify-center">
							<div className="mb-6">{feature.svg}</div>
							<h3 className="text-center text-[#316BFF] text-lg font-bold leading-tight mb-2">{feature.title}</h3>
							<p className="text-center text-[#0D0D0D] text-sm md:text-base font-medium leading-snug max-w-[90%]">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default CorporateCardsSection;
