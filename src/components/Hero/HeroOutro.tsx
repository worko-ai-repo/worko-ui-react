import { useNavigate } from 'react-router-dom';
import WorkoFrame from './WorkoFrame';
import styles from './hero_component.module.scss';
const HeroOutro = () => {
	const navTo = useNavigate();
	return (
		<section className="bg-transparent p-1 md:p-5 md:pb-10 h-fit">
			<div className=" relative  section-wrapper min-h-44 sm:min-h-64 !p-1 md:p-5 md:pb-0  md mx-auto font-bold text-[10px]">
				{/* Carousel */}
				<div className="relative flex flex-col items-center text-center sm:mb-10 ">
					{/* Heading */}
					<p className="text-2xl sm:w-[60%] mx-auto p-5 sm:text-3xl md:text-5xl relative text-wrap font-extrabold text-white" style={{ lineHeight: '1.2' }}>
					Start your journey of smarter applications and faster hiring today.
					</p>
					<div className="Outro_ref_buttons flex relative top-4 justify-center items-center md:text-lg  font-semibold  gap-2 sm:gap-4 mx-auto">
						<button className="bg-white border-[1px] border-gray-700  text-gray-600 p-2 text-[12px] md:px-5 rounded-xl mx-2" onClick={()=>navTo('/referrals')}>Find Job Referral</button>
						<button className="bg-transparent border-[1px] border-white text-white p-2 text-[12px] md:px-5 rounded-xl mx-2" onClick={()=>navTo('/auth/signup', {state:{activeFrame:'EMP'}})}>Find Candidate</button>
					</div>
				</div>
			</div>
			<div className={' lg:max-w-[1120px]  mx-auto sm:max-w-[90%] relative bg-gradient-to-b from-[#57E1E1] to-[#86BDF8] rounded-[34px]  w-full min-w-[300px] p-4 sm:p-10 ' + styles.frame_outer_container}>
				<WorkoFrame  frameId="outro" />
			</div>
		</section>
	);
};

export default HeroOutro;
