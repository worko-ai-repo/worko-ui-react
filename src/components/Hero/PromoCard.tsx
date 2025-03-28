import { check, mag_glass, student, student_male, vector_1 } from '@Assets';
import styles from './hero_component.module.scss';
import { useEffect, useState } from 'react';
import ToggleBtn from '@Components/Shared/Tooggle';
const PromoCard = () => {
	const [sadView, setSadView] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setSadView(prev => !prev);
		}, 3000);

		return () => clearInterval(interval); // Cleanup on unmount
	}, []);

	const toggleView = () => {
		setSadView(!sadView);
	};

	return (
		<section className="rounded-[2.5rem] bg-white w-full">
			<div className={'section-wrapper !py-10 text-sm flex flex-col gap-4 justify-center items-center font-bold min-h-[100px] '}>
				{!sadView ? (
					<>
						<div className="flex gap-2 justify-between items-center border-2 border-red-600 shadow-md shadow-red-500 rounded-full text-red-600 bg-black px-3 py-2">
							<i className="text-red fa-md fa-solid fa-circle-xmark"></i>
							THE PROBLEM
						</div>
					</>
				) : (
					<>
						<div className="flex gap-2 justify-between items-center border-2 border-green-600 shadow-md shadow-green-500 rounded-full text-green-600 bg-black px-3 py-2">
							<i className="text-green fa-md fa-solid fa-circle-check"></i>
							THE SOLUTION
						</div>
					</>
				)}

				<ToggleBtn isToggleEnabled={sadView} setIsToggleEnabled={setSadView} inactiveBgColor="bg-black ring-2 ring-red-500 " activeBgColor="bg-black ring-2 ring-green-500  " inactiveDialColor="bg-red-500" activeDialColor="bg-green-500" />

				{!sadView ? <h2 className="text-3xl max-w-[600px] tracking-wide font-bold text-red-600 ">Applying endlessly without a single interview call</h2> : <h2 className="text-3xl max-w-[600px] tracking-wide font-bold text-blue-500 "> Referral Increase your chance by 10X</h2>}

				<div className={`min-w-[300px]  min-h-[100%] w-[300px] sm:w-[450px] md:w-[600px] rounded-[2rem] border-2 md:my-10 border-sky-600 bg-gradient-to-bl from-[#CEFFFF] to-[#4B7EFF]  ` + styles.base_card}>
					<div className={`min-h-[220px] max-h-[500px] md:h-[250px] md:mx-10 md:rounded-[4rem] border-8 border-sky-200 scale-105 rounded-3xl  md:scale-y-125   ${sadView ? 'bg-gradient-to-bl from-[#48A0FF] to-[#48A0FF] to-100% ' : ' bg-gradient-to-bl from-[#316BFF] to-[#1D4099] to-100% '}  flex justify-around items-center gap-4 relative sm:p-[10px] ` + styles.base_card_content}>
						{!sadView ? (
							<>
								<img src={student_male} alt="student_male" className="absolute bottom-0 object-cover w-[25%] " />
								{/*card telling the no of people joined us */}
								<div className={'ml-3 w-full sm:w-[150px] h-[100%] md:h-[80%] md:px-2  bg-white rounded-md flex flex-col justify-between items-center text-xs p-2 ' + styles.landing_card}>
									<div className="flex-1 flex-col text-left w-auto  ">
										<i className="fa-regular w-4 h-4 fa-bookmark bg-black text-white flex justify-center items-center p-2 text-[0.5rem] sm:text-[0.6rem]  rounded-full "></i>
										<p className=" font-bold text-xl leading-4 my-2.5  text-blue-500">1000 + Applied</p>
										<small className="text-gray-400 font-thin  tracking-wide ">Job vacancy - 40</small>
										<p className="bg-transparent border-[1px] border-gray-400 rounded-full w-fit  text-gray-500 font-medium text-[0.5rem] sm:text-[0.6rem]  my-1 px-1  md:mx-0">Full Time</p>
										<p className="bg-transparent border-[1px] border-gray-400 rounded-full w-fit  text-gray-500 font-medium text-[0.5rem] sm:text-[0.6rem]  px-1  md:mx-0 ">Senior Level</p>
									</div>
									<hr />
									<div className=" text-[0.5rem] sm:text-[0.6rem]  flex gap-1 justify-between items-center w-full  mt-2 ">
										<small className=" flex-none ">
											<b className='text-[0.5rem] sm:text-[0.6rem]  '>$4.0k</b>/ <small className='text-gray-500 font-thin '>Monthly</small>
										</small>
										<button className="bg-blue-500 px-1 text-white text-[0.4rem] sm:text-[0.6rem]   rounded-full ">See Details</button>
									</div>
								</div>

								<div className={'mr-3 w-full h-full max-h-[100%] md:h-[80%]  sm:w-[150px] md:px-2 bg-white rounded-md flex flex-col justify-between items-center text-xs p-2 ' + styles.landing_card}>
									<div className="flex-1 flex-col md:text-left w-full  ">
										<div className="flex justify-start  gap-2 items-end  ">
											<img src={student} alt="student" className="w-4 h-4 rounded-full" />
											<small className="text-gray-400 text-[0.5rem] sm:text-[0.6rem]  underline "> Student Profile </small>
										</div>
										<p className="text-blue-500 mt-2 tracking-wide text-[10px] text-start ">Job Applied</p>
										<p className="text-lg font-bold mt-0 tracking-wide text-blue-500 text-start">500</p>

										<p className="bg-transparent border-[1px] border-gray-400 rounded-full w-fit  text-gray-500 font-medium text-[0.5rem] sm:text-[0.6rem]  my-1 px-1  md:mx-0">Responses</p>
										<p className="pt-2 text-[25px] sm:!text-[1.6rem] font-bold mt-0 tracking-wide text-red-500 text-left ">0</p>
									</div>
								</div>
							</>
						) : (
							<div className="flex flex-col h-[200px] gap-4 sm:gap-2 justify-start items-center ">
								<p className="text-[110%] max-w-[60%] md:max-w-[95%] md:text-xl tracking-wider  text-white font-extrabold">Boost You Job Success Rate By<div className='text-green-300'>10X!</div></p>
								

								<div className="flex gap-1 sm:gap-3 relative  w-full   justify-center">
									<div className={'px-2 py-2 rounded-2xl relative -top-4  ' + styles.frame_inner_container}>
										<div className="px-1.5 py-1 w-[70px] sm:w-[100px] h-[100px] sm:h-[120px] rounded-md bg-white bg-gradient-to-t from-[#ffffff] to-[#e1ffe2] to-100% ">
											<p className="text-xs text-blue-600 text-bold ">Referral that get You Noticed</p>
											<img src={check} className="w-[24px] sm:w-[50px] relative -top-1 mx-auto mb-2 " alt="check" />
										</div>
									</div>

									<div className={'px-2 py-2 rounded-2xl h-min  ' + styles.frame_inner_container}>
										<div className="px-1.5 py-1 w-[70px] sm:w-[100px] h-[100px] sm:h-[120px] rounded-md bg-white bg-gradient-to-t from-[#ffffff] to-[#e1ffe2] to-100% ">
										<p className="text-xs text-blue-600 text-bold ">Referral that get You Noticed</p>
											<img src={vector_1} className="w-[24px] sm:w-[50px] mx-auto mb-2 " alt="vector_1" />
										</div>
									</div>
									<div className={'px-2 py-2 rounded-2xl h-min relative -top-4 ' + styles.frame_inner_container}>
										<div className="px-1.5 py-1 w-[70px] sm:w-[100px] h-[100px] sm:h-[120px] rounded-md bg-white bg-gradient-to-t from-[#ffffff] to-[#e1ffe2] to-100% ">
										<p className="text-xs text-blue-600 text-bold ">Referral that get You Noticed</p>
											<img src={mag_glass} className="w-[24px] sm:w-[50px] mx-auto mb-2 " alt="mag_glass" />
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default PromoCard;
