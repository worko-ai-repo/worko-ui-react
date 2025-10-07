import React from 'react'
import AgencySignupForm from './AgencySignupForm'
import { logo_text } from '@Assets'

interface AgencySignupProps{

}

const AgencySignup:React.FC<AgencySignupProps> = ({}) => {

  const data:any = []
    async function handleFormSubmit(formData: any) {
    // Check if evaluatorCognitoUserId exists - handle existing evaluator
    // if (data?.evaluatorCognitoUserId) {
    //   const saved = await saveExistingEvaluatorData(formData);
    //   if (saved) {
    //     // Navigate to forgot password page after successful data save
    //     navigateTo("/auth/resetpassword", { 
    //       state: { 
    //         from: "corporate-signup", 
    //         email: data.email 
    //       } 
    //     });
    //   }
    //   return;
    // }
  }
  return (
<div id="Authlayout" className="h-screen w-full bg-white relative overflow-hidden">
  {/* Background shapes */}
  <div className="absolute bottom-0 -left-48 w-[25vw] h-[20vw] rounded-[10vh] rotate-[245deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>
  <div className="absolute top-0 -right-48 w-[25vw] h-[20vw] rounded-[10vh] rotate-[65deg] z-10 bg-gradient-to-b from-cyan-400 to-blue-500"></div>

  {/* Scrollable Content Container */}
  <div className="relative z-20 flex justify-center items-start h-full overflow-y-auto">
    <div className="w-full max-w-4xl px-4 sm:px-6 md:px-10 py-10 flex flex-col items-center">
      {/* Logo + Title */}
      <div className="mb-6 text-center">
        <img src={logo_text} alt="Worko Logo" className="w-32 h-auto mx-auto" />
        <p className="font-semibold text-gray-700 text-2xl mt-2">Agency Signup</p>
      </div>

      {/* Form Section */}
      <div className="w-full flex justify-center">
        <AgencySignupForm 
          inviteData={data} 
          handleFormSubmit={handleFormSubmit}
        />
      </div>
    </div>
  </div>
</div>


  )
}

export default AgencySignup