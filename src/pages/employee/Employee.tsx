import { employee_hero, employee_hero_mobile } from "@Assets";
import EmployeePageStepper2 from "./stepper-2";
import Testimonials from "@Components/Hero/Testimonials";
import { EmployeeTestimonials } from "@Components/Hero/data";
import { worko_new } from "@Assets";
import EmployeePageStepper1 from "./stepper-1";
import { useNavigate } from "react-router-dom";


 
const Employee = () => {
    const navTo = useNavigate();
    
    return (
        <div className="w-full bg-white font-poppins">
            {/* Hero Section */}
            <div className="relative h-[729px] w-full bg-[#4B7EFF] text-white flex flex-col items-center px-6 md:px-0 text-center">
                <div className="z-10 flex flex-col items-center text-wrap py-14 md:py-24">
                    <h1 className="max-w-4xl text-3xl md:text-5xl font-bold leading-tight">
                    Help Job Seekers, Get Rewarded, and Build a Legacy Beyond Your 9-5
                    </h1>
                    
                    <p className="mt-6 max-w-2xl text-md md:text-xl font-medium leading-relaxed px-4">
                        Worko enables you to find and refer top talent in minutes - <br/> and earn bonuses every step of the way.
                    </p>
                    
                    <button onClick={()=>{navTo('/auth/signup?mode=EMP',  {state:{activeFrame:'EMP'}});}} className="mt-8 bg-white text-black rounded-lg px-8 py-2 text-lg font-bold shadow-md hover:bg-gray-100 transition duration-200">
                        Join For Free
                    </button>
                </div>
                
                <div className="w-full flex justify-center">
                    <img 
                        className="absolute max-w-lg bottom-0 w-full sm:w-1/3 object-cover"
                        src={employee_hero}
                        alt="3D characters collaborating at a desk with laptop"
                        srcSet={`${employee_hero_mobile} 640w, ${employee_hero} 641w`}
                        sizes="(max-width: 640px) 100vw, 33vw"
                    />
                </div>
            </div>
            
            <EmployeePageStepper1 />

            {/* Secondary Section */}
            <div className="w-full flex flex-col items-center justify-center text-center text-blue-600  gap-12">
                <h2 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                    It is more than referrals and bonuses
                </h2>
                
                <p className="max-w-2xl text-md sm:text-md md:text-xl text-gray-900 leading-relaxed">
                    Your journey, struggles, and victories are unique. Why let them sit idle when you can leverage them to make an impact in others' lives?
                </p>
                
                <div className="w-full  flex justify-center">
                    <EmployeePageStepper2 />
                </div>
            </div>
            
            {/* Final Section - Reduced Height */}
            <div className="bg-[#316BFF] rounded-t-[2.5rem] text-white w-full">
                <Testimonials 
                    title={`What Employees Who Have Used ${worko_new} Are Saying`} 
                    titleImage={worko_new} 
                    testimonials={EmployeeTestimonials} 
                />
                
                {/* Call-to-action section with reduced height */}
                <div className="w-full text-white flex flex-col items-center px-6 md:px-0 text-center pb-16">
                    <div className="z-10 flex flex-col items-center py-14">
                        <h1 className="max-w-4xl text-3xl md:text-5xl font-bold text-center leading-tight">
                            Starting referring. Start building. Start earning.
                        </h1>
                        
                        <p className="mt-6 max-w-2xl text-lg text-center md:text-xl font-medium leading-relaxed px-4">
                            Candidates are tired of sending applications into the void. <br /> Companies are struggling to fill open roles.
                            <br /> Bridge this gap and get paid in doing so.
                        </p>
                        
                        <button 
                            onClick={()=>{navTo('/auth/signup?mode=EMP', {state:{activeFrame:'EMP'}});}} 
                            className="relative mt-8 pl-6 pr-6 h-[38.8px] rounded-[10.63px] bg-gradient-to-b from-[#fff] to-[#fbfbfb] shadow-md text-[14.88px] text-[#284468] font-[Poppins] font-semibold capitalize overflow-hidden mix-blend-normal leading-[21.25px]"
                        >
                            Join For Free
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Employee;