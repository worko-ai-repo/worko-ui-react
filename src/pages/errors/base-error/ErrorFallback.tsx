import { base_error_bg, logo_text } from '@Assets';
import React from 'react';

const ErrorFallback = () => {
	return (
		<div className=" flex items-center justify-center w-screen h-screen bg-white ">
            <div className="max-w-[300px] sm:max-w-[600px] text-center">
                <h1 className='text-blue-500 font-semibold animate-pulse mb-3' >Opps! Something went wrong.</h1>
                <p className='text-gray-400 '>It looks our platform is facing some issues.Try reloading the page or try after sometime</p>
            </div>
            <img src={logo_text} onClick={()=>window.location.href='/'} className='cursor-pointer w-32 absolute top-2 left-4 sm:top-5 sm:left-10 ' loading='lazy' alt="logo" />
            <img src={base_error_bg} className='fixed top-[-20px] right-[-20px] w-[200px] sm:top-0 sm:right-0 sm:w-[300px] bg-transparent ' alt="" loading="lazy" />
        </div>
	);
};

export default ErrorFallback;
