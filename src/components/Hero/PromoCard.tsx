import { check, mag_glass, student, student_male, vector_1 } from '@Assets';
import styles from './hero_component.module.scss';
import { useState } from 'react';
const PromoCard = () => {
	const [sadView, setSadView] = useState(true);

	const toggleView = () => {
		setSadView(!sadView);
	};

/* 	setInterval(() => {
		setSadView(!sadView);
	}, 5000);
 */
	return (
		<div className="rounded-[2.5rem] bg-white w-full">
			<div className={'section-wrapper text-sm flex flex-col gap-4 justify-center items-center font-bold min-h-[100px] '}>

            {sadView ?
                 <>
                 <div className="flex gap-2 justify-between items-center border-2 border-red-600 shadow-md shadow-red-500 rounded-full text-red-600 bg-black px-3 py-2">
                    <i className="text-red fa-md fa-solid fa-circle-xmark"></i>
                    THE PROBLEM
                 </div>
                </> : <>
                 <div className="flex gap-2 justify-between items-center border-2 border-green-600 shadow-md shadow-green-500 rounded-full text-green-600 bg-black px-3 py-2">
                    <i className="text-green fa-md fa-solid fa-circle-check"></i>
                    THE SOLUTION
                 </div>
                </>}


				<div className={`content_changer border-[2px] border-${sadView ? 'red' : 'green'}-600 shadow-md shadow-${sadView ? 'red' : 'green'}-600 rounded-full`}>
					<input className="checkbox hidden  " type="checkbox" id="toggle" onClick={toggleView} />
					<label htmlFor="toggle" className="cursor-pointer">
						<div id="container" className="m-auto rounded-full h-8 w-16 bg-black flex items-center p-1">
							<div id="light" className="rounded-full h-6 w-6 bg-red-500 transition-all"></div>
						</div>
					</label>
				</div>
                


				{sadView ? <h1 className="text-4xl max-w-[600px] tracking-wide font-bold text-red-600 ">Applying endlessly without a single interview call</h1> : <h1 className="text-4xl max-w-[600px] tracking-wide font-bold text-green-600 "> Referral Increase your chance by 10X</h1>}

				<div className={`min-w-[300px] min-h-[100%] w-[350px] sm:w-[500px] md:w-[800px] rounded-[2rem] border-2 md:my-10 border-sky-600 bg-gradient-to-bl from-[#CEFFFF] to-[#4B7EFF]  ` + styles.base_card}>
					<div className={'h-auto max-h-[500px] md:h-[300px] md:mx-10 md:rounded-[4rem] border-8 border-sky-200 scale-105 rounded-md  md:scale-y-125  bg-gradient-to-bl from-[#316BFF] to-[#1D4099] to-100% flex justify-around items-center gap-4 relative p-[10px] ' + styles.base_card_content}>
						{sadView ? (
                            <>
                            <img src={student_male} alt="student_male" className="absolute bottom-0 object-cover w-[25%] " />
						{/*card telling the no of people joined us */}
						<div className={'w-[40%] h-[100%] md:h-[70%] md:w-[25%] md:px-2 bg-white rounded-md flex flex-col justify-between items-center text-xs p-2 ' + styles.landing_card}>

							<div className="flex-1 flex-col md:text-left w-auto shadow-md ">
								<i className="fa-regular fa-bookmark bg-black text-white p-2 rounded-full hidden md:inline-block "></i>
								<h1 className="text-base font-bold tracking-wide  text-blue-500">1000 + Applied</h1>
								<small className="text-gray-600 tracking-wide ">Job vacancy - 40</small>
								<p className="bg-transparent border-[1px] border-gray-400 rounded-full w-fit  text-gray-500 font-medium text-xs my-1 px-1 mx-auto md:mx-0">Full Time</p>
								<p className="bg-transparent border-[1px] border-gray-400 rounded-full w-fit  text-gray-500 font-medium text-xs px-1 mx-auto md:mx-0 ">Senior Level</p>
							</div>
							<div className="flex justify-center items-center text-xs line-clamp-0 flex-wrap md:flex-nowrap border-t-[1px] border-gray-200 w-[100%] md:py-1 md:gap-2 md:px-2">
								<small className=" flex-none ">
									<b>$4.0k</b>/ <small>Monthly</small>
								</small>
								<button className="bg-blue-700 rounded-3xl w-[80%] text-[8px] h-min p-1 text-white md:flex-1 md:text-[9px] ">See Details</button>
							</div>
						</div>

						<div className={'w-[40%] h-full max-h-[100%] md:h-[70%] md:w-[25%] md:px-2 bg-white rounded-md flex flex-col justify-between items-center text-xs p-2 ' + styles.landing_card}>
							<div className="flex-1 flex-col md:text-left w-full shadow-md ">
								<div className="flex justify-between items-center ">
									<img src={student} alt="student" className="w-[24px] h-[24px] rounded-full" />
									<small className="text-gray-400 underline "> Student Profile </small>
								</div>
								<p className="text-blue-500 mt-2 tracking-wide text-[10px]">Job Applied</p>
								<h1 className="text-lg font-bold mt-0 tracking-wide text-blue-500">500</h1>

								<p className="bg-transparent border-[1px] border-gray-400 rounded-full w-fit  text-gray-500 font-medium text-xs my-1 px-1 mx-auto md:mx-0">Responses</p>
								<h1 className="pt-2 text-[25px] font-bold mt-0 tracking-wide text-red-500">0</h1>
							</div>
						</div>
                        </>)
                        :
                        
                        (<div className='flex flex-col h-full justify-center items-center '>
                            <h1 className='text-[110%] md:text-2xl max-w-[80%] tracking-wider text-white font-extrabold'>
                                Boost You Job Success Rate By
                            </h1>
                            <h1 className='text-green-600 tracking-wider font-extrabold sm:my-2'>
                                10x
                            </h1>

                            <div className="flex gap-1  sm:gap-4 relative ">
                                <div className={"p-3 rounded-3xl h-min relative top-[20px] "+styles.frame_inner_container}>
                                    <div className="px-2 py-1 w-[80px] sm:w-[100px] h-[100px] sm:h-[120px] rounded-md bg-white bg-gradient-to-l from-[#CEFFFF] to-[#20ff27]  ">
                                        <p className='text-xs text-blue-600 text-bold '>
                                            Referral that get You Noticed
                                        </p>
                                        <img src={check} className='w-[24px] sm:w-[50px] mx-auto mb-2 ' alt="check" />
                                    </div>
                                </div>

                                <div className={"p-3 rounded-3xl h-min "+styles.frame_inner_container}>
                                    <div className="px-2 py-1 w-[80px] sm:w-[100px] h-[100px] sm:h-[120px] rounded-md bg-white bg-gradient-to-l from-[#CEFFFF] to-[#20ff27]  ">
                                        <p className='text-xs text-blue-600 text-bold '>
                                            Referral that get You Noticed
                                        </p>
                                        <img src={vector_1} className='w-[24px] sm:w-[50px] mx-auto mb-2 ' alt="vector_1" />
                                    </div>
                                </div>
                                <div className={"p-3 rounded-3xl h-min relative top-[20px] "+styles.frame_inner_container}>
                                    <div className="px-2 py-1 w-[80px] sm:w-[100px] h-[100px] sm:h-[120px] rounded-md bg-white bg-gradient-to-l from-[#CEFFFF] to-[#20ff27]  ">
                                        <p className='text-xs text-blue-600 text-bold '>
                                            Referral that get You Noticed
                                        </p>
                                        <img src={mag_glass} className='w-[24px] sm:w-[50px] mx-auto mb-2 ' alt="mag_glass" />
                                    </div>
                                </div>
                                
                            </div>
                        </div>)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PromoCard;
