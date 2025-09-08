import { ChangeEvent } from "react";

// Results Section (ROI Calculator)
const formatCurrency = (num: number): string =>
  `₹${Math.abs(num).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function CorporateTable({
  hires = 10,
  setHires,
  salary = 10,
  setSalary,
}: {
  hires: number;
  setHires: (value: number) => void;
  salary: number;
  setSalary: (value: number) => void;
}) {
  const screeningHrs = 20;
  const callHrs = 8;
  const traditionalCost = Math.round(hires * salary * 100000 * 0.12);
  const workoCost = Math.round(hires * salary * 100000 * 0.02);
  const savings = traditionalCost - workoCost;
  const totalCurrentHrs = (screeningHrs + callHrs) * hires;
  const screeningReduced = Math.round(screeningHrs * hires * 0.2);
  const callsReduced = Math.round(callHrs * hires * 0.2);
  const totalWorkoHrs = screeningReduced + callsReduced;
  const hoursSaved = totalCurrentHrs - totalWorkoHrs;
  const weekSaved = Math.round(hoursSaved / 168);

  return (
    <section id="results" className="py-12 sm:py-16 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          Calculate Your Hiring ROI
        </h2>
        <p className="text-gray-600 text-center mb-8 text-sm sm:text-base">
          See how much time and money Worko.ai saves your company
        </p>
        <div className="bg-white rounded-xl shadow p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mt-8">
          {/* Sliders */}
          <div className="animate-slide-up">
            <label className="font-medium text-sm sm:text-base" htmlFor="hires-slider">
              Number of Hires per Quarter: {hires}
            </label>
            <input
              id="hires-slider"
              type="range"
              min={1}
              max={200}
              value={hires}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHires(Number(e.target.value))}
              className="w-full my-4 sm:my-5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-valuenow={hires}
              aria-valuemin={1}
              aria-valuemax={200}
              aria-label="Number of Hires per Quarter"
            />
            <label className="font-medium text-sm sm:text-base" htmlFor="salary-slider">
              Average Salary (LPA): ₹{salary}
            </label>
            <input
              id="salary-slider"
              type="range"
              min={3}
              max={50}
              value={salary}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSalary(Number(e.target.value))}
              className="w-full my-4 sm:my-5 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-valuenow={salary}
              aria-valuemin={3}
              aria-valuemax={50}
              aria-label="Average Salary in LPA"
            />
            <div className="bg-blue-600 text-white rounded-lg p-4 sm:p-6 mt-6 sm:mt-10">
              <h3 className="font-semibold mb-4 text-sm sm:text-base">
                Your Potential Savings with Worko
              </h3>
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span>Traditional Hiring Cost (12% of CTC):</span>
                <span className="font-bold">{formatCurrency(traditionalCost)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm mb-4">
                <span>Worko Cost (2% of CTC):</span>
                <span className="font-bold">{formatCurrency(workoCost)}</span>
              </div>
              <hr className="border-blue-400 mb-3" />
              <div className="flex justify-between text-sm sm:text-lg font-bold">
                <span>You Save:</span>
                <span className="text-green-400">{formatCurrency(savings)}</span>
              </div>
            </div>
          </div>
          {/* Time Savings */}
          <div className="animate-slide-up">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Time Savings Breakdown</h3>
            <div className="bg-red-100 p-3 rounded mb-3">
              <p className="text-left font-semibold text-sm">Current Process</p>
              <ul className="text-left list-disc ml-5 text-xs sm:text-sm">
                <li>{screeningHrs * hires} hrs screening resumes</li>
                <li>{callHrs * hires} hrs conducting initial calls</li>
                <li>6 weeks average time to hire</li>
                <li>60% candidate drop-off rate</li>
              </ul>
            </div>
            <div className="bg-green-100 p-3 rounded mb-3">
              <p className="text-left font-semibold text-sm">With Worko.ai (80% less effort)</p>
              <ul className="text-left  list-disc ml-5 text-xs sm:text-sm">
                <li>{screeningReduced} hrs reviewing qualified candidates</li>
                <li>{callsReduced} hrs conducting interviews</li>
                <li>~1 week average time to hire</li>
                <li>~12% candidate drop-off rate</li>
              </ul>
            </div>
            <div className="bg-yellow-100 p-4 rounded text-center">
              <p className="text-lg sm:text-xl font-bold">{hoursSaved} hours</p>
              <p className="text-xs sm:text-sm">Saved per quarter</p>
              <p className="text-xs sm:text-sm">That's {weekSaved} weeks of full-time work!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default CorporateTable;
