import  { useState } from 'react';
import CustomButtonWithButton from '../../Shared/CustomButtonWithButton';
import SignupForm from './SignupForm';

export type SignupMode = 'EMP' | 'CAND';
const Signup = () => {
	const [activeFrame, setActiveFrame] = useState<SignupMode>('CAND');
	const options = [
		{ label: 'Candidate/Job Seeker', value: 'CAND' },
		{ label: 'Employee/Referee', value: 'EMP' },
	];

	return (
		<div className=" flex justify-center relative w-full min-h-[700px] md:min-w-[50%]  max-w-[1120px] overflow-hidden rounded-lg bg-white shadow z-20 ">
			<div className="px-4 gap-2 py-5 sm:p-6  w-full flex flex-col ">
				{/* Header and toggle button */}
				<div className=" relative header flex justify-around flex-wrap w-full  items-center ">
					<p className="font-semibold text-sm md:text-xl text-gray-500 self-center mt-2 "> Create your account as </p>
					{/* onToggleChange={setActiveFrame} activeFrame={activeFrame} */}
					<div className="w-[90vw] sm:w-fit   min-w-[50%] sm:pl-16 ">
						<CustomButtonWithButton options={options} activeFrame={activeFrame} setActiveFrame={setActiveFrame} />
					</div>
				</div>

				{/* Signup form */}
				<div className="flex  flex-1 mx-auto sm:w-[80%] ">
					<SignupForm activeFrame={activeFrame}/>
					</div>
			</div>
		</div>
	);
};

export default Signup;
