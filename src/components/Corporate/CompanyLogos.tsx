import React from 'react';
import { artmease } from '@Assets';
import { cars24 } from '@Assets';
import { niit } from '@Assets';
import { nu } from '@Assets';
import { onmeta } from '@Assets';
import { rapido } from '@Assets';

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
    <section className="flex flex-col w-full bg-[#316BFF] overflow-x-auto py-16 items-center justify-center rounded-3xl">
      {/* Added Trusted Partners heading */}
      <h2 className="text-white text-3xl font-semibold mb-12 text-center">
        Trusted Partners
      </h2>
      
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-12 min-w-max px-4 pb-16">
        {companyLogos.map((logo, index) => (
          <div key={index} className="flex items-center justify-center">
            <img
              src={logo.src}
              alt={`Company logo ${index + 1}`}
              className="h-auto max-h-12 w-auto object-contain"
            />
          </div>
        ))}
        <div className="flex items-center justify-center bg-blue-500 rounded-lg p-2 h-8">
          <div className="text-white text-xs font-medium text-center leading-tight">
            <span>20+</span>
            <br />
            <span>more</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyLogos;