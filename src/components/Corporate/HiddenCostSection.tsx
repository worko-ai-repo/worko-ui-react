import { Check, ScrollText } from "lucide-react";

export function HiddenCostSection() {
  return (
    <section className="py-16 px-6  ">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
            The Hidden Cost of Traditional Hiring
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Every company faces the same overwhelming hiring challenges. Here's what the numbers
            really mean for your business.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 text-left">
          <div className="flex flex-col items-start justify-between p-8 rounded-3xl border-l-4 border-l-red-500 bg-white shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Your Current Hiring Reality</h3>

            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mr-4">
                    <ScrollText className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Resumes Received</div>
                    <div className="text-sm text-gray-600">Per job posting on average</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-500">1,000+</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mr-4">
                    <Check className="w-6 h-6 text-red-500 bg-orange-200 rounded-full p-1" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Relevant Candidates</div>
                    <div className="text-sm text-gray-600">After initial screening</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-500">~50</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Hours Wasted Screening</div>
                    <div className="text-sm text-gray-600">Per hiring cycle</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-500">40+</div>
              </div>

              <div className="flex  items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Hiring Timeline</div>
                    <div className="text-sm text-gray-600">From posting to offer</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-500">6+ weeks</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t w-full border-gray-200">
              <div className="bg-red-100 p-7 rounded-lg">
                <div className="text-sm text-gray-800 mb-1">Total Cost Impact:</div>
                <div className="text-lg font-bold text-red-500">
                  ₹2-5 lakhs in lost productivity per role
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between rounded-3xl p-8 border-l-4 border-l-green-500 bg-white shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              With Worko.ai's Smart Filtering
            </h3>

            <div className="space-y-8 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Qualified Candidates</div>
                    <div className="text-sm text-gray-600">Pre-screened and interview-ready</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-500">10-15</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Relevance Rate</div>
                    <div className="text-sm text-gray-600">AI-powered matching accuracy</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-500">98%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Time to Hire</div>
                    <div className="text-sm text-gray-600">From posting to offer acceptance</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-500">
                  <span className="text-2xl">2 weeks</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Time Saved</div>
                    <div className="text-sm text-gray-600">Screening and coordination</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  <span className="text-2xl">35+ hours</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Your Savings:</div>
                <div className="text-lg font-bold text-green-600">
                  ₹1.5-3 lakhs per role + 35 hours of your team's time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
