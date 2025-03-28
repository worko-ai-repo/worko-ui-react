import { useState } from 'react';
import Reveal from '@Views/intersection-observer/IntersectionObs';

interface TestimonialItem {
	icon: string;
	student_name: string;
	student_comp: string;
	content: string;
}

interface TestimonialGroup {
	id: number | string;
	items: TestimonialItem[];
}

interface TestimonialsProps {
	heading?: string;
	title: string;
	titleImage?: string;
	testimonials: TestimonialGroup[];
	badgeIcon?: string;
	className?: string;
}

const Testimonials: React.FC<TestimonialsProps> = ({ heading, title, titleImage, testimonials, badgeIcon, className = '' }) => {
	const [currentIndex, setCurrentIndex] = useState<number>(0);

	const handlePrev = (): void => {
		setCurrentIndex(prevIndex => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
	};

	const handleNext = (): void => {
		setCurrentIndex(prevIndex => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
	};

	const renderContent = () => {
		const words = title.split(' ');

		return (
			<span className="flex items-center justify-center w-full flex-wrap gap-2">
				{words.map((word, index) => {
					if (word.toLowerCase().includes('.webp')) {
						return <img key={index} src={titleImage} alt="content" className="inline-block h-12 object-contain my-auto" />;
					}

					return (
						<span key={index} className="inline-block">
							{word}
						</span>
					);
				})}
			</span>
		);
	};

	return (
		<div className={`bg-transparent p-1 md:p-5 ${className}`}>
			<div className="relative section-wrapper max-sm:!pt-8 min-h-96 !p-1 md:p-5 mx-auto font-bold text-[10px]">
				{/* Header Badge */}
				{heading && (
					<h2 className="flex gap-2 mb-5 w-fit mx-auto justify-between items-center border-[0.8px] border-blue-600 shadow-sm shadow-blue-500 rounded-full text-blue-600 bg-white px-2 py-1">
						<i className={`text-blue-500 rounded-[50%] bg-blue-900 p-1.5 ${badgeIcon}`}></i>
						{heading}
					</h2>
				)}

				{/* Carousel */}
				<div className="relative mt-6 flex flex-col items-center text-center">
					{/* Heading */}
					<Reveal CName="scale_up" threshold={0.5}>
						<p className="text-2xl sm:w-[60%] mx-auto p-5 sm:text-3xl md:text-5xl relative text-wrap font-bold text-white" style={{ lineHeight: '1.2' }}>
							{renderContent()}
						</p>
					</Reveal>

					{/* Main Card Carousel */}
					<div className="flex mt-8 justify-center items-center w-full">
						<button onClick={handlePrev} className="absolute top-[50%] md:text-[64px] left-0 p-2 text-4xl text-white rounded-full z-10" type="button" aria-label="Previous testimonial">
							<i className="fa-solid fa-chevron-left"></i>
						</button>

						<div className="overflow-hidden w-full">
							<div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
								{testimonials.map(testimonial => (
									<div key={testimonial.id} className="flex-shrink-0 w-full">
										{/* Sub-Cards_main */}
										<div className="flex mx-auto justify-center md:w-[80%] gap-4 flex-wrap">
											{testimonial.items.map((item, index) => (
												<div key={`${testimonial.id}-${index}`} className="px-4 py-8 bg-white text-black rounded-3xl shadow-md w-[250px] flex flex-col items-center">
													{/* Card Header */}
													<div className="flex items-center justify-start w-full gap-2 mb-2">
														<img src={item.icon} alt={`${item.student_name}'s avatar`} className="w-6 h-6 rounded-full" />
														<div className="flex flex-col justify-start items-start">
															<p className="text-sm font-bold">{item.student_name}</p>
															<small className="text-gray-500">{item.student_comp}</small>
														</div>
													</div>

													{/* Card Content */}
													<div className="text-[8] font-normal w-full text-justify">{item.content}</div>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>

						<button onClick={handleNext} className="absolute top-[50%] md:text-[64px] right-0 p-2 text-4xl text-white rounded-full z-10" type="button" aria-label="Next testimonial">
							<i className="fa-solid fa-chevron-right"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Testimonials;
