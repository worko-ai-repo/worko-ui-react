import { useState } from 'react';
import { faqData } from './faqData';

const FAQ = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('employee');

  const toggleQuestion = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="w-full bg-white px-4 pt-8 md:pt-16 xl:pt-36" style={{ fontFamily: 'Poppins' }}>
      <h1 
        className="text-center mb-16 md:mb-16 w-full px-4 text-[30px] md:text-[62px] font-semibold leading-tight md:leading-[48.344px] text-[#316BFF]"
      >
        Frequently Asked Questions
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6 md:mb-12 px-4">
          <div className="flex max-w-[271px] w-[201px] md:w-[270px] text-[13px] font-normal">
            <button
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-l-lg border transition-colors leading-[150%]
                ${activeTab === 'employee' 
                  ? 'bg-[rgba(53,117,226,0.2)] border-[#316BFF] text-[#316BFF]' 
                  : 'bg-white border-[rgba(0,0,0,0.1)] text-black'}`}
              onClick={() => setActiveTab('employee')}
              style={{ 
                marginRight: activeTab === 'candidates' ? '-1px' : '0'
              }}
            >
              Employee
            </button>
            <button
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-r-lg border transition-colors leading-[150%]
                ${activeTab === 'candidates' 
                  ? 'bg-[rgba(53,117,226,0.2)] border-[#316BFF] text-[#316BFF] font-medium' 
                  : 'bg-white border-[rgba(0,0,0,0.1)] text-black'}`}
              onClick={() => setActiveTab('candidates')}
            >
              Candidates
            </button>
          </div>
        </div>

        <div className="space-y-4 mt-8 max-w-[800px] mx-auto px-4">
          {faqData.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#F2F4F5] overflow-hidden"
            >
              <button
                className="w-full px-4 md:px-6 py-4 flex justify-between items-center text-left"
                onClick={() => toggleQuestion(item.id)}
              >
                <span className="text-black text-[14px] md:text-[17.1px] font-normal leading-normal md:leading-[25.512px] pr-4">
                  {item.question}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                <path d="M1.3674 5.75H12.6243C13.403 5.75 13.7924 6.33789 13.2411 6.68242L7.6149 10.2016C7.27365 10.4148 6.71802 10.4148 6.37677 10.2016L0.750523 6.68242C0.199273 6.33789 0.588648 5.75 1.3674 5.75Z" fill="black"/>
                </svg>
              </button>
              {activeId === item.id && (
                <div className="px-4 md:px-6 pb-4">
                  <p className="text-black text-[14px] md:text-[17.1px] font-normal leading-normal md:leading-[25.512px]">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center my-12 md:mt-36 px-4">
            <p className="text-black mb-4 text-[26.1px] font-extrabold leading-normal md:leading-[25.512px]">
                Still have a question?
            </p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2 mt-1">
                <a href="#" className="text-[#316BFF] text-[15.3px] md:text-[17.1px] hover:text-blue-600 font-normal">
                Contact our support team!
                </a>
                <p className="text-black text-[15.3px] md:text-[17.1px] font-normal leading-normal md:leading-[25.512px]">
                We'll be happy to help you.
                </p>
            </div>
        </div>


      </div>
    </div>
  );
};

export default FAQ;