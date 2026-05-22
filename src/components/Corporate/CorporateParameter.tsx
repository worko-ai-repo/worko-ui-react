import react from "react";
import { Label } from "@headlessui/react";
import Reveal from "@Views/intersection-observer/IntersectionObs";
import {
  BrainIcon,
  BriefcaseIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

function ParametersSection() {
  const params = [
    {
      num: "01",
      icon: <BrainIcon />,
      title: "Skills Fit",
      desc: "We evaluate hard, soft and tooling skills mapped to your job description's intent — not just literal keywords.",
    },
    {
      num: "02",
      icon: <BriefcaseIcon />,
      title: "Experience Relevance",
      desc: "Industry, scale, scope and complexity are weighted to surface candidates who've solved your problem before.",
    },
    {
      num: "03",
      icon: <UsersIcon />,
      title: "Culture & Role Fit",
      desc: "Work style, autonomy, collaboration and risk tolerance — calibrated against your team's stated values.",
    },
    {
      num: "04",
      icon: <TrendingUpIcon />,
      title: "Career Progression",
      desc: "Trajectory, growth velocity and tenure patterns to predict commitment and ramp speed.",
    },
    {
      num: "05",
      icon: <MessageSquareIcon />,
      title: "Communication & Soft Skills",
      desc: "Clarity, structure and tone analysed across applications, screens and recorded responses.",
    },
  ];
  return (
    <section className="p-6 md:p-12 bg-gray-50">
      <div className="max-w-6xl mx-auto">
            <div className="text-center text-xs uppercase tracking-[0.25em] text-[#0044FF] font-bold mb-8">
                WORKO.AI GOES DEEPER
              </div>
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12 text-left">
          <Reveal needAnimation={false} IsDual CName="slide_up" SubCName="fade">
            <div className="flex-1 sm:w-[600px]">
              <h2 className="text-2xl md:text-4xl font-bold leading-tight text-gray-900">
                5 parameters of evaluation.
                <br />
                Beyond what a resume can tell you.
              </h2>
            </div>
          </Reveal>
          <Reveal needAnimation={false} IsDual CName="slide_up" SubCName="fade">
            <div className="flex items-end h-full">
              <p className="text-sm text-gray-600 leading-relaxed">
                Most tools match keywords. Worko reads context — pulling signal from work history,
                writing samples, screening responses and public profiles to build a
                multi-dimensional fit score for every applicant.
              </p>
            </div>
          </Reveal>
        </div>
        <Reveal needAnimation={false} IsDual CName="slide_up" SubCName="fade">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-center justify-items-center">
            {/* Skills Fit */}
            <div className="rounded-2xl bg-white p-7 border border-zinc-200 hover:border-[#0044FF]/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain h-6 w-6 text-[#0044FF] mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
                  <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
                  <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
                  <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
                  <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
                  <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
                  <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path>
                  <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
                  <path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
                </svg>
              </div>
              <h3 className="font-display text-xl tracking-tightest text-zinc-950 mb-2">Skills Fit</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">We evaluate hard, soft and tooling skills mapped to your job description's intent — not just literal keywords.</p>
            </div>

            {/* Experience Relevance */}
            <div className="rounded-2xl bg-white p-7 border border-zinc-200 hover:border-[#0044FF]/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase h-6 w-6 text-[#0044FF] mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                </svg>
              </div>
              <h3 className="font-display text-xl tracking-tightest text-zinc-950 mb-2">Experience Relevance</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">Industry, scale, scope and complexity are weighted to surface candidates who've solved your problem before.</p>
            </div>

            {/* Culture & Role Fit */}
            <div className="rounded-2xl bg-white p-7 border border-zinc-200 hover:border-[#0044FF]/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users h-6 w-6 text-[#0044FF] mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="font-display text-xl tracking-tightest text-zinc-950 mb-2">Culture & Role Fit</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">Work style, autonomy, collaboration and risk tolerance — calibrated against your team's stated values.</p>
            </div>

            {/* Career Progression */}
            <div className="rounded-2xl bg-white p-7 border border-zinc-200 hover:border-[#0044FF]/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up h-6 w-6 text-[#0044FF] mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>
              <h3 className="font-display text-xl tracking-tightest text-zinc-950 mb-2">Career Progression</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">Trajectory, growth velocity and tenure patterns to predict commitment and ramp speed.</p>
            </div>

            {/* Communication & Soft Skills */}
            <div className="rounded-2xl bg-white p-7 border border-zinc-200 hover:border-[#0044FF]/50 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square-text h-6 w-6 text-[#0044FF] mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="M13 8H7"></path>
                  <path d="M17 12H7"></path>
                </svg>
              </div>
              <h3 className="font-display text-xl tracking-tightest text-zinc-950 mb-2">Communication & Soft Skills</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">Clarity, structure and tone analysed across applications, screens and recorded responses.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
export default ParametersSection;
