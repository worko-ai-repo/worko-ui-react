import React, { useState, useEffect, useRef, useCallback } from 'react';

function Slider({ 
    min, 
    max, 
    value, 
    onChange, 
    label 
  }: {
      min: number;
      max: number;
      value: number;
      onChange: (value: number) => void;
      label: string;
  }) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef<boolean>(false);
    
    const calculateValue = useCallback((clientX: number) => {
      if (!sliderRef.current) return value;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const position = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, position / rect.width));
      const newValue = min + percentage * (max - min);
      
      // Round to nearest integer (or can adjust precision as needed)
      return Math.round(Math.max(min, Math.min(max, newValue)));
    }, [min, max, value]);
  
    // Handler for mouse down and touch start
    const handleStart = useCallback((clientX: number) => {
      isDragging.current = true;
      const newValue = calculateValue(clientX);
      onChange(newValue);
    }, [calculateValue, onChange]);
  
    // Handler for mouse move and touch move
    const handleMove = useCallback((clientX: number) => {
      if (!isDragging.current) return;
      const newValue = calculateValue(clientX);
      onChange(newValue);
    }, [calculateValue, onChange]);
  
    // Handler for mouse up and touch end
    const handleEnd = useCallback(() => {
      isDragging.current = false;
    }, []);
  
    // Mouse event handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      handleStart(e.clientX);
      e.preventDefault(); // Prevent text selection
    }, [handleStart]);
  
    // Touch event handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX);
      }
    }, [handleStart]);
  
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    }, [handleMove]);
  
    const handleTouchEnd = useCallback(() => {
      handleEnd();
    }, [handleEnd]);
  
    // Global mouse event handlers (for dragging outside the slider)
    useEffect(() => {
      const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
      const onMouseUp = () => handleEnd();
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }, [handleMove, handleEnd]);
  
    const percentage = ((value - min) / (max - min)) * 100;
    
    return (
      <div className="h-32 w-full">
        <div className="text-2xl md:text-3xl font-bold mb-4 md:mb-8">{label}</div>
        <div 
          ref={sliderRef}
          className="relative w-full h-11 cursor-pointer"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background track */}
          <div className="absolute top-3 w-full h-2.5 bg-black rounded-full" />
          
          {/* Active track */}
          <div 
            className="absolute top-3 h-2.5 bg-blue-500 rounded-full" 
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb/handle - larger target for better touch control */}
          <div
            className="absolute top-1 h-6 w-6 bg-blue-600 rounded-full -ml-3 shadow-md"
            style={{ left: `${percentage}%` }}
          />
          
          {/* Value bubble */}
          <div 
            className="absolute -top-8 bg-blue-500 rounded-md px-3 py-1 flex items-center justify-center text-white text-xs font-bold select-none"
            style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
          >
            {value}
          </div>
          
          {/* Min/Max labels */}
          <div className="absolute top-8 left-0 text-lg md:text-xl font-bold select-none">{min}</div>
          <div className="absolute top-8 right-0 text-lg md:text-xl font-bold select-none">{max}</div>
        </div>
      </div>
    );
  }

function BudgetCard({ 
  hires, 
  salary
}: {
    hires: number;
    salary: number;
}) {
  // Calculate total hiring budget (salary * hires)
  const totalBudget = hires * salary;
    const formattedBudget =
    totalBudget < 100 
        ? `${totalBudget} L` 
        : `${(totalBudget / 100).toFixed(2)} Cr`;

    

  
  return (
    <div className="w-full sm:w-3/5 h-auto md:h-80 bg-white rounded-2xl p-6 md:p-12">
      <div className="text-xl md:text-2xl font-bold mb-2">
        Total Hiring Budget:
      </div>
      <div className="text-4xl md:text-6xl mt-8 font-extrabold text-blue-500">
        {formattedBudget}
      </div>
      <div className="text-lg text-gray-600 mt-8">
        {hires} hires × ₹{salary} LPA
      </div>
    </div>
  );
}

function RecruitmentComparisonTable({ hires, salary }: {hires:number, salary:number}) {
    // Calculate values based on hires and salary
    const calculateCosts = () => {
      return {
          worko: {
            cost: `₹${Math.round(3 * salary * 1000).toLocaleString()}`,
            timeline: `${Math.max(1, Math.round(hires * 0.1))}`,
            manHours: `${Math.round(hires* 3 * 3)} - ${Math.round(hires* 3 * 4)}`,
          },
          jobPortals: {
            cost: `₹${Math.round(2 * salary * 1000).toLocaleString()} - ₹${Math.round(3 * salary * 1000).toLocaleString()}`,
            timeline: `${Math.max(2, Math.round(hires * 0.8))}`,
            manHours: `${Math.round(hires* 8 * 4)} - ${Math.round(hires*8 * 6)}`,
          },
          linkedin: {
            cost: `₹${Math.round(2 * salary * 1000).toLocaleString()} - ₹${Math.round(3 * salary * 1000).toLocaleString()}`,
            timeline: `${Math.max(3, Math.round(hires * 0.9))} `,
            manHours: `${Math.round(hires*8 * 4)} - ${Math.round(hires*8 * 6)}`,
          },
          consulting: {
            cost: `₹${Math.round(10 * salary * 1000).toLocaleString()} - ₹${Math.round(15 * salary * 1000).toLocaleString()}`,
            timeline: `${Math.max(2, Math.round(hires * 0.7))}`,
            manHours: `${Math.round(hires* 5 * 3)} - ${Math.round(hires* 5 * 4)}`,
          }
        };
    };
  
    const costs = calculateCosts();
  
    return (
      <div className="bg-[#316BFF] p-4 rounded-lg">
        {/* Only apply overflow-x-auto on small screens (below sm breakpoint) */}
        <div className="overflow-x-auto sm:overflow-visible">
          <div className="min-w-max sm:min-w-0">
            {/* Header Row */}
            <div className="flex">
              <div className="w-52 sm:w-1/3 p-4 flex-shrink-0"></div>
              <div className="w-36 sm:w-1/6 bg-white rounded-t-lg p-4 flex-shrink-0 text-center">
                <div className="text-blue-500 text-left text-lg md:text-xl font-medium">Worko</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-lg md:text-xl font-medium">Job Portals</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-lg md:text-xl font-medium">LinkedIn</div>
              </div>
              <div className="w-52 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-lg md:text-xl font-medium">Recruitment Consulting</div>
              </div>
            </div>
            
            {/* Cost Row */}
            <div className="flex border-t border-white/30">
              <div className="w-52 sm:w-1/3 p-4 flex-shrink-0 flex items-center">
                <div className="text-white text-lg md:text-xl font-medium">Cost</div>
              </div>
              <div className="w-36 sm:w-1/6 bg-white p-4 flex-shrink-0 text-center border-l border-r border-gray-200">
                <div className="text-gray-800 text-left text-md md:text-lg">{costs.worko.cost}</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-md md:text-lg">{costs.jobPortals.cost}</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-md md:text-lg">{costs.linkedin.cost}</div>
              </div>
              <div className="w-52 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-md md:text-lg">{costs.consulting.cost}</div>
              </div>
            </div>
            
            {/* Timeline Row */}
            <div className="flex border-t border-white/30">
              <div className="w-52 sm:w-1/3 p-4 flex-shrink-0 flex items-center">
                <div className="text-white text-lg md:text-xl font-medium">Timeline</div>
                <div className="text-sm text-white ml-2">(in days)</div>
              </div>
              <div className="w-36 sm:w-1/6 bg-white p-4 flex-shrink-0 text-center border-l border-r border-gray-200">
                <div className="text-gray-800 text-left text-md md:text-lg">{costs.worko.timeline}</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-md md:text-lg">{costs.jobPortals.timeline}</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-md md:text-lg">{costs.linkedin.timeline}</div>
              </div>
              <div className="w-52 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-left text-md md:text-lg">{costs.consulting.timeline}</div>
              </div>
            </div>
            
            {/* Man Hours Row */}
            <div className="flex border-t border-white/30">
              <div className="w-52 sm:w-1/3 p-4 flex-shrink-0 flex items-center">
                <div className="text-white text-left text-lg md:text-xl font-medium">Man Hours Spent On Interview</div>
              </div>
              <div className="w-36 sm:w-1/6 bg-white rounded-b-lg p-4 flex-shrink-0 text-center border-l border-r border-gray-200">
                <div className="text-gray-800 text-left text-md md:text-lg">{costs.worko.manHours}</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-md text-left md:text-lg">{costs.jobPortals.manHours}</div>
              </div>
              <div className="w-36 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-md text-left md:text-lg">{costs.linkedin.manHours}</div>
              </div>
              <div className="w-52 sm:w-1/6 p-4 flex-shrink-0 text-center">
                <div className="text-white text-md text-left md:text-lg">{costs.consulting.manHours}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


function CorporateTable() {
  const [hires, setHires] = useState(0);
  const [salary, setSalary] = useState(0);

  return (
    <section className="w-full max-w-6xl mx-auto px-4">
      {/* Heading */}
      <h2 className="text-center text-3xl md:text-4xl font-bold text-black my-6 md:my-8">
        Calculate the Impact we will create for you
      </h2>
      
      <div className="bg-[#CFEFFF] mb-12 md:mb-24 flex flex-col items-center justify-center p-4 md:p-8 rounded-3xl">
        <div className="w-full py-4 md:py-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-8 md:mb-16">
            <div className="w-full md:w-3/5 space-y-8 md:space-y-16">
              <Slider
                min={0}
                max={500}
                value={hires}
                onChange={setHires}
                label="No of Hires per Quarter:"
              />
              <Slider
                min={0}
                max={100}
                value={salary}
                onChange={setSalary}
                label="Avg. Salary Range (In LPA):"
              />
            </div>
            
            <BudgetCard 
              hires={hires}
              salary={salary}
            />
          </div>
          
          {/* Table receives slider values */}
          <RecruitmentComparisonTable 
            hires={hires}
            salary={salary}
          />
           {/* Call to action buttons */}
            <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
                <button className="bg-blue-500 text-white rounded-md px-6 py-2 font-medium" onClick={() => window.location.href = '/for-corporate/connect-with-us'}>
                Start Efficient Hiring Now
                </button>
                {/* <button className="bg-transparent text-black border border-black rounded-md px-6 py-2 font-medium">
                Book a Demo
                </button> */}
            </div>
        </div>
      </div>
    </section>
  );
}

export default CorporateTable;