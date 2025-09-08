import { Clock, MessageCircle, Rocket, ShieldCheck } from "lucide-react";

function CorporatePlans() {
  const plans = [
    {
      title: 'Job Board',
      price: '2%',
      desc: 'of CTC',
      features: [
        'Pay-As-You-Go model',
        'AI-Powered candidate filtering',
        'Enhanced Insights',
        'Priority support',
        'Custom Solutions',
      ],
      button: 'Try Now',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
	  buttonLink: 'https://worko.ai/corporate/connect-with-us?plan=Job%20Board', 
    },
    {
      title: 'Hiring Partner',
      price: '3%',
      desc: 'of CTC + Retainership*',
      features: [
        '60-day replacement guarantee',
        'Dedicated recruitment team',
        'End-to-end candidate communication',
        '2000 free AI screening credits',
        'Senior account manager',
      ],
      button: 'Try Now',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
	  buttonLink: 'https://worko.ai/corporate/connect-with-us?plan=Hiring%20Partner', 
      popular: true,
    },
    {
      title: 'Co-Pilot',
      price: '12%',
      desc: 'of CTC',
      features: [
        '90-day replacement guarantee',
        'Executive search capabilities',
        'Complete hiring process management',
        '500 free AI screening credits',
        'Priority placement',
      ],
      button: 'Try Now',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
	  buttonLink: 'https://worko.ai/corporate/connect-with-us?plan=Co-Pilot', 
    },
  ];

  return (
    <section id="pricing" className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
        <p className="text-gray-600 mb-8 sm:mb-12 text-sm sm:text-base">
          Pay only when you hire. No upfront costs, no hidden fees.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`border rounded-xl p-4 sm:p-6 shadow hover:shadow-lg transition-transform hover:scale-105 relative ${
                plan.popular ? 'border-2 border-blue-600' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg sm:text-lg font-semibold mb-2">{plan.title}</h3>
              <p className="font-medium mb-4 sm:mb-6 text-sm sm:text-base">
                Pricing: <span className="text-blue-600 font-bold">{plan.price}</span> {plan.desc}
              </p>
              <ul className="text-xs sm:text-sm text-left space-y-2 mb-4 sm:mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i}>✔️ {feature}</li>
                ))}
              </ul>
              <a
				  href={plan.buttonLink}
				  target="_blank"
				  rel="noopener noreferrer"
				  className={`w-full ${plan.buttonStyle} py-2 rounded-lg text-sm sm:text-base transition-transform hover:scale-105 inline-block text-center`}
				>
				  {plan.button}
				</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CorporatePlans;


// CTA Banner Section
export function CTABannerSection() {
  return (
    <section className="bg-gradient-to-r from-indigo-800 to-purple-700 text-white py-12 sm:py-16">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          Ready to Stop Wasting Time on Irrelevant Resumes?
        </h2>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-200">
          Join 50+ companies who transformed their hiring process.{' '}
          <span className="font-semibold text-white">See results in your first week.</span>
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6 sm:mb-8">
          <a
            href="https://calendly.com/sarvesh-singh-worko/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            <Rocket className="w-4 sm:w-5 h-4 sm:h-5" />
            Book Demo - Get Results in 7 Days
          </a>
          <a
            href="https://wa.me/+918349484365"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border border-gray-300 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-white hover:text-purple-700 transition-transform hover:scale-105"
          >
            <MessageCircle className="w-4 sm:w-5 h-4 sm:h-5" />
            Chat with Our Team
          </a>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400" />
            <span>No Setup Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span>7-Day Results</span>
          </div>
        </div>
      </div>
    </section>
  );
}
