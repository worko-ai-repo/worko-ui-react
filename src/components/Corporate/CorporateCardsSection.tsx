import { document, lightening, shield, time } from "@Assets";
import { AlertCircle, Search, XCircle } from "lucide-react";
import React from "react";

const CorporateCardsSection = () => {
  const features = [
    {
      title: "Get verified results ",
      description: "With 98% accuracy, every match you get will be backed by hard data.",
      svg: <img src={shield} />,
    },
    {
      title: "Refine your matches",
      description: "Worko learns from your feedback and gets smarter with every hire.",
      svg: <img src={document} />,
    },
    {
      title: "Hire through referrals",
      description: "Tap into your employees’ referrals to find culturally-fit people.",
      svg: <img src={lightening} />,
    },
    {
      title: "Save time and effort",
      description: "Cut hiring time from 23 hours to just 6 hours without affecting quality.",
      svg: <img src={time} />,
    },
  ];

  return (
    <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          The ATS Trap: Why Keywords Kill Great Hires
        </h2>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600">
          Most companies think an ATS solves screening problems. Here&apos;s the reality.
        </p>
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: <AlertCircle className="w-6 h-6" />,
              title: "ATS = Keyword Filters",
              text: "Traditional ATS systems only match keywords, missing candidates with nuanced experience.",
              border: "border-red-400",
              bg: "bg-red-50",
              color: "text-red-500",
            },
            {
              icon: <Search className="w-6 h-6" />,
              title: "Real Talent = Nuanced Experience",
              text: "Top 5% candidates have diverse skills that keyword matching misses.",
              border: "border-orange-400",
              bg: "bg-orange-50",
              color: "text-orange-500",
            },
            {
              icon: <XCircle className="w-6 h-6" />,
              title: "Result = Best Talent Rejected",
              text: "Perfect candidates get filtered out due to non-matching keywords.",
              border: "border-red-400",
              bg: "bg-red-50",
              color: "text-red-500",
            },
          ].map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border-l-4 ${card.border} p-6 sm:p-8 text-left transition-transform hover:scale-105`}>
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full ${card.bg} ${card.color} mb-4 sm:mb-6`}>
                {card.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CorporateCardsSection;
