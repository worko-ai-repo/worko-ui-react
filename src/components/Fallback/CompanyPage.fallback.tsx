import { Bubble, WavyLine } from "@Assets";
import { Search } from "lucide-react";

const CompanyPageFallback = ({ mode }: { mode: 'JOB' | 'REFERRAL' }) => {
    const fallbackTitle = mode === 'JOB' ? "No Jobs Found" : "No Company Found";
    const fallbackDescription = mode === 'JOB' ? "It looks like there are no job listings matching your profile at the moment. Try adjusting the filters to find more relevant opportunities." : "It looks like there are no companies listings at the moment. Try adjusting the filters to find more relevant companies."

    return (<div className="relative flex flex-col items-center justify-center min-h-screen w-full text-center bg-white overflow-hidden px-6 md:px-12">
        {/* Top Left Bubble */}
        <div className="absolute top-[-10vh] left-[-5vw] w-40 h-40 md:w-64 md:h-64 opacity-50">
            <img src={Bubble} alt="Bubble" />
        </div>

        {/* Bottom Left Bubble */}
        <div className="absolute bottom-[-10vh] left-[-5vw] w-40 h-40 md:w-64 md:h-64 opacity-50">
            <img src={Bubble} alt="Bubble" />
        </div>

        {/* Small Floating Bubbles */}
        <div className="absolute top-[30vh] right-[12vw] w-12 h-12 md:w-20 md:h-20 opacity-40">
            <img src={Bubble} alt="Bubble" />
        </div>

        <div className="absolute bottom-[30vh] left-[15vw] w-10 h-10 md:w-15 md:h-15 opacity-30">
             <img src={Bubble} alt="Bubble" />
        </div>

        {/* Background Bubbles */}
        <div className="absolute top-[5vh] left-[5vw] w-32 h-32 md:w-40 md:h-40 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-[10vh] right-[5vw] w-24 h-24 md:w-32 md:h-32 bg-blue-200 rounded-full opacity-30 blur-2xl"></div>
        <div className="absolute bottom-[10vh] left-[25vw] w-20 h-20 md:w-24 md:h-24 bg-blue-300 rounded-full opacity-20 blur-2xl"></div>

        {/* Updated Wavy Line SVG */}
        <div className="absolute top-[18vh] right-[10vw] w-10 h-10 md:w-16 md:h-16 opacity-50">
        <img src={WavyLine} alt="Bubble" />
        </div>

        <div className="absolute bottom-[20vh] left-[10vw] w-10 h-10 md:w-16 md:h-16 opacity-50">
        <img src={WavyLine} alt="Bubble" />
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