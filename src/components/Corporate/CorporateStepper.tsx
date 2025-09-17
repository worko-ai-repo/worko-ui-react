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
    <section className="py-12 sm:py-16 border-t bg-white text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Real Results from Real Companies
      </h2>
      <p className="mt-2 text-gray-600 text-sm sm:text-base">
        See how companies transformed hiring
      </p>
      <div className="mt-8 sm:mt-10 flex justify-center">
        <div className="relative max-w-4xl w-full border rounded-3xl shadow-md px-4 sm:px-8 py-10 sm:py-12 bg-white min-h-[200px] sm:min-h-[250px]">
          <div
            key={currentIndex}
            className="transition-opacity duration-700 ease-in-out opacity-100">
            <p className="text-base sm:text-lg italic text-gray-700">
              "{testimonials[currentIndex].text}"
            </p>
            <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3">
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
      </div>
      <section className="py-12 sm:py-16 bg-white text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bg} rounded-xl shadow-sm p-4 sm:p-6 text-center transition-transform hover:scale-105`}>
              <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-2 text-gray-700 text-xs sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default CorporateStepper;
