import React from 'react'
import AgencyLoginForm from './AgencyLoginForm'
import { logo_text, logo_text_bright } from '@Assets'
import MainLoader from '@Components/Loader/Loader'

interface AgencyLoginProps{

}

const AgencyLogin:React.FC<AgencyLoginProps>= () => {
  return (
        <div id="Authlayout" className="h-[100vh] flex justify-center items-center w-full bg-white relative overflow-hidden">
      {/* <div className="absolute bottom-0 -left-48 w-[25vw] h-[20vw] rounded-[10vh] rotate-[245deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
      <div className="absolute top-0 -right-48 w-[25vw] h-[20vw]   rounded-[10vh] rotate-[65deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div> */}
        {/* worko logo */}
        <div className="absolute top-4 center-4 z-20">
            <img src={logo_text} alt="Worko Logo" className="w-32 h-auto" />
        </div>
        {/* agency login form */}
        <div className=" flex items-center justify-center gap-4 z-20  sm:max-w-[80%] w-[350px] h-min">
          <AgencyLoginForm />
        </div>
    </div>
  )
}

export default AgencyLogin