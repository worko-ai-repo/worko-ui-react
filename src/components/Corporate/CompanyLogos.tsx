import React from "react";
import { artmease } from "@Assets";
import { cars24 } from "@Assets";
import { niit } from "@Assets";
import { nu } from "@Assets";
import { onmeta } from "@Assets";
import { rapido } from "@Assets";
import { Check } from "lucide-react";

const CompanyLogos = () => {
  const companyLogos = [
    { src: nu },
    { src: artmease },
    { src: niit },
    { src: rapido },
    { src: onmeta },
    { src: cars24 },
  ];

  return (
    <section className="flex flex-col w-full bg-[#316BFF] overflow-x-hidden py-16 items-center justify-center rounded-3xl">
      <div className="max-w-7xl  px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 items-center text-white">
        <div className="animate-slide-left text-left">
          <h2 className="text-2xl text-left sm:text-3xl md:text-4xl font-bold mb-4">Worko.ai Goes Deeper</h2>
          <p className="text-base text-left sm:text-lg mb-6 text-gray-100">
            Our AI evaluates resumes on 5 critical parameters, ensuring only true-fit candidates.
          </p>
          <button
            className="bg-white  text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-100 transition-transform hover:scale-105"
            aria-label="See How Worko.ai Works">
            See How It Works →
          </button>
        </div>
        <div className="bg-blue-500 bg-opacity-60 rounded-2xl p-6 sm:p-8 animate-slide-right">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-left sm:text-center">Our 5-Parameter Analysis:</h3>
          <ul className="space-y-3 text-gray-100 w-fit sm:mx-auto text-sm sm:text-base">
            {[
              "Skills & Technical Competency",
              "Experience Relevance & Depth",
              "Cultural & Role Fit",
              "Career Progression Pattern",
              "Communication & Soft Skills",
            ].map((item, idx) => (
              <li key={idx} className="text-left ">
                <Check className="inline w-5 h-5 mr-2  " /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CompanyLogos;
