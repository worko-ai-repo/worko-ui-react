import React from 'react'
import { AboutCardDataOne } from './AboutCardData'

const AboutCardOne = () => {


  return (
    <div className="flex  flex-wrap justify-center gap-y-14 gap-4">
    {AboutCardDataOne.map((item, index) => (
      <div
        key={index}
        className="flex gap-2  sm:max-w-[700px] border items-center p-4 bg-blue-500 text-white rounded-[40px] shadow-lg max-w-3xl relative drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] "
      >
        {/* Number */}
        <div className="flex  items-center justify-center min-w-[2.5rem] min-h-[2.5rem] sm:w-14 sm:h-14 text-[1rem] md:text-3xl font-semibold bg-white text-blue-500 drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-full">
          {index + 1}
        </div>

        {/* Text Content */}
        <div className="ml-2 flex-1 text-left sm:max-w-[320px] max-w-[250px] ">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <p className="text-sm font-medium">{item.description}</p>
        </div>

        {/* Image */}
        <img src={item.image} alt={item.title} className="hidden sm:block ml-10 w-20 h-20 right-4" />
      </div>
    ))}
  </div>
  )
}

export default AboutCardOne