import React from 'react'

const AboutIntro = () => {
  return (
    <section className="section-wrapper !pt-5  rounded-b-[2.5rem] pb-52 bg-white ">
			<div className=" pb-10 font-bold ">
                <h1 className='mb-10 '>About Us</h1>

                <p className='text-sky-500 font-semibold text-3xl mb-6 '> Welcome to Worko.ai</p>
            
                <p  className="tracking-wider leading-[1.5] text-md font-medium text-[#0D0D0D] max-w-[90vw] md:max-w-[780px] mx-auto text-center "  >
                We created Worko when we had this bold idea: What if we turned the entire recruitment world on its head and built something that actually put you - the job seeker - in the driver's seat? Not the recruiters. Not the algorithms. You.
                 <br /><br />
                 Worko gives you clear insights, real feedback, and most importantly, worth. And while others try to cut corners, we’re actually making hiring more efficient and more human. You save time. Companies save money. Everyone wins.
                 <br /><br />
                 And we’re just getting started. 
                </p>
            </div>
    </section>
  )
}

export default AboutIntro