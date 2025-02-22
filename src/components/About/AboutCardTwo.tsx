import React from 'react'
import { AboutCardDataTwo } from './AboutCardData'
import { about_bg } from '@Assets'

const AboutCardTwo = () => {


  return (
      <div className={`flex  flex-wrap justify-center gap-y-5 gap-4 mx-auto max-w-[730px] scale:75 sm:scale-95 md:scale-100 bg-[${about_bg}]]` }>
        <img src={about_bg} alt="" className='invisible sm:visible absolute z-0 object-contain ' />
    {AboutCardDataTwo.map((item, index) => (
      <div
        key={index}
        className={` flex gap-2 mb-14 sm:mb-5 bg-white flex-wrap  border items-center p-4  rounded-[40px] shadow-lg max-w-3xl relative ${item.positions} drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] `}>

        {/* Text Content */}
        <div className="ml-4 flex-1 text-left sm:max-w-[320px] max-w-[250px] ">
          <h3 className="text-lg font-bold text-sky-500 ">{item.title}</h3>
          <p className="text-sm font-normal ">{item.description}</p>
        </div>

        {/* Image */}
        <div className="absolute  scale-50 -top-20 left-14 sm:relative sm:top-0 sm:left-0 sm:scale-75 md:scale-100 bg-gradient-to-r from-purple-100 to-purple-100 ml-10 -rotate-12 rounded-[20px] bg-[rgba(196,196,196,0.04)] shadow-[inset_0px_30.021px_43.107px_-27.712px_rgba(255,255,255,0.50),inset_0px_-10.007px_6.928px_-10.777px_rgba(255,255,255,0.75),inset_0px_5.388px_8.467px_-3.079px_#FFF,inset_0px_-63.121px_52.345px_-49.265px_rgba(96,68,144,0.30),inset_0px_75.438px_76.977px_-36.949px_rgba(202,172,255,0.30),inset_0px_3.079px_13.856px_0px_rgba(154,146,210,0.30),inset_0px_0.77px_30.791px_0px_rgba(227,222,255,0.20)] backdrop-blur-[38.48860168457031px] ">
            <img src={item.image} alt={item.title} className="object-contain  w-20 h-20 right-4" />
            </div>
      </div>
    ))}
  </div>
  )
}

export default AboutCardTwo