import { SectionLabel } from "@Pages/corporate/Corporate";
import { useState, useEffect, useRef } from "react";

const CorporateStepper = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = [
    {
      text: "Worko saved us 40 hours/week in resume screening. Every candidate is interview-ready.",
      name: "Rajesh Kumar",
      title: "VP Engineering",
      company: "FinTech Unicorn",
    },
    {
      text: "Candidate quality improved drastically. We now hire faster.",
      name: "Priya Sharma",
      title: "Head of HR",
      company: "E-commerce Giant",
    },
    {
      text: "Worko made hiring faster and more efficient. A game changer.",
      name: "Amit Verma",
      title: "Recruitment Lead",
      company: "Global SaaS Company",
    },
    {
      text: "Reduced hiring costs by 30% in two months with Worko.",
      name: "Sneha Reddy",
      title: "Talent Acquisition Manager",
      company: "EdTech Startup",
    },
    {
      text: "Highly recommend Worko for scaling hiring without compromising quality.",
      name: "Vikram Malhotra",
      title: "COO",
      company: "Healthcare Innovators",
    },
  ];

  const stats = [
    { value: "98%", label: "Candidate Relevance Rate", color: "text-blue-600", bg: "bg-blue-50" },
    {
      value: "80%",
      label: "Reduction in Screening Time",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    { value: "50+", label: "Companies Trust Us", color: "text-purple-600", bg: "bg-purple-50" },
    {
      value: "2 Weeks",
      label: "Average Time to Hire",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 sm:py-24">
      {/* Real Results Section */}
      <div>
        <div className="mb-14">
          <div className="text-xs uppercase tracking-[0.25em] text-[#0044FF] font-bold mb-4">
            Real results
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-zinc-950 leading-[1.05]">
            Numbers that move the
            <br />
            hiring P&amp;L.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Testimonial */}
            <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-200 p-6 sm:p-8">
              <div
              key={currentIndex}
              className="transition-opacity duration-700 ease-in-out opacity-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white text-base sm:text-lg font-bold">
                {testimonials[currentIndex].name.charAt(0)}
                </div>
                <div className="text-left">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {testimonials[currentIndex].name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {testimonials[currentIndex].title}
                </p>
                <p className="text-xs sm:text-sm text-blue-600">
                  {testimonials[currentIndex].company}
                </p>
                </div>
              </div>
              </div>
            </div>
            <figure data-testid="testimonial-quote" className="mt-8">
              <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-quote h-6 w-6 text-[#0044FF] mb-4"
              aria-hidden="true">
              <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
              <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
              </svg>
              <blockquote className="font-display text-2xl sm:text-3xl text-zinc-950 leading-snug tracking-tight">
              {testimonials[currentIndex].text}
              </blockquote>
            </figure>
            </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200">
              <div
                data-testid="metric-stat"
                className="bg-white p-8 sm:p-10 hover:bg-[#0044FF]/[0.03] transition-colors">
                <div className="font-display text-6xl sm:text-7xl font-light tracking-tightest text-[#0044FF]">
                  98%
                </div>
                <div className="mt-3 text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold">
                  candidate relevance
                </div>
              </div>
              <div
                data-testid="metric-stat"
                className="bg-white p-8 sm:p-10 hover:bg-[#0044FF]/[0.03] transition-colors">
                <div className="font-display text-6xl sm:text-7xl font-light tracking-tightest text-[#0044FF]">
                  80%
                </div>
                <div className="mt-3 text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold">
                  screening time reduction
                </div>
              </div>
              <div
                data-testid="metric-stat"
                className="bg-white p-8 sm:p-10 hover:bg-[#0044FF]/[0.03] transition-colors">
                <div className="font-display text-6xl sm:text-7xl font-light tracking-tightest text-[#0044FF]">
                  50+
                </div>
                <div className="mt-3 text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold">
                  companies trust Worko
                </div>
              </div>
              <div
                data-testid="metric-stat"
                className="bg-white p-8 sm:p-10 hover:bg-[#0044FF]/[0.03] transition-colors">
                <div className="font-display text-6xl sm:text-7xl font-light tracking-tightest text-[#0044FF]">
                  2 wks
                </div>
                <div className="mt-3 text-sm uppercase tracking-[0.2em] text-zinc-500 font-bold">
                  average time-to-hire
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-6 text-sm text-zinc-600">
              <div>
                <div className="font-display text-zinc-950 mb-1">Series A → B</div>Tech startups
                scaling teams 3×
              </div>
              <div>
                <div className="font-display text-zinc-950 mb-1">Mid-market</div>250–2,500 employees
              </div>
              <div>
                <div className="font-display text-zinc-950 mb-1">Enterprise</div>Pilot to
                platform-wide
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CorporateStepper;
