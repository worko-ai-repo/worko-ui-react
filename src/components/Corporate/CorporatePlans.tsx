import { SectionLabel } from "@Pages/corporate/Corporate";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import { ArrowUpRightIcon, MessageCircleIcon } from "lucide-react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

function CorporatePlans() {
  // Track only one open item per plan: key = `${planIndex}-${itemKey}`
  const [openItem, setOpenItem] = useState<Record<number, string | null>>({});

  const toggleExpand = (planIndex: number, itemKey: string) => {
    setOpenItem(prev => ({
      ...prev,
      [planIndex]: prev[planIndex] === itemKey ? null : itemKey,
    }));
  };

  const isOpen = (planIndex: number, itemKey: string) =>
    openItem[planIndex] === itemKey;

  const plans = [
    {
      title: 'ATS Only',
      price: '₹2,500',
      desc: '/ recruiter / month',
      subdesc: '+ ₹500 / evaluator / month',
      suitableFor:
        'Best for teams with in-house recruiters who need a smarter hiring system with AI-powered sourcing and full pipeline visibility.',
      features: [
        {
          name: 'Intelligent ATS Platform',
          description:
            'End-to-end hiring management in one system — from job posting to offer rollout. Scheduling, feedback tracking, candidate documents and offer letters all built in. One system. Zero fragmentation.',
        },
        {
          name: 'ATLAS AI — Internal Database Activation',
          description:
            'Our AI engine (ATLAS) re-activates your existing candidate pool, surfaces and ranks best-fit profiles — reducing the cost of constant fresh sourcing. Faster shortlisting, better accuracy.',
        },
        {
          name: 'Interview Scheduling & Feedback Tracking',
          description:
            'We manage all scheduling logistics — reminders, rescheduling, and centralised feedback collection. Your team focuses on the interview, not the calendar.',
        },
        {
          name: 'Complete Visibility & Analytics',
          description:
            'One live dashboard for HR, hiring managers and founders. Stage-wise pipeline for every open role. Real-time view of all roles, candidates and pipeline stages.',
        },
        {
          name: 'Vendor Management — All Agencies, One Platform',
          description:
            'Consolidate every recruitment agency centrally. Track submissions and performance across all vendors. Eliminate duplication and fragmented communication.',
        },
        {
          name: 'Priority Support',
          description:
            'Dedicated customer success team available via email and chat during business hours. Onboarding, job posting optimisation, and ongoing platform guidance.',
        },
      ],
      button: 'Get Started',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonLink: `${import.meta.env.APP_WORKO_BASE_URL}/corporate/connect-with-us?plan=ATS%20Only`,
      popular: false,
    },
    {
      title: 'Sourcing Only',
      price: '₹20,000',
      desc: '/ role',
      subdesc: '+ ₹10,000 for coordination',
      suitableFor:
        'A flexible sourcing solution for teams needing high-quality, role-specific talent delivered fast — without a long-term commitment.',
      features: [
        {
          name: 'Up to 15 Vetted Profiles per Role',
          description:
            'Receive up to 15 thoroughly vetted, high-fit candidate profiles per role. Every profile is screened for relevance, quality, and alignment to your requirements.',
        },
        {
          name: 'End-to-End Sourcing & Shortlisting',
          description:
            'Worko handles all sourcing, screening, and shortlisting. You receive a refined shortlist — ready to interview.',
        },
        {
          name: 'Continuous Profile Refinement',
          description:
            "Profiles are continuously refined based on your feedback, ensuring every iteration is better aligned with what you're looking for.",
        },
        {
          name: 'Fast Turnaround',
          description:
            'Strong focus on speed and quality. Get your first batch of profiles quickly with a process designed to minimise time-to-shortlist.',
        },
      ],
      button: 'Get Started',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonLink: `${import.meta.env.APP_WORKO_BASE_URL}/corporate/connect-with-us?plan=Sourcing%20Only`,
      popular: false,
    },
    {
      title: 'Hiring Co-Pilot',
      price: '5%',
      desc: 'of CTC',
      subdesc: '+ ₹50K monthly retainer',
      suitableFor:
        'For growing teams needing dedicated recruitment support alongside platform access — consistent pipeline, faster closures, structured execution.',
      features: [
        {
          name: 'Dedicated Worko Recruiter',
          description:
            'A dedicated recruiter drives end-to-end hiring exclusively for your account — understanding your culture, roles, and hiring bar.',
        },
        {
          name: 'Consistent Pipeline Creation',
          description:
            'Proactive pipeline creation ensures you always have strong candidates in flow. No gaps, no waiting for sourcing to restart.',
        },
        {
          name: 'Structured Execution — Sourcing to Offer',
          description:
            'Full structured hiring process: sourcing, screening, interview coordination, offer rollout and joining support.',
        },
        {
          name: 'Free ATS Access (up to 2 users)',
          description:
            "Complimentary access to Worko's intelligent ATS platform for up to 2 users, giving your team full pipeline visibility at no extra cost.",
        },
        {
          name: '60-Day Replacement Guarantee',
          description:
            'If a hired candidate leaves within 60 days, we provide a replacement at no additional cost.',
        },
        {
          name: 'Senior Account Manager',
          description:
            'Dedicated senior account manager with 5+ years recruitment experience, providing strategic hiring advice and weekly progress reviews.',
        },
        {
          name: '500 Free AI Screening Credits',
          description:
            'Process up to 500 candidate profiles monthly with our AI screening at no extra cost, saving significant time on initial evaluation.',
        },
      ],
      button: 'Get Started',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonLink: `${import.meta.env.APP_WORKO_BASE_URL}/corporate/connect-with-us?plan=Co-Pilot`,
      popular: true,
    },
    {
      title: 'Full Recruitment',
      price: '8.33% – 12%',
      desc: 'of CTC',
      subdesc: 'Full ownership from sourcing to joining',
      suitableFor:
        'For organisations that want a complete recruitment partnership — full ownership, strong execution, and faster closures across all open roles.',
      features: [
        {
          name: 'Full Ownership — Sourcing to Joining',
          description:
            'Worko owns the entire hiring process end to end — sourcing, screening, interview coordination, offer negotiation, and onboarding support.',
        },
        {
          name: 'Dedicated Recruitment Team',
          description:
            'A specialised team of recruiters assigned exclusively to your account, understanding your company culture and specific hiring needs.',
        },
        {
          name: 'Executive Search Capabilities',
          description:
            'Specialised search for C-level, VP, and senior management positions with access to passive candidates and executive networks.',
        },
        {
          name: '90-Day Replacement Guarantee',
          description:
            "Extended 90-day guarantee for senior and executive roles. If the hired candidate doesn't work out, we provide a replacement with enhanced vetting.",
        },
        {
          name: 'Strong Candidate Engagement',
          description:
            'Proactive candidate communication at every stage — reducing offer drop-offs, ghosting, and no-shows at joining.',
        },
        {
          name: '500 Free AI Screening Credits',
          description:
            'Monthly allocation of 500 AI screening credits for high-volume positions, with detailed candidate scoring and ranking reports.',
        },
        {
          name: 'Senior Account Manager',
          description:
            'Dedicated senior account manager providing strategic hiring advice and weekly progress reviews.',
        },
      ],
      button: 'Get Started',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonLink: `${import.meta.env.APP_WORKO_BASE_URL}/corporate/connect-with-us?plan=Full%20Recruitment`,
      popular: false,
    },
  ];

  // On mount, open the "suitable" section for each plan by default
  useEffect(() => {
    const initial: Record<number, string | null> = {};
    plans.forEach((_, index) => {
      initial[index] = 'suitable';
    });
    setOpenItem(initial);
  }, []);

  return (
    <section id="pricing" className="bg-white py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <SectionLabel text="Pricing" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Simple, Transparent Pricing</h2>
        <p className="text-gray-600 mb-8 sm:mb-12 text-sm sm:text-base">
          Pay only when you hire. No upfront costs, no hidden fees.
        </p>

        {/* Grid: 2 cols on md, 4 cols on xl. Popular card stretches via self-stretch + min-h */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {plans.map((plan, planIndex) => (
            <div
              key={planIndex}
              className={`border rounded-xl p-4 sm:p-6 shadow transition-all duration-200 hover:shadow-xl hover:scale-[1.03] relative flex flex-col
                ${plan.popular
                  ? 'border-2 border-blue-600 bg-blue-50/30'
                  : 'border-gray-200'
                }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 text-xs sm:text-sm rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              )}

              {/* Plan title & price */}
              <div className="mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-1">{plan.title}</h3>
                <p className="text-sm sm:text-base">
                  <span className="text-blue-600 font-bold text-lg sm:text-xl">{plan.price}</span>{' '}
                  <span className="text-gray-600">{plan.desc}</span>
                </p>
                {plan.subdesc && (
                  <p className="text-xs text-gray-500 mt-0.5">{plan.subdesc}</p>
                )}
              </div>

              {/* Suitable For */}
              <div className="mb-3">
                <button
                  className="w-full flex items-center justify-between gap-2 py-2 px-2 rounded hover:bg-gray-50 text-left"
                  onClick={() => toggleExpand(planIndex, 'suitable')}
                >
                  <span className="text-sm font-bold text-gray-800">Suitable for:</span>
                  {isOpen(planIndex, 'suitable')
                    ? <ChevronUp className="text-gray-400 flex-shrink-0 w-4 h-4" />
                    : <ChevronDown className="text-gray-400 flex-shrink-0 w-4 h-4" />}
                </button>
                {isOpen(planIndex, 'suitable') && (
                  <div className="px-2 pt-1 text-xs text-gray-700 text-left leading-relaxed">
                    {plan.suitableFor}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="text-left space-y-1 mb-5 flex-1">
                {plan.features.map((feature, featureIndex) => {
                  const key = `feature-${featureIndex}`;
                  return (
                    <li key={featureIndex} className="border-b border-gray-100 last:border-b-0">
                      <button
                        className="w-full flex items-center justify-between gap-2 py-2 px-2 rounded hover:bg-gray-50 text-left"
                        onClick={() => toggleExpand(planIndex, key)}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-green-500 flex-shrink-0">✓</span>
                          <span className="text-xs sm:text-sm">{feature.name}</span>
                        </div>
                        {isOpen(planIndex, key)
                          ? <ChevronUp className="text-gray-400 flex-shrink-0 w-4 h-4" />
                          : <ChevronDown className="text-gray-400 flex-shrink-0 w-4 h-4" />}
                      </button>
                      {isOpen(planIndex, key) && (
                        <div className="px-6 pb-3 text-xs text-gray-600 leading-relaxed">
                          {feature.description}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <a
                href={plan.buttonLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full ${plan.buttonStyle} py-2.5 rounded-lg text-sm font-semibold transition-colors inline-block text-center mt-auto`}
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
    <section className="px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <Reveal IsDual={false} CName="scale_up" threshold={0.1}>
          <div className="bg-[#0044FF] rounded-3xl px-8 py-20 text-center relative overflow-hidden">
            {/* Grid overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(white 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            <div className="relative">
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/60 font-bold mb-5">
                Ready when you are
              </p>
              <h2 className="text-[clamp(34px,5vw,60px)] font-bold text-white leading-[1.05] mb-4">
                Stop wasting time on<br />irrelevant resumes.
              </h2>
              <p className="text-[17px] text-white/75 max-w-md mx-auto mb-10">
                Get your first 10–15 interview-ready candidates in under two weeks. No long contracts.
              </p>
              <div className="flex justify-center flex-wrap gap-4">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 bg-white text-[#0044FF] px-8 py-3.5 rounded-full text-base font-bold no-underline hover:bg-zinc-100 transition-colors"
                >
                  Book a demo <ArrowUpRightIcon size={16} />
                </a>
                <a
                  href="https://wa.me/+918349484365"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-white/35 text-white px-8 py-3.5 rounded-full text-base font-semibold no-underline hover:bg-white/10 transition-colors"
                >
                  <MessageCircleIcon size={18} /> Chat with the team
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}