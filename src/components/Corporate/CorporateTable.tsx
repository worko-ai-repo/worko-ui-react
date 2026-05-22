import { SectionLabel } from "@Pages/corporate/Corporate";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import { Dot } from "lucide-react";
import { ChangeEvent } from "react";

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
  const workoCost = Math.round(hires * salary * 100000 * 0.05);
  const savings = traditionalCost - workoCost;
  const totalCurrentHrs = (screeningHrs + callHrs) * hires;
  const screeningReduced = Math.round(screeningHrs * hires * 0.2);
  const callsReduced = Math.round(callHrs * hires * 0.2);
  const totalWorkoHrs = screeningReduced + callsReduced;
  const hoursSaved = totalCurrentHrs - totalWorkoHrs;
  const weekSaved = Math.round(hoursSaved / 168);

  return (
    <section id="results" className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal PCName="w-fit mx-auto text-center" IsDual={false} CName="slide_up" threshold={0.1}>
          <SectionLabel text="ROI Calculator" />
          <h2 className="text-[clamp(28px,4vw,44px)] font-bold leading-[1.1] text-zinc-950">
            Calculate your hiring ROI
            <br />
            in 10 seconds.
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Adjust the sliders to see how much Worko saves your team.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Left card: sliders + savings ── */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8">
            {/* Hires slider */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-zinc-500">Hires per quarter</span>
                <span className="text-base font-semibold text-zinc-900">{hires}</span>
              </div>
              <input
                id="hires-slider"
                type="range"
                min={1}
                max={200}
                step={1}
                value={hires}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setHires(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                aria-valuenow={hires}
                aria-valuemin={1}
                aria-valuemax={200}
                aria-label="Number of Hires per Quarter"
              />
            </div>

            {/* Salary slider */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-sm text-zinc-500">Average salary (LPA)</span>
                <span className="text-base font-semibold text-zinc-900">₹{salary}L</span>
              </div>
              <input
                id="salary-slider"
                type="range"
                min={3}
                max={50}
                step={1}
                value={salary}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSalary(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                aria-valuenow={salary}
                aria-valuemin={3}
                aria-valuemax={50}
                aria-label="Average Salary in LPA"
              />
            </div>

            {/* Savings panel */}
            <div className="rounded-xl p-5 sm:p-6 mt-2" style={{ background: "#042C53" }}>
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-4"
                style={{ color: "#378ADD" }}>
                Your potential savings
              </p>
              <div className="flex justify-between items-center text-xs mb-2">
                <span style={{ color: "#85B7EB" }}>Traditional (12% of CTC)</span>
                <span className="font-medium" style={{ color: "#B5D4F4" }}>
                  {formatCurrency(traditionalCost)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs mb-4">
                <span style={{ color: "#85B7EB" }}>Worko (5% of CTC)</span>
                <span className="font-medium" style={{ color: "#B5D4F4" }}>
                  {formatCurrency(workoCost)}
                </span>
              </div>
              <div className="border-t mb-3" style={{ borderColor: "#185FA5" }} />
              <div className="flex justify-between items-baseline">
                <span className="text-sm" style={{ color: "#85B7EB" }}>
                  You save
                </span>
                <span className="text-xl font-semibold" style={{ color: "#5DCAA5" }}>
                  {formatCurrency(savings)}
                </span>
              </div>
            </div>
            {/* Hero stat */}
            <div className=" mt-2 rounded-xl bg-zinc-50 border border-zinc-200 p-4 text-center">
              <p className="text-2xl font-semibold text-zinc-900">
                {hoursSaved.toLocaleString()} hours
              </p>
              <p className="text-xs text-zinc-500 mt-1">saved per quarter</p>
              {weekSaved > 0 && (
                <p className="text-xs text-zinc-400 mt-0.5 italic">
                  That's ~{weekSaved} week{weekSaved !== 1 ? "s" : ""} of full-time work
                </p>
              )}
            </div>
          </div>

          {/* ── Right card: time breakdown ── */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-zinc-400 mb-4">
              Time savings breakdown
            </p>

            {/* Traditional */}
            <div className="rounded-xl bg-red-50 border border-red-100 p-4 mb-3">
              <p className="text-xl text-left font-semibold text-red-800 mb-2">Traditional hiring process</p>
              {[
                `${screeningHrs * hires} hrs screening resumes`,
                `${callHrs * hires} hrs on initial calls`,
                "6 weeks average to hire",
                "60% candidate drop-off",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-xl text-left text-red-700 mt-1.5">
                  <Dot color="red" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Worko */}
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 mb-4">
              <p className="text-xl text-left font-semibold text-green-800 mb-2">
                With Worko — AI + dedicated recruiters
              </p>
              {[
                `${screeningReduced} hrs reviewing qualified candidates`,
                `${callsReduced} hrs conducting interviews`,
                "~1 week average to hire",
                "~12% candidate drop-off",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-lg text-green-700 mt-1.5">
                  <Dot color="green" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CorporateTable;
