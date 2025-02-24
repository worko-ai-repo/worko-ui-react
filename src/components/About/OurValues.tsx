import Reveal from '@Views/intersection-observer/IntersectionObs'
import { Section } from 'lucide-react'
import React from 'react'
import AboutCardTwo from './AboutCardTwo'

const OurValues = () => {
  return (
    <section className="   min-h-52 flex items-center justify-center  ">
			<div className="section-wrapper  py-10 text-sm  font-bold !pt-10  ">
            <Reveal IsDual={false} CName="slide_up" threshold={0.5} PCName="mx-auto  w-fit">
                    <h1 className='text-[1.5rem] sm:text-3xl md:text-4xl tracking-wider text-sky-500 text-center mb-32 sm:mb-20  mx-auto '>Our Values</h1>
                </Reveal>

                <AboutCardTwo />
            </div>
    </section>
  )
}

export default OurValues