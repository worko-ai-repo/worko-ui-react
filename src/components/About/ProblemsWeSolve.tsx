import Reveal from '@Views/intersection-observer/IntersectionObs'
import React from 'react'
import AboutCardOne from './AboutCardOne'

const ProblemsWeSolve = () => {
  return (
    <section className="   min-h-52 bg-[#4B7EFF] flex items-center justify-center ">
			<div className="section-wrapper   pb-10 !pt-5 font-bold ">
                <Reveal IsDual={false} CName="slide_up" threshold={0.5} PCName="mx-auto w-fit">
                    <h1 className='text-[1.5rem] sm:text-3xl md:text-4xl tracking-wider text-white text-center my-10  mx-auto '>How We Are Changing the Game</h1>
                </Reveal>
                    <AboutCardOne />
            </div>
    </section>
  )
}

export default ProblemsWeSolve