import { appsforbharat, corp_office_bg, firstClub, meesho, rapido } from "@Assets";


export default function HeroSection({ hires, salary }: { hires: number; salary: number }) {
  const traditionalCost = Math.round(hires * salary * 100000 * 0.12);
  const workoCost = Math.round(hires * salary * 100000 * 0.02);

  return (
    <section className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white min-h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
           src={corp_office_bg}
          alt="Modern office background"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/90" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 animate-fade-in">
        {/* Left Side */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Stop Drowning in <span className="text-yellow-400">1,000+ Resumes</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-lg sm:text-2xl font-bold">
            Start Getting <span className="text-green-400">10–15 Interview-Ready</span> Candidates
          </p>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-blue-100 max-w-lg mx-auto lg:mx-0">
            Our AI evaluates 5 critical parameters and surfaces only candidates worth your time.{' '}
            <span className="font-bold">98% relevance rate.</span>
          </p>
          <div className="mt-6 sm:mt-8">
            <a
              href="https://calendly.com/sarvesh-singh-worko/30min"
              className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white text-base sm:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-md shadow-lg transition-transform hover:scale-105"
              aria-label="Book Free Demo"
            >
              📞 Book Free Demo – See Results in 7 Days
            </a>
          </div>
          {/* Trusted Companies */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <div className="flex space-x-3">
              {[
                { src: rapido, alt: 'Rapido logo' },
                { src: meesho, alt: 'Meesho logo' },
                { src: appsforbharat, alt: 'Appsforbharat logo' },
                { src: firstClub, alt: 'Firstclub logo' },
              ].map((logo, index) => (
                <div
                  key={index}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200 overflow-hidden"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-sm sm:text-base">50+ Companies Trust Us</p>
              <p className="text-blue-100 text-xs sm:text-sm">80% reduction in screening time</p>
            </div>
          </div>
        </div>

        {/* Right Side - Stat Card */}
        <div className="flex-1 w-full max-w-md animate-slide-up">
          <div className="bg-white text-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">Your Current Hiring Reality</h3>
            <ul className="space-y-3 text-base sm:text-lg">
              <li className="flex justify-between border-b pb-2">
                <span>Resumes Received</span>
                <span className="text-red-600 font-bold">1,000+</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Relevant Candidates</span>
                <span className="text-red-600 font-bold">~50</span>
              </li>
              <li className="flex justify-between border-b pb-2">
                <span>Hours Wasted Screening</span>
                <span className="text-red-600 font-bold">40+</span>
              </li>
              <li className="flex justify-between">
                <span>Hiring Timeline</span>
                <span className="text-red-600 font-bold">6+ weeks</span>
              </li>
            </ul>
            <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 text-center">
              <p className="text-gray-600 font-semibold">With Worko.ai:</p>
              <div className="flex justify-around mt-3">
                <div>
                  <p className="text-green-600 font-bold text-xl sm:text-2xl">10–15</p>
                  <p className="text-xs sm:text-sm text-gray-600">Qualified Candidates</p>
                </div>
                <div>
                  <p className="text-green-600 font-bold text-xl sm:text-2xl">2 weeks</p>
                  <p className="text-xs sm:text-sm text-gray-600">Average Hire Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}