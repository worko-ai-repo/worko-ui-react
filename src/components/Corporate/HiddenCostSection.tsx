import { Label } from "@headlessui/react";
import { CheckIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { SectionLabel } from "@Pages/corporate/Corporate";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import { Check, ScrollText } from "lucide-react";

export function HiddenCostSection() {
  const withoutWorko = [
    "1,000+ irrelevant resumes per role",
    "30+ hours of manual screening per hire",
    "60-day average time-to-hire",
    "Only 2–3% of resumes are interview-ready",
    "Recruiters burn out, quality drops",
  ];
  const withWorko = [
    "10–15 pre-qualified, interview-ready candidates",
    "Under 2 hours of screening per hire",
    "2-week average time-to-hire",
    "98% candidate-to-role relevance",
    "Recruiters focus on offers, not triage",
  ];
 
  return (
    <section className="px-6 py-20 md:py-24 bg-white">
      <div className="  max-w-5xl mx-auto flex flex-col items-center gap-12">
        <Reveal IsDual={false} CName="slide_up" threshold={0.1}>
          <div className="mb-14 text-center items-center gap-6 mx-auto">
            <SectionLabel text="The hidden cost" />
            <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-[1.07] text-zinc-950">
              Traditional hiring is bleeding<br />your team — quietly.
            </h2>
          </div>
        </Reveal>
 
        <div className="gap-0 border border-zinc-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <Reveal PCName="!w-full border-b md:border-b-0 md:border-r border-zinc-200 !m-0 " IsDual={false} CName="slide_up" threshold={0.1}>
            <div className="!min-w-max !m-0 p-9">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-zinc-300 inline-block" />
                <span className="text-[11px] tracking-[0.15em] uppercase text-zinc-400">Today</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-950 mb-6">Hiring without Worko</h3>
              <div className="flex flex-col gap-3.5">
                {withoutWorko.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <XCircleIcon  className="w-6 rounded-full text-zinc-300 mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-500 mt-0.5 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
              
          <Reveal IsDual={false} CName="slide_up" threshold={0.1}>
            <div className="p-9 bg-[#F0F4FF]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0044FF] inline-block" />
                  <span className="text-[11px] tracking-[0.15em] uppercase text-zinc-400">Tomorrow</span>
                </div>
                <span className="text-[11px] tracking-[0.12em] uppercase text-[#0044FF] font-bold">With Worko →</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-950 mb-6">Hiring with smart filtering</h3>
              <div className="flex flex-col gap-3.5">
                {withWorko.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckIcon  className="w-6 rounded-full text-[#0044FF] mt-0.5 shrink-0" />
                    <span className="text-sm text-zinc-600 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
