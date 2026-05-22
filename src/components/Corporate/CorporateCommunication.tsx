import { ai_dashboard, communication_dashboard, talent_pool } from "@Assets";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { SectionLabel } from "@Pages/corporate/Corporate";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import { CheckCircle, DatabaseIcon, GitBranchIcon, MailsIcon } from "lucide-react";

// Hiring Process Section
const CorporateCommunication = () => {
  const processes = [
    {
      title: 'Smart AI Filtering: Beyond Keywords',
      text: 'Our AI understands context, evaluates transferable skills, and identifies high-potential candidates.',
      items: [
        'Semantic understanding of job requirements',
        'Cultural fit assessment based on company values',
        '98% accuracy in candidate relevance',
      ],
      img: ai_dashboard,
      alt: 'AI filtering dashboard',
      bg: 'bg-blue-50',
    },
    {
      title: 'Pre-Vetted Talent Pool Access',
      text: 'Access a database of pre-screened, high-intent candidates evaluated for skills and aspirations.',
      items: [
        'Interview Ready Candidates',
        'Communication and personality evaluations',
        'Ready-to-interview candidate pipeline',
      ],
      img: talent_pool,
      alt: 'Pre-vetted talent pool dashboard',
      bg: 'bg-green-50',
      reverse: true,
    },
    {
      title: 'End-to-End Candidate Communication',
      text: 'We handle all candidate touchpoints, ensuring no great candidate slips through.',
      items: [
        'Personalized email campaigns',
        'WhatsApp follow-ups and reminders',
        'Phone calls for high-priority candidates',
      ],
      img: communication_dashboard,
      alt: 'Candidate communication dashboard',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <section id="how" className=" px-6 py-20 md:py-24 bg-zinc-50">
      <div className="max-w-6xl mx-auto">
        <Reveal IsDual={false} PCName="flex items-center justify-center  text-center" CName="slide_up" threshold={0.1}>
          <div className="mb-14 mx-auto text-center">
            <SectionLabel text="How we transform hiring" />
            <h2 className="text-[clamp(28px,4vw,48px)] font-bold leading-[1.07] text-zinc-950 max-w-3xl">
              From a flood of applicants<br />to a shortlist worth meeting.
            </h2>
          </div>
        </Reveal>
 
        {/* Row 1 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4 ">
          <Reveal IsDual={false} PCName="flex-1 h-inherit   " CName="slide_up" threshold={0.1}>
            <div className="bg-white flex flex-col gap-6 border border-zinc-200 rounded-2xl p-9 w-full sm:!h-[480px] text-left ">
              <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#0044FF] font-bold mb-6">
                <FunnelIcon className="w-6" /> Smart AI filtering
              </div>
              <h3 className="text-[30px] font-bold text-zinc-950 leading-[1.15] mb-3 max-w-sm">Beyond keywords. Beyond CVs.</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-8">
                Our model reads JD intent, weighs context across 5 parameters and produces a ranked shortlist of who you should actually talk to.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[["Amit Kr.", 96], ["Akshay", 94], ["Kiara Sangha", 91], ["R. Adeyemi", 89]].map(([name, score], i) => (
                  <div key={i} className="flex justify-between items-center border border-zinc-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-zinc-400">0{i + 1}</span>
                      <span className="text-sm text-zinc-900">{name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#0044FF]">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
 
          <div className="flex-1 flex flex-col gap-4">
            <Reveal IsDual={false} CName="slide_up" threshold={0.1}>
              <div className="bg-zinc-950 rounded-2xl p-9 text-white h-full">
                <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-white/50 font-bold mb-10">
                  <DatabaseIcon size={14} /> Pre-vetted pool
                </div>
                <div className="text-[72px] font-bold leading-none mb-4">250k+</div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Background-screened, intent-verified candidates ready to be matched against your roles on day one.
                </p>
              </div>
            </Reveal>
            <Reveal IsDual={false} CName="slide_up" threshold={0.1}>
              <div className="bg-white border border-zinc-200 rounded-2xl p-9 h-full">
                <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#0044FF] font-bold mb-6">
                  <GitBranchIcon size={14} /> Sourcing pipeline
                </div>
                <h3 className="text-2xl font-bold text-zinc-950 leading-[1.2] mb-3">Always-on multi-channel sourcing.</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Job boards, employee referrals, niche communities and outbound — orchestrated and de-duped automatically.</p>
              </div>
            </Reveal>
          </div>
        </div>
 
        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 ">
         
 
          <Reveal IsDual={false} CName="slide_up" threshold={0.1}>
            <div className="text-left bg-white border border-zinc-200 rounded-2xl p-9 flex flex-col sm:flex-row gap-8 items-start sm:items-center h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase text-[#0044FF] font-bold mb-5">
                  <MailsIcon size={14} /> End-to-end communication
                </div>
                <h3 className="text-2xl font-bold text-zinc-950 leading-[1.2] mb-3">Every candidate, kept in the loop — automatically.</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">Personalized outreach, status updates, scheduling and rejections handled by Worko — in your voice, never robotic.</p>
              </div>
              <div className="flex !flex-row sm:flex-col gap-3 shrink-0 text-center">
                <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 min-w-[110px]">
                  <div className="text-[26px] font-bold text-zinc-950">12×</div>
                  <div className="text-[11px] text-zinc-400 mt-1">faster response</div>
                </div>
                <div className="rounded-xl bg-[#0044FF] p-4 min-w-[110px]">
                  <div className="text-[26px] font-bold text-white">100%</div>
                  <div className="text-[11px] text-white/65 mt-1">candidates updated</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default CorporateCommunication;