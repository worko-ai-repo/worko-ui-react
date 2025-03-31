import { useState, useEffect, useRef } from 'react';

const CorporateStepper = () => {
  const [activeStep, setActiveStep] = useState(1);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const steps = [
    {
      "id": 1,
      "title": "Smart Candidate Filtering",
      "description": "No more manual screening. Our AI models analyze your needs and filter through dozens of data points to bring out the best fits.",
    },
    {
      "id": 2,
      "title": "Maximized Job Visibility",
      "description": "Your job posting isn't limited to Worko. We promote it across multiple platforms, helping you find top talent faster.",
    },
    {
      "id": 3,
      "title": "Pre-Vetted Talent Pool",
      "description": "Gain access to a gold mine of pre-screened, high-intent candidates who are ready to contribute to your goals.",
    },
    {
      "id": 4,
      "title": "Seamless External Resume Processing",
      "description": "Upload thousands of CVs from external job boards and instantly receive a shortlist of top candidates.",
    }
  ];

  // Setting Intersection Observer for scroll animation
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -30% 0px", // Triggers when element is 30% in view
      threshold: 0.5
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]): void => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepId = parseInt(entry.target.getAttribute('data-step-id')|| '1');
          setActiveStep(stepId);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Register all step elements with the observer
    stepsRef.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      if (stepsRef.current) {
        stepsRef.current.forEach(ref => {
          if (ref) observer.unobserve(ref);
        });
      }
    };
  }, []);

  // Calculate progress for the vertical line
  const getProgressHeight = () => {
    if (activeStep === 1) return '25%';
    if (activeStep === 2) return '50%';
    if (activeStep === 3) return '75%';
    if (activeStep === 4) return '100%';
    return '0%';
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-12 md:py-16 flex flex-col items-center justify-center">
      <h2 className="text-3xl md:text-4xl lg:text-5xl text-center font-bold text-blue-500 mb-8 md:mb-16 max-w-3xl">
        Features That Make A Real Difference
      </h2>
      
      <div className="relative w-full">
        {/* Vertical line with dynamic progress */}
        <div className="absolute left-1/2 md:left-[52.2%] top-16 bottom-16 md:top-20 md:bottom-20 transform -translate-x-1/2 w-1.5 bg-gray-200 z-0">
          {/* Dynamic blue progress line */}
          <div 
            className="absolute top-0 left-0 right-0 bg-blue-600 rounded-t-full transition-all duration-500 ease-in-out"
            style={{ height: getProgressHeight() }}
          ></div>
        </div>
        
        <div className="space-y-20 md:space-y-32 w-full relative">
          {steps.map((step, index) => {
            const isActive = step.id <= activeStep;
            
            return (
              <div 
                key={step.id} 
                ref={g => stepsRef.current[index] = g} 
                data-step-id={step.id}
                className={`flex flex-col md:flex-row items-center justify-center relative transition-all duration-500 ease-in-out ${
                  isActive ? 'opacity-100' : 'opacity-50'
                }`}
              >
                {/* Left title section - right aligned on desktop */}
                <div className="w-full md:w-2/5 mb-4 md:mb-0 text-center md:text-right md:pr-10 lg:pr-16">
                  <h3 className={`text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight transition-colors duration-500 ${
                    isActive ? 'text-black' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                </div>
                
                {/* Center circle with number */}
                <div className="z-10 mb-6 md:mb-0">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors duration-500 ${
                    isActive ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    <span className={`text-2xl md:text-3xl font-semibold ${
                      isActive ? 'text-white' : 'text-gray-200'
                    }`}>
                      {step.id}
                    </span>
                  </div>
                </div>
                
                {/* Right description box */}
                <div className="w-full md:w-[30%] mt-4 text-left md:mt-0 md:ml-10 lg:ml-16">
                  <div className={`rounded-2xl p-4 md:p-6 transition-colors duration-500 transform ${
                    isActive ? 'bg-blue-500 scale-105' : 'bg-gray-200'
                  }`}>
                    <p className={`font-medium transition-colors duration-500 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CorporateStepper;