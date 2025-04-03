import { Search } from "lucide-react";

const CompanyPageFallback = (mode):{mode : 'JOB' | 'REFERRAL'} => {
    const fallbackTitle = mode === 'JOB' ? "No Jobs Found" : "No Company Found";
    const fallbackDescription = mode === 'JOB' ? "It looks like there are no job listings matching your profile at the moment. Try adjusting the filters to find more relevant opportunities." : "It looks like there are no companies listings at the moment. Try adjusting the filters to find more relevant companies."

    return (<div className="relative flex flex-col items-center justify-center min-h-screen w-full text-center bg-white overflow-hidden px-6 md:px-12">
        {/* Top Left Bubble */}
        <div className="absolute top-[-10vh] left-[-5vw] w-40 h-40 md:w-64 md:h-64 opacity-50">
            {/* <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="#D0E2FF" d="M60,-46.2C75.3,-28.7,83.6,-3.9,79.3,19.5C75.1,42.8,58.4,64.6,35.9,76C13.4,87.4,-14.8,88.4,-35.4,77.1C-56.1,65.8,-69.1,42.3,-73.3,18.4C-77.4,-5.6,-72.7,-29.9,-59,-47C-45.3,-64.1,-22.6,-74,-0.1,-73.9C22.4,-73.8,44.7,-63.6,60,-46.2Z" transform="translate(100 100)" />
          </svg> */}
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#D0E2FF" d="M44.1,-77.1C57.3,-68.8,68.2,-57.2,76.8,-43.8C85.4,-30.4,91.8,-15.2,92.9,0.7C94.1,16.5,90,33.1,81.6,46.8C73.1,60.4,60.2,71.3,45.9,78.5C31.6,85.7,15.8,89.3,-0.1,89.5C-16.1,89.8,-32.2,86.6,-46.1,79.2C-60,71.7,-71.7,60,-79.8,46C-88,32.1,-92.5,16.1,-91.4,0.7C-90.2,-14.7,-83.3,-29.4,-74.6,-42.3C-65.8,-55.1,-55.1,-66.1,-42.4,-74.6C-29.6,-83.1,-14.8,-89.2,0.3,-89.7C15.5,-90.3,30.9,-85.3,44.1,-77.1Z" transform="translate(100 100)" />
            </svg>
        </div>

        {/* Bottom Left Bubble */}
        <div className="absolute bottom-[-10vh] left-[-5vw] w-40 h-40 md:w-64 md:h-64 opacity-50">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#D0E2FF" d="M60,-46.2C75.3,-28.7,83.6,-3.9,79.3,19.5C75.1,42.8,58.4,64.6,35.9,76C13.4,87.4,-14.8,88.4,-35.4,77.1C-56.1,65.8,-69.1,42.3,-73.3,18.4C-77.4,-5.6,-72.7,-29.9,-59,-47C-45.3,-64.1,-22.6,-74,-0.1,-73.9C22.4,-73.8,44.7,-63.6,60,-46.2Z" transform="translate(100 100)" />
            </svg>
        </div>

        {/* Small Floating Bubbles */}
        <div className="absolute top-[30vh] right-[12vw] w-12 h-12 md:w-20 md:h-20 opacity-40">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#D0E2FF" d="M60,-46.2C75.3,-28.7,83.6,-3.9,79.3,19.5C75.1,42.8,58.4,64.6,35.9,76C13.4,87.4,-14.8,88.4,-35.4,77.1C-56.1,65.8,-69.1,42.3,-73.3,18.4C-77.4,-5.6,-72.7,-29.9,-59,-47C-45.3,-64.1,-22.6,-74,-0.1,-73.9C22.4,-73.8,44.7,-63.6,60,-46.2Z" transform="translate(100 100)" />
            </svg>
        </div>

        <div className="absolute bottom-[30vh] left-[15vw] w-10 h-10 md:w-15 md:h-15 opacity-30">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#D0E2FF" d="M60,-46.2C75.3,-28.7,83.6,-3.9,79.3,19.5C75.1,42.8,58.4,64.6,35.9,76C13.4,87.4,-14.8,88.4,-35.4,77.1C-56.1,65.8,-69.1,42.3,-73.3,18.4C-77.4,-5.6,-72.7,-29.9,-59,-47C-45.3,-64.1,-22.6,-74,-0.1,-73.9C22.4,-73.8,44.7,-63.6,60,-46.2Z" transform="translate(100 100)" />
            </svg>
        </div>

        {/* Background Bubbles */}
        <div className="absolute top-[5vh] left-[5vw] w-32 h-32 md:w-40 md:h-40 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-[10vh] right-[5vw] w-24 h-24 md:w-32 md:h-32 bg-blue-200 rounded-full opacity-30 blur-2xl"></div>
        <div className="absolute bottom-[10vh] left-[25vw] w-20 h-20 md:w-24 md:h-24 bg-blue-300 rounded-full opacity-20 blur-2xl"></div>

        {/* Updated Wavy Line SVG */}
        <div className="absolute top-[18vh] right-[10vw] w-10 h-10 md:w-16 md:h-16 opacity-50">
            <svg width="100px" height="100px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" fill="#3B82F6">
                <path d="M27 23c-2.589 0-4.005-2.549-5.374-5.014C20.537 16.026 19.411 14 18 14c-1.412 0-2.537 2.026-3.626 3.986C13.004 20.451 11.588 23 9 23c-2.65 0-3.853-2.706-4.914-5.094C3.038 15.546 2.256 14 1 14a1 1 0 0 1 0-2c2.65 0 3.853 2.706 4.914 5.094C6.962 19.453 7.744 21 9 21c1.412 0 2.537-2.026 3.626-3.986C13.996 14.549 15.412 12 18 12c2.589 0 4.005 2.549 5.374 5.014C24.463 18.974 25.589 21 27 21c1.256 0 2.037-1.547 3.086-3.906C31.147 14.706 32.351 12 35 12a1 1 0 1 1 0 2c-1.256 0-2.037 1.546-3.086 3.906C30.853 20.294 29.649 23 27 23z"></path>
            </svg>
        </div>

        <div className="absolute bottom-[20vh] left-[10vw] w-10 h-10 md:w-16 md:h-16 opacity-50">
            <svg width="100px" height="100px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" fill="#3B82F6">
                <path d="M27 23c-2.589 0-4.005-2.549-5.374-5.014C20.537 16.026 19.411 14 18 14c-1.412 0-2.537 2.026-3.626 3.986C13.004 20.451 11.588 23 9 23c-2.65 0-3.853-2.706-4.914-5.094C3.038 15.546 2.256 14 1 14a1 1 0 0 1 0-2c2.65 0 3.853 2.706 4.914 5.094C6.962 19.453 7.744 21 9 21c1.412 0 2.537-2.026 3.626-3.986C13.996 14.549 15.412 12 18 12c2.589 0 4.005 2.549 5.374 5.014C24.463 18.974 25.589 21 27 21c1.256 0 2.037-1.547 3.086-3.906C31.147 14.706 32.351 12 35 12a1 1 0 1 1 0 2c-1.256 0-2.037 1.546-3.086 3.906C30.853 20.294 29.649 23 27 23z"></path>
            </svg>
        </div>

        {/* Search Icon */}
        <Search className="w-16 h-16 md:w-24 md:h-24 text-blue-500 mb-4 md:mb-6 relative z-10" />

        {/* Text Content */}
        <div className="relative z-10 max-w-lg px-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{fallbackTitle}</h2>
            <p className="mt-2 text-gray-600">
                {fallbackDescription}
            </p>
        </div>
    </div>)
}

export default CompanyPageFallback;