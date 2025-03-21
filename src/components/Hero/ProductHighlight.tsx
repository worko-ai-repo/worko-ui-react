import { mini_frame1, mini_frame2 } from '@Assets';
import React, { useState } from 'react';
import { dorpDown } from './data';

const ProductHighlight = () => {
	const [openDropdown, setOpenDropdown] = useState<{ one: number | null; two: number | null }>({
		one: null,
		two: null,
	});

	const toggleDropdown = (group: 'one' | 'two', index: number) => {
		setOpenDropdown(prev => ({
			...prev,
			[group]: prev[group] === index ? null : index, // Toggle between open and closed
		}));
	};

	return (
		<section className="bg-white pt-0">
			<div className="section-wrapper min-h-96 !pb-32 mx-auto font-bold text-[10px]">
				{/* Header */}
				<div className="flex gap-2 mb-5 w-fit mx-auto justify-between items-center border-[0.8px] border-blue-600 shadow-sm shadow-blue-500 rounded-full text-blue-600 bg-transparent px-2 py-1">
					<i className="text-blue-500 rounded-[50%] bg-blue-900 p-1.5 fa-md fa-solid fa-box-open"></i>
					PRODUCT HIGHLIGHT
				</div>

				{/* Dropdown Container 1 */}
				<div className="max-w-[300px] mb-5 sm:max-w-[90%] mx-auto">
					<h2 className="text-lg sm:text-xl mb-3 md:text-4xl mt-10">
						For <b className="text-white px-2 py-1 tracking-wide bg-blue-500 font-semibold rounded-md">Candidate</b>
					</h2>
					<div className="gap-0 sm:gap-10 mt-10 flex w-full items-center justify-center">
						<div className="dropdown_and_frame flex flex-col gap-3 relative">
							{dorpDown.one.map((item, index) => (
								<div key={index} className="relative cursor-pointer rounded-md bg-[#CFEFFF]">
									{/* Dropdown item */}
									<div className="w-[290px] sm:w-[250px] md:w-[350px] px-3 py-2 text-black  flex justify-between items-center" onClick={() => toggleDropdown('one', index)}>
										<div className="flex items-center gap-2">
											<img src={item.image} alt={`icon-${index}`} className="w-[24px] h-full object-cover rounded-md" />
											<h3 className={`${openDropdown.one === index ? 'text-blue-700' : 'text-gray-700'} text-sm  text-left`}>{item.title}</h3>
										</div>
										<i className={`fa-solid fa-caret-down transition-transform ${openDropdown.one === index ? 'rotate-180' : ''}`} />
									</div>
									{/* Clicked content (description) */}
									<div className={`max-h-0 ${openDropdown.one === index ? 'max-h-40 p-2 px-4' : 'px-4'} transition-max-height duration-500 ease-in-out overflow-hidden top-full left-0 w-[290px] sm:w-[250px] md:w-[350px] text-wrap shadow-lg z-10`}>
										<p className="text-xs font-medium text-left overflow-hidden">{item.description}</p>
									</div>
								</div>
							))}
						</div>

						<div className="w-[0px] product_highlight_img sm:w-[400px] h-full">
							<img
								src={dorpDown.one[openDropdown.one ?? 0]?.bigimg} // Default to index 0
								alt="mini_frame1"
								className="invisible sm:visible rounded-lg rotate-[-5deg]"
							/>
						</div>
					</div>
				</div>

				{/* Dropdown Container 2 */}
				<div className="max-w-[300px] sm:max-w-[90%] mx-auto">
					<h2 className="text-lg sm:text-xl mb-3 md:text-4xl mt-10">
						For <b className="text-white px-2 py-1 tracking-wide bg-blue-500 font-semibold rounded-md">Employees</b>
					</h2>
					<div className="gap-0 sm:gap-10 mt-10 flex w-full items-center justify-center">
						<div className="w-[0px] product_highlight_img sm:w-[400px] h-full">
							<img
								src={dorpDown.two[openDropdown.two ?? 0]?.bigimg} // Default to index 0
								alt="mini_frame1"
								className="invisible sm:visible rounded-lg rotate-[5deg]"
							/>
						</div>

						<div className="dropdown_and_frame flex flex-col gap-3 relative">
							{dorpDown.two.map((item, index) => (
								<div key={index} className="relative cursor-pointer rounded-md bg-[#CFEFFF]">
									{/* Dropdown item */}
									<div className="w-[290px] sm:w-[250px] md:w-[350px] px-3 py-2 text-black flex justify-between items-center" onClick={() => toggleDropdown('two', index)}>
										<div className="flex items-center gap-2">
											<img src={item.image} alt={`icon-${index}`} className="w-[24px] h-full object-cover rounded-md" />
											<h3 className={`${openDropdown.two === index ? 'text-blue-700' : 'text-gray-700'} text-sm text-left`}>{item.title}</h3>
										</div>
										<i className={`fa-solid fa-caret-down transition-transform ${openDropdown.two === index ? 'rotate-180' : ''}`} />
									</div>
									{/* Clicked content (description) */}
									<div className={`max-h-0 ${openDropdown.two === index ? 'max-h-40 p-2 px-4' : 'px-4'} transition-max-height duration-500 ease-in-out overflow-hidden top-full left-0 w-[290px] sm:w-[250px] md:w-[350px] text-wrap shadow-lg z-10`}>
										<p className="text-xs font-medium text-left overflow-hidden">{item.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ProductHighlight;
