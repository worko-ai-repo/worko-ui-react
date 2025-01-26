import styles from '@Pages/hero/hero.module.scss';
import WorkoFrame from './WorkoFrame';
import Reveal from '../../Layout/IntersectionObs';
const HeroIntro = () => {
	const items = ['REQUEST REFERRALS', 'APPLY JOBS', 'GET GUIDANCE & INTERVIEW HANDHOLDING'];
	return (
		<div className="rounded-b-[2.5rem] pb-52 bg-white ">
			<div className="section-wrapper !pb-0 text-sm  font-bold ">
				<Reveal CName="Dual-Animate" IsDual={true} >
					<h1 className=" mb-7 mx-auto text-4xl lg:text-[64px] md:w-2/3 h-auto text-center leading-[1.2]">Increase your chances of getting a job by</h1>
					<p className="font-bold text-4xl md:text-6xl text-[#005EC2] px-4 py-2 tracking-wide rounded-2xl bg-[#6DE5E5] w-min mx-auto">10X</p>
					<p className="text-gray-600 mt-5">Preparing Yourself For Success In The Interview</p>
				</Reveal>

				<div className={'flex justify-center flex-wrap align-center gap-2 w-full mt-4 hover:shadow-blue-700 cursor-pointer ' + styles.hero_head_container}>
					{items.map((item, index) => (
						<div key={index} className={'w-auto flex mx-3 items-center justify-start gap-2 px-4 rounded-2xl py-1 border-[1px] border-sky-400 '}>
							<div className="check ">
								<i className="fa-solid fa-circle-check rounded-[50%] text-sky-500 "></i>
							</div>

							<p className="text-xs sm:text-sm text-sky-500  w-fit  ">{item}</p>
						</div>
					))}
				</div>
				<button className="btn_primary mt-5"> Start For Free</button>
			</div>
			<div className={' lg:max-w-[1120px] mt-10 mx-auto md:max-w-[80%] relative bg-gradient-to-b from-[#57E1E1] to-[#86BDF8] rounded-[34px] sm:h-[600px] w-full min-w-[300px] p-4 md:p-20 ' + styles.frame_outer_container}>
				<WorkoFrame />
			</div>
		</div>
	);
};

export default HeroIntro;
