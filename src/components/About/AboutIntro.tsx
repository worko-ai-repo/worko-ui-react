import React from 'react'

const AboutIntro = () => {
  return (
    <section className="section-wrapper !pt-5  rounded-b-[2.5rem] pb-52 bg-white ">
			<div className=" pb-10 font-bold ">
                <h1 className='mb-10 '>About Us</h1>

                <p className='text-sky-500 font-semibold text-3xl mb-6 '> Welcome to Worko.ai</p>
            
                <p  className="tracking-wider leading-[1.5] text-md font-medium text-[#0D0D0D] max-w-[90vw] md:max-w-[780px] mx-auto text-center "  >
                Worko.ai was started with a bold vision: to change the way recruitment works by putting job seekers at the heart of the hiring process. We’ve created a platform where individuals feel valued, empowered, and supported at every step of their journey.
                 <br /><br />
                By combining transparency, feedback, and cutting-edge technology, Worko ensures equal opportunities for all, making recruitment faster, more efficient, and cost-effective for everyone involved.

                </p>
            </div>
    </section>
  )
}

export default AboutIntro