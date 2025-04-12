import { f1, f2, f3 } from '@Assets'
import React from 'react'

const AboutTeam = () => {
  const frame = [
    {icons:f1 , ref : {l:'in/kumarjeetesh/'}},
  /*   {icons: f3 , ref : {l:'in/parth-pradhan-66007b3a/'}}, */
    {icons: f2 , ref : {l:'company/worko'}},
]; // Fix: Change object to array

  return (
    <section className="min-h-52 bg-[#4B7EFF] flex items-center justify-center">
      <div className="section-wrapper py-10 text-sm font-bold">
        <h1 className='mb-20 text-[1.5rem] sm:text-3xl md:text-4xl max-w-full  sm:max-w-[600px] leading-[1.8] text-white mx-auto'>
        The passion behind Worko
        </h1>

        <p className="tracking-wider leading-[1.5] text-md font-normal text-white max-w-[90vw] md:max-w-[680px] mx-auto text-center">
        While working in the corporate sector, our founders observed something: Traditional hiring was becoming a nightmare of endless delays and bureaucratic red tape. They had scaled their business before, and they knew there had to be a better way. That’s when Worko was born - not another hiring platform but a revolution turning the recruitment world on its head.
          <br /><br />
          We’re here to make hiring fast, budget-friendly, and crystal clear for all the parties involved.
        </p>

        <div className="flex justify-center gap-4 mt-10">
          {frame.map((item, index) => (
            <div key={index} className="relative flex items-center justify-center">
              <img src={item.icons} alt="frame"  />
              <div className="socials absolute flex justify-evenly px-3 text-white bottom-2 sm:bottom-5 bg-white rounded-3xl scale-75 sm:scale-90 md:scale-100  ">
                <a href={"https://www.linkedin.com/"+item.ref.l} target="_blank" rel="noreferrer" className='flex p-1  max-w-[100%]   sm:scale-75 '>
                  <i className="fab fa-linkedin-in bg-blue-600 p-1 rounded-md "></i>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutTeam
