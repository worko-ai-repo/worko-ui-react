import React from 'react';
import { useNavigate } from "react-router-dom";
import { corporatehero } from '@Assets';

const CorporateHero = () => {
  const navTo = useNavigate();
  
  return (
    <div className="w-full bg-white font-poppins">
      <div className="relative h-[729px] w-full bg-[#4B7EFF] text-white flex flex-col items-center px-6 md:px-0 text-center">
        <div className="z-10 flex flex-col items-center py-16 md:py-18">
          <h1 className="max-w-4xl text-3xl md:text-5xl font-semibold leading-tight">
            Stop spending time filtering your needle from a haystack!
          </h1>
          
          {/* Mobile layout (default) that switches to desktop at md breakpoint */}
          <div className="flex flex-col items-center md:flex-col-reverse">
            {/* Buttons - on top for mobile, below text for desktop */}
            <div className='flex mt-8 md:mt-8 mx-auto flex-wrap gap-2 items-center justify-center'>
              <button 
                onClick={() => {navTo('/auth/signup', {state:{activeFrame:'EMP'}});}} 
                className="bg-white text-black rounded-lg px-8 py-2 text-lg font-semibold shadow-md transition duration-200"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => {navTo('/auth/signup', {state:{activeFrame:'EMP'}});}} 
                className="text-white rounded-lg px-8 py-2 text-lg font-semibold border border-white transition duration-200"
              >
                Book a Demo
              </button>
            </div>
            
            {/* Text - below buttons for mobile, above for desktop */}
            <p className="mt-6 md:mt-6 max-w-2xl text-md md:text-xl font-medium leading-relaxed px-4">
              Worko AI's algorithm filters out almost all junk applications, saving you 80% of your hiring time
            </p>
          </div>
        </div>
        
        <div className="w-full flex justify-center">
          <img 
            className="absolute max-w-lg bottom-0 w-full object-cover"
            src={corporatehero}
            alt="3D characters collaborating at a desk with laptop" 
          />
        </div>
      </div>
    </div>
  );
};

export default CorporateHero;