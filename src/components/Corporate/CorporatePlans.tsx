import { Clock, MessageCircle, Rocket, ShieldCheck } from "lucide-react";


import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

function CorporatePlans() {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (planIndex: number, itemKey: string) => {
    const key = `${planIndex}-${itemKey}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const plans = [
    {
      title: 'Job Board',
      price: '2%',
      desc: 'of CTC',
      suitableFor: 'Startups and companies seeking intelligent sourcing solutions with cost-effective, results-driven recruitment technology.',
      features: [
        {
          name: 'Pay-As-You-Go model',
          description: 'Only pay when you successfully hire a candidate. No monthly subscriptions, no setup fees, no hidden costs. You invest only when you get results.'
        },
        {
          name: 'AI-Powered candidate filtering',
          description: 'Our advanced AI analyzes resumes beyond keywords, evaluating skills, experience relevance, cultural fit, and career progression to deliver 98% relevant candidates.'
        },
        {
          name: 'IATS (Intelligent Applicant Tracking System)',
          description: 'Complete applicant tracking system with pipeline management, candidate communication tools, interview scheduling, and hiring analytics - all integrated seamlessly into one platform.'
        },
        {
          name: 'Enhanced Insights',
          description: 'Get detailed analytics on your hiring funnel, candidate quality metrics, time-to-hire data, and market salary benchmarks to optimize your recruitment strategy.'
        },
        {
          name: 'Priority support',
          description: 'Dedicated customer success team available via email and chat during business hours. Get help with job posting optimization and platform guidance.'
        },
        {
          name: 'Custom Solutions',
          description: 'Tailored integrations with your existing ATS, custom reporting dashboards, and specialized filtering criteria based on your unique hiring requirements.'
        }
      ],
      button: 'Try Now',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonLink: `${import.meta.env.APP_WORKO_BASE_URL}/corporate/connect-with-us?plan=Job%20Board`,
    },
    {
      title: 'Hiring Co-Pilot',
      price: '3%',
      desc: 'of CTC + Retainership*',
      suitableFor: 'Companies seeking comprehensive long-term hiring solutions with dedicated recruitment support.',
      features: [
        {
          name: '60-day replacement guarantee',
          description: 'If a hired candidate leaves within 60 days for any reason, we\'ll find and provide a replacement candidate at no additional cost to ensure your hiring success.'
        },
        {
          name: 'Dedicated recruitment team',
          description: 'A specialized team of recruiters assigned exclusively to your account, understanding your company culture and specific hiring needs.'
        },
        {
          name: 'Executive search capabilities',
          description: 'Specialized executive search for C-level, VP, and senior management positions with access to passive candidates and executive networks.'
        },
        {
          name: 'IATS (Intelligent Applicant Tracking System)',
          description: 'Complete applicant tracking system with pipeline management, candidate communication tools, interview scheduling, and hiring analytics - all integrated seamlessly into one platform.'
        },
        {
          name: 'End-to-end candidate communication',
          description: 'We handle all candidate touchpoints including initial outreach, interview scheduling, follow-ups, offer negotiations, and onboarding coordination.'
        },
        {
          name: '500 free AI screening credits',
          description: 'Process up to 500 candidate profiles monthly with our AI screening at no extra cost, saving significant time on initial candidate evaluation.'
        },
        {
          name: 'Senior account manager',
          description: 'Dedicated senior account manager with 5+ years recruitment experience, providing strategic hiring advice and weekly progress reviews.'
        }
      ],
      button: 'Try Now',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonLink: `${import.meta.env.APP_WORKO_BASE_URL}/corporate/connect-with-us?plan=Co-Pilot`,
      popular: true,
    },
    {
      title: 'Full Recruitment',
      price: '8.5 to 15%',
      desc: 'of CTC',
      suitableFor: 'Organizations with ad-hoc hiring requirements needing flexible, full-service recruitment solutions for specialized or urgent positions.',
      features: [
        {
          name: '90-day replacement guarantee',
          description: 'Extended 90-day guarantee for senior and executive roles. If the hired candidate doesn\'t work out, we provide a replacement with enhanced vetting process.'
        },
        {
          name: 'Dedicated recruitment team',
          description: 'A specialized team of recruiters assigned exclusively to your account, understanding your company culture and specific hiring needs.'
        },
        {
          name: 'Executive search capabilities',
          description: 'Specialized executive search for C-level, VP, and senior management positions with access to passive candidates and executive networks.'
        },
        {
          name: 'Complete hiring process management',
          description: 'Full-service recruitment including job description optimization, candidate sourcing, screening, interview coordination, reference checks, and offer negotiation.'
        },
        {
          name: '500 free AI screening credits',
          description: 'Monthly allocation of 500 AI screening credits for high-volume positions, with detailed candidate scoring and ranking reports.'
        },
        {
          name: 'Senior account manager',
          description: 'Dedicated senior account manager with 5+ years recruitment experience, providing strategic hiring advice and weekly progress reviews.'
        }
      ],
      button: 'Try Now',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonLink: `${import.meta.env.APP_WORKO_BASE_URL}/corporate/connect-with-us?plan=Hiring%20Partner`,
    },
  ];

  useEffect(() => {
    if (!plans || plans.length === 0) return;

    setExpandedItems(prev => {
      const initial = { ...prev };
      plans.forEach((_, index) => {
        const key = `${index}-suitable`;
        if (!(key in initial)) {
          initial[key] = true;
        }
      });
      return initial;
    });
  }, []); 


  return (
    <section id="pricing" className="bg-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
        <p className="text-gray-600 mb-8 sm:mb-12 text-sm sm:text-base">
          Pay only when you hire. No upfront costs, no hidden fees.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, planIndex) => (
            <div
              key={planIndex}
              className={`border rounded-xl p-4 sm:p-6 shadow hover:shadow-lg transition-transform hover:scale-105 relative cursor-pointer ${
                plan.popular ? 'border-2 border-blue-600' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm rounded-full">
                  Most Popular
                </span>
              )}
              
              <h3 className="text-lg sm:text-lg font-semibold mb-2">{plan.title}</h3>
              <p className="font-medium mb-4 text-sm sm:text-base">
                Pricing: <span className="text-blue-600 font-bold">{plan.price}</span> {plan.desc}
              </p>

              {/* Suitable For Section */}
              <div className="mb-4">
                <div
                  className="flex items-center justify-between gap-2 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                  onClick={() => toggleExpand(planIndex, 'suitable')}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-bold text-gray-800">Suitable for:</span>
                  </div>
                  {expandedItems[`${planIndex}-suitable`] ? (
                    <ChevronUp className="text-gray-400 flex-shrink-0 w-4 h-4" />
                  ) : (
                    <ChevronDown className="text-gray-400 flex-shrink-0 w-4 h-4" />
                  )}
                </div>
                {expandedItems[`${planIndex}-suitable`] && (
                  <div className="px-2 text-xs text-gray-900 text-left leading-relaxed mt-1">
                    {plan.suitableFor}
                  </div>
                )}
              </div>

              {/* Features List */}
              <ul className="text-left space-y-1 mb-4 sm:mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="border-b border-gray-100 last:border-b-0">
                    <div
                      className="flex items-center justify-between gap-2 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                      onClick={() => toggleExpand(planIndex, `feature-${featureIndex}`)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-green-500 flex-shrink-0">✓</span>
                        <span className="text-xs sm:text-sm">{feature.name}</span>
                      </div>
                      {expandedItems[`${planIndex}-feature-${featureIndex}`] ? (
                        <ChevronUp className="text-gray-400 flex-shrink-0 w-4 h-4" />
                      ) : (
                        <ChevronDown className="text-gray-400 flex-shrink-0 w-4 h-4" />
                      )}
                    </div>
                    {expandedItems[`${planIndex}-feature-${featureIndex}`] && (
                      <div className="px-6 pb-3 text-xs text-gray-600 leading-relaxed">
                        {feature.description}
                      </div>
                    )}
                  </li>
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
            href="#corporate-hero-form"
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
