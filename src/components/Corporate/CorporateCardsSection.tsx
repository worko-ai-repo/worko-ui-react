import { document, lightening, shield, time } from '@Assets';
import React from 'react';

const CorporateCardsSection = () => {
	const features = [
		{
			title: 'Verified & Validated',
			description: 'Every candidate is verified and validated before reaching you',
			svg: <img src={shield} />,
		},
		{
			title: 'Refinement',
			description: 'We continuously learn from feedback to refine matches and simplify hiring.',
			svg: <img src={document} />,
		},
		{
			title: 'Boost Referral Hiring',
			description: 'Empower employees to find top talent through core skill assessments.',
			svg: <img src={lightening} />,
		},
		{
			title: 'Save time',
			description: 'Save time, streamline hiring, and achieve faster conversions with precision-matched talent',
			svg: <img src={time} />,
		},
	];

	return (
		<section className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
			<div className="flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-10 md:mb-16">
				<h2 className="text-center text-[#316BFF] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-wide">Perfect Matches, Every Time!</h2>
				<p className="w-full max-w-xl px-4 text-center text-[#0D0D0D] text-base sm:text-lg md:text-xl font-medium leading-snug">Our 5-Level AI Matching ensures you receive only the top-matched, best-fit candidates.</p>
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
