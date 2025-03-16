import React from 'react';
import { Check } from 'lucide-react';

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  price: string;
  additional?: string;
  isRecommended?: boolean;
  buttonVariant: 'primary' | 'secondary';
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    name: 'Job Board',
    price: '2%',
    buttonVariant: 'secondary',
    features: [
      { text: 'Pay-As-You-Go: Pay only when candidates join.' },
      { text: 'AI-Powered Filtering: Utilize our AI matching algorithm to screen candidates sourced externally.' },
      { text: 'Enhanced Insights: Access candidate video interviews with evaluations on Communication, Personality, Aptitude, and Skills.' },
      { text: 'Support: Account manager to assist you.' },
    ],
  },
  {
    name: 'Hiring Partner',
    price: '3%',
    additional: ' + Retainership',
    isRecommended: true,
    buttonVariant: 'primary',
    features: [
      { text: 'Comprehensive Coverage: 60-day replacement or refund policy.' },
      { text: 'Dedicated Recruitment Team: We act as your extended talent acquisition team.' },
      { text: 'Complete Communication: End-to-end candidate engagement handled on your behalf.' },
      { text: 'AI-Driven Solutions: Benefit from our AI matching algorithm for external candidate filtering. (2000 Free Credit)' },
      { text: 'Enhanced Insights: Access candidate video interviews with evaluations on Communication, Personality, Aptitude, and Skills.' },
      { text: 'Personalized Support: Senior dedicated account manager for seamless collaboration.' },
      { text: 'Custom Solutions: Product customization to meet your unique hiring needs.*' },
    ],
  },
  {
    name: 'Co-Pilot',
    price: '7%',
    buttonVariant: 'secondary',
    features: [
      { text: 'Pay-As-You-Go: Pay only when candidates join.' },
      { text: 'Risk-Free Guarantee: 60-day replacement or refund policy.' },
      { text: 'AI-Powered Efficiency: Use our AI matching algorithm to screen externally sourced candidates.(500 Free Credit)' },
      { text: 'Enhanced Insights: Access candidate video interviews with evaluations on Communication, Personality, Aptitude, and Skills.' },
      { text: 'Personalized Support: Dedicated account manager to assist you.' },
    ],
  },
];

function CorporatePlans() {
  return (
    <section className=" py-16 px-4 sm:px-6 lg:px-8" id='corporatePlans'>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16">
        Flexible Plans For All Your Needs and Budgets
        </h1>

        
        
        <div className="grid grid-cols-1 max-w-5xl mx-auto md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              {plan.isRecommended && (
                <div className="absolute top-0 left-0 right-0 bg-[#4B7EFF] text-white text-center py-2 text-xs tracking-[3.5px]">
                  RECOMMENDED
                </div>
              )}
              <div className="p-6 pt-8  border-2 border-gray-200 rounded-sm bg-white">
                
                <h2 className="text-xl font-medium text-gray-900 mt-2 text-left">{plan.name}</h2>
                <div className="mb-8 text-left">
                  <span className="text-sm font-medium">Pricing: </span>
                  <span className="text-xl font-bold text-[#316BFF]">{plan.price}</span>
                  <span className="text-sm font-medium"> of CTC {plan.additional}</span>
                </div>
                <button
                  className={`w-full py-2 rounded text-center text-sm font-semibold tracking-wider transition-colors duration-300 ${
                    plan.buttonVariant === 'primary'
                      ? 'bg-[#4B7EFF] text-white w-full rounded-lg py-1 hover:bg-[#3A6AE8]'
                      : 'bg-black text-gray-200 w-full rounded-lg py-1 hover:bg-gray-800'
                  }`}
                  onClick={() => window.location.href = '/for-corporate/connect-with-us '}
                >
                  Try now
                </button>
              </div>
              <div className="px-6 pb-6">
                <div className="text-xs">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-4 my-2">
                      <Check className="text-[#4B7EFF] flex-shrink-0 mt-1" size={24} />
                      <span className="text-gray-700 text-left">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CorporatePlans;