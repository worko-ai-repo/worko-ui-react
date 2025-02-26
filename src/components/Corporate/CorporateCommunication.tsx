import React from 'react';
import {email, whatsapp, call} from '@Assets'

function App() {
  return (
    <div className="min-h-screen rounded-3xl bg-[#316BFF] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-[70px]">
        {/* Header */}
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-center text-white text-4xl md:text-[50.8px] font-bold leading-[54px] tracking-[0.5px] max-w-[832px]">
            How We Ensure Candidate Response & Communication:
          </h1>
        </div>

        {/* Communication Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email Card */}
          <div className="relative bg-[#57E1E1] rounded-[15px] p-[45px] h-[232.5px] overflow-hidden">
            <h2 className="text-[#316BFF] text-left text-[26.25px] font-extrabold leading-[27px] tracking-[0.38px] mb-4">
              Email<br/> Communication:
            </h2>
            <p className="text-black text-left text-[15px] font-semibold leading-[18.75px] max-w-[292.5px]">
              No need to worry about drafting emails! Our fine-tuned AI crafts high-converting email messages and sends automated follow-ups to maximize engagement.
            </p>
            <img 
              src={email}
              alt="Email Icon"
              className="absolute top-[-28px] right-[-24px] w-[116px] h-[116px]"
            />
          </div>

          {/* WhatsApp Card */}
          <div className="relative bg-white rounded-[15px] p-[45px] h-[232.5px] overflow-hidden">
            <h2 className="text-[#316BFF] text-[26.25px] text-left font-extrabold leading-[27px] tracking-[0.38px] mb-4">
              WhatsApp <br/> Reminders:
            </h2>
            <p className="text-black text-left text-[15px] font-semibold leading-[18.75px] max-w-[303.75px] mt-4">
              Since many candidates in India prefer WhatsApp over email, we send timely reminders via WhatsApp to ensure they don't miss your updates.
            </p>
            <img 
              src={whatsapp}
              alt="WhatsApp Icon"
              className="absolute top-[-28px] right-[-24px] w-[114.61px] h-[99.97px] transform rotate-[22deg]"
            />
          </div>

          {/* Phone Card */}
          <div className="relative bg-white md:col-span-2 rounded-[15px] w-full p-[45px] h-[232.5px] overflow-hidden">
            <h2 className="text-[#316BFF] text-left text-[26.25px] font-extrabold leading-[27px] tracking-[0.38px] mb-4">
              Phone Calls:
            </h2>
            <p className="text-black text-[15px] text-left font-semibold leading-[18.75px] max-w-[387px] mt-4">
              If candidates still don't respond after emails and WhatsApp reminders, our team personally follows up with a phone call to secure a clear response
            </p>
            <img 
              src={call}
              alt="Phone Icon"
              className="absolute top-[-15px] right-[-10px] w-[114.61px] h-[99.97px] md:top-[3.5px] md:right-[44.5px] md:w-[206px] md:h-[206px] transform rotate-[-15deg]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;