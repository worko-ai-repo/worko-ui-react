import React from 'react';

const CorporateStepper = () => {

  const steps = [
    {
      id: 1,
      title: "Intelligent Filtering",
      description: "Our advanced AI matching algorithm eliminates irrelevant profiles, saving you the effort of manual screening.",
      active: true
    },
    {
      id: 2,
      title: "Job Promotion Made Easy",
      description: "We promote your job postings across multiple platforms on your behalf, so you don't need to worry about being a marketing expert.",
      active: false
    },
    {
      id: 3,
      title: "High-Intent Jobseeker Database",
      description: "Tap into our exclusive database of highly motivated jobseekers, ready to apply for the right opportunities.",
      active: false
    },
    {
      id: 4,
      title: "Access to Top Data Sources",
      description: "Tap into our exclusive database of highly motivated jobseekers, ready to apply for the right opportunities.",
      active: false
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 md:py-16 flex flex-col items-center justify-center">
      <h2 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold text-blue-500 mb-8 md:mb-16 max-w-3xl">
        How We Ensure Faster Candidate Applications:
      </h2>
      
      <div className="relative w-full">
        {/* Vertical line - adjusted to be slightly to the left on md devices */}
        <div className="absolute left-1/2 md:left-[52.2%] top-16 bottom-16 md:top-20 md:bottom-20 transform -translate-x-1/2 w-1.5 z-0">
        {/* Blue section (1/5th of the height) */}
        <div className="absolute top-0 left-0 right-0 h-2/5 bg-blue-600 rounded-t-full"></div>
        
        {/* Gray section (4/5th of the height) */}
        <div className="absolute top-28 left-0 right-0 bottom-0 bg-gray-400"></div>
      </div>
        
        <div className="space-y-20 md:space-y-16 w-full relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col md:flex-row items-center justify-center relative">
              {/* Left title section - right aligned on desktop */}
              <div className="w-full md:w-2/5 mb-4 md:mb-0 text-center md:text-right md:pr-10 lg:pr-16">
                <h3 className={`text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight ${step.active ? 'text-black' : 'text-gray-500'}`}>
                  {step.title}
                </h3>
              </div>
              
              {/* Center circle with number */}
              <div className="z-10 mb-6 md:mb-0">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${step.active ? 'bg-blue-500' : 'bg-gray-500'}`}>
                  <span className={`text-2xl md:text-3xl font-semibold ${step.active ? 'text-white' : 'text-gray-200'}`}>
                    {step.id}
                  </span>
                </div>
              </div>
              
              {/* Right description box */}
              <div className="w-full md:w-[30%] mt-4 text-left md:mt-0 md:ml-10 lg:ml-16">
                <div className={`rounded-2xl p-4 md:p-6 ${step.active ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <p className={`font-medium ${step.active ? 'text-white opacity-90' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CorporateStepper;