import { student, worko_new } from '@Assets';
import { useState } from 'react';
import { testimonials } from './data';
import Reveal from '../../layouts/IntersectionObs';

const Testimonials = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const handlePrev = () => {
		setCurrentIndex(prevIndex => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
	};

	const handleNext = () => {
		setCurrentIndex(prevIndex => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
	};

	return (
		<div className="bg-transparent p-1 md:p-5 ">
			<div className=" relative  section-wrapper min-h-96 !p-1 md:p-5 mx-auto font-bold text-[10px]">
				{/* Header */}
				<div className="flex gap-2 mb-5 w-fit mx-auto justify-between items-center border-[0.8px] border-blue-600 shadow-sm shadow-blue-500 rounded-full text-blue-600 bg-white px-2 py-1">
					<i className="text-blue-500 rounded-[50%] bg-blue-900 p-1.5 fa-md fa-solid fa-box-open"></i>
					TESTIMONIALS
				</div>

				{/* Carousel */}
				<div className="relative flex flex-col items-center text-center">
					{/* Heading */}
					<Reveal CName="Dual-Animate" IsDual={false}>
						<p className="text-2xl sm:w-[60%] mx-auto p-5 sm:text-3xl md:text-5xl relative text-wrap font-extrabold text-white" style={{ lineHeight: '1.2' }}>
							See how people found jobs with <img src={worko_new} alt="worko_new" className="inline" />
						</p>
					</Reveal>
					{/* Main Card Carousel */}
					<div className="flex justify-center items-center  w-full">
						<button onClick={handlePrev} className="absolute top-[40%] md:text-[64px] left-0 p-2 text-4xl text-white rounded-full z-10">
							<i className="fa-solid fa-chevron-left"></i>
						</button>

						<div className="overflow-hidden w-full">
							<div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
								{testimonials.map(testimonial => (
									<div key={testimonial.id} className="flex-shrink-0 w-full ">
										{/* Sub-Cards_main */}
										<div className="flex mx-auto justify-center md:w-[80%] gap-4 flex-wrap ">
											{testimonial.items.map((item, index) => (
												<div key={index} className=" px-4 py-8 bg-white text-black rounded-3xl shadow-md w-[250px] flex flex-col items-center">
													{/* Header */}
													<div className="flex items-center justify-start w-full  gap-2 mb-2">
														<img src={item.icon} alt="Student Icon" className="w-6 h-6 rounded-full" />
														<div className="flex flex-col justify-start items-start">
															<p className="text-sm font-bold">{item.student_name}</p>
															<small className="text-gray-500">{item.student_comp}</small>
														</div>
													</div>

													{/* Content */}
													<div className=" text-[8] font-normal w-full  text-justify  ">{item.content}</div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>

						<button onClick={handleNext} className="absolute top-[40%] md:text-[64px] right-0 p-2 text-4xl text-white rounded-full z-10">
							<i className="fa-solid fa-chevron-right"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Testimonials;
