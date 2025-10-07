import { document, lightening, shield, time } from "@Assets";
import { AlertCircle, ArrowRight, Gift, IndianRupee, Infinity, LucideCircleDollarSign, Search, XCircle } from "lucide-react";
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
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Why Choose <span className="text-blue-500">Worko</span> Over Others?
        </h2>
        <p className="w-[80%] mx-auto mt-2 sm:mt-3 text-base sm:text-lg text-gray-600">
          We're not just another hiring platform. Here's what makes us the smart choice for modern
          companies.
        </p>
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: <Gift className="w-6 h-6 text-white" />,
              title: "Free ATS Included",
              text: "Get a complete Applicant Tracking System at no extra cost. Manage your entire hiring pipeline seamlessly with advanced features.",
              subText: "₹0 Setup cost",
              border: "border-green-400",
              bg: "bg-green-500",
              color: "text-green-500",
            },
            {
              icon: <IndianRupee className="text-white w-6 h-6" />,
              title: "Only 2% of CTC",
              text: "Pay only when you hire. No upfront costs, no hidden fees. Just 2% of the candidate's annual package upon successful placement.",
              subText: "Success based pricing",
              border: "border-blue-400",
              bg: "bg-blue-500",
              color: "text-blue-500",
            },
            {
              icon: <Infinity className="text-white w-6 h-6" />,
              title: "Unlimited Job Posts",
              text: "Post as many jobs as you need. No limits, no restrictions. Scale your hiring without worrying about additional posting costs.",
              subText: "No Posting Limits",
              border: "border-purple-400",
              bg: "bg-purple-500",
              color: "text-purple-500",
            },
          ].map((card, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border shadow-lg text-center p-6 sm:p-6 transition-transform hover:scale-105`}>
              <div
                className={`w-12 h-12 flex items-center mx-auto justify-center rounded-full ${card.bg} mb-4 sm:mb-6`}>
                {card.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{card.text}</p>
              <div className={`mt-4 inline-block px-3 py-1 text-sm font-medium rounded-full ${card.border} ${card.color} bg-white/30`}>
                {card.subText} <ArrowRight className="inline-block w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CorporateCardsSection;
