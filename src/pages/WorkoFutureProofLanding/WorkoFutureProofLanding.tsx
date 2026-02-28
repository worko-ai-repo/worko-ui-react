import React, { useEffect, useState } from "react";
import {
  Upload,
  Link as LinkIcon,
  ArrowRight,
  Shield,
  BarChart,
  Zap,
} from "lucide-react";
import { useForm } from "react-hook-form";

const WorkoFutureProofLanding: React.FC = () => {
  const { register, handleSubmit, watch, clearErrors,setValue, setError, formState: { errors } } = useForm();
  const linkedinValue = watch("linkedin");
  const resumeValue = watch("resume");
  const [loading, setLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [response,setResponse] = useState(false)
  const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/;

  const linkedinMessages = [
    "Scanning your LinkedIn profile...",
    "Extracting your career history...",
    "Analyzing your job titles for existential risk...",
    "Measuring how replaceable your responsibilities look...",
    "Checking your endorsements (even the fake ones)...",
    "Estimating your long-term survival probability...",
    "Comparing your skills to AI automation trends...",
    "Finalizing your Career Threat Score..."
  ];
  const resumeMessages = [
    "Uploading and reading your resume...",
    "Parsing your experience from top to bottom...",
    "Detecting transferable skills (if any)...",
    "Checking your buzzword-to-skill ratio...",
    "Analyzing roles vulnerable to automation...",
    "Mapping your competencies against AI models...",
    "Ranking your future-proof abilities...",
    "Finalizing your Career Threat Score..."
  ];

  const onSubmit = (data: any) => {
    const { linkedin, resume } = data;

    const hasResume = resume && resume.length > 0;
    const hasLinkedin = linkedin && linkedin.trim() !== "";

    clearErrors();

    if (!hasLinkedin && !hasResume) {
      setError("linkedin", {
        type: "manual",
        message: "Please provide a LinkedIn profile or upload a resume.",
      });
      return;
    }

    if (hasLinkedin && !linkedinRegex.test(linkedin.trim())) {
      setError("linkedin", {
        type: "manual",
        message: "Please enter a valid LinkedIn profile URL.",
      });
      return;
    }

    console.log("Form data:", data);
    setIsParsing(true);
    setCurrentMessageIndex(0);
    setProgress(5);

    setTimeout(() => {
      setIsParsing(false)
      setResponse(true)
    }, 3000);
  };

  useEffect(() => {
  if (!isParsing) return;

  const activeMessages =
    resumeValue && resumeValue.length > 0
      ? resumeMessages
      : linkedinMessages;

  const messageInterval = setInterval(() => {
    setCurrentMessageIndex((prev) =>
      prev < activeMessages.length - 1 ? prev + 1 : prev
    );
  }, 3000);

  const progressInterval = setInterval(() => {
    setProgress((prev) => (prev < 90 ? prev + 5 : prev));
  }, 500);

  return () => {
    clearInterval(messageInterval);
    clearInterval(progressInterval);
  };
}, [isParsing]);

  const isDisabled = loading || (!linkedinValue && (!resumeValue || resumeValue.length === 0));
    return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-blue-50 to-slate-100 text-slate-900 flex flex-col">
            
      {/* STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-blue-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="text-xl font-semibold">Worko FutureProof</div>
          <button className="text-sm bg-gradient-to-r from-blue-500 to-blue-400 text-white px-4 py-2 rounded-lg font-medium">
            Get Your Score
          </button>
        </div>
      </nav>

    {!response 
    ?(<>
        {/* HERO + INPUT */}
        <section className="flex flex-col items-center justify-center px-6 pt-12">

          <h1 className="text-5xl font-bold text-center leading-tight mb-4">
            Can AI Replace{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3A8A] to-[#0EA5E9]">
              You?
            </span>
          </h1>

          <p className="text-md text-slate-700 text-center max-w-xl mx-auto">
            Some careers will evolve. Some will evaporate.
          </p>

          <p className="text-xs text-slate-500 text-center mt-2 mb-8">
            Our AI predicts your probability of professional extinction.<br />
            <span className="text-slate-600">
              Brutally honest. Mildly traumatic. Surprisingly useful.
            </span>
          </p>

          {/* INPUT CARD */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 max-w-2xl w-full"
          >
            <p className="text-sm text-slate-600 text-center mb-3">
              Paste your LinkedIn or upload your CV.
            </p>

            <div className="flex items-center gap-2 mb-1">
            <div className="w-full">
              <div
                className={`flex items-center gap-3 border rounded-xl px-4 bg-blue-50 h-[48px]
                ${errors.linkedin ? "border-red-500 bg-red-50" : "border-blue-100"}`}
              >
                <LinkIcon
                  className={`w-5 h-5 ${
                    errors.linkedin ? "text-red-500" : "text-[#1E3A8A]"
                  }`}
                />
            <input
              {...register("linkedin")}
              placeholder="linkedin.com/in/your-profile"
              className="placeholder:text-sm w-full text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none focus:ring-0"
              onBlur={(e) => {
                const value = e.target.value.trim();

                if (linkedinRegex.test(value)) {
                  setValue("resume", []); // instead of null
                  clearErrors("linkedin");
                }
              }}
            />
              </div>
            </div>

              <label className="flex items-center justify-center h-[48px] px-4 rounded-xl border border-blue-100 bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
                <Upload className="w-5 h-5 text-[#1E3A8A]" />
                <input
                  type="file"
                  className="hidden"
                  {...register("resume", {
                    onChange: (e) => {
                      const file = e.target.files;

                      if (file && file.length > 0) {
                        setValue("linkedin", "");
                        clearErrors("linkedin");
                      }
                    },
                  })}
                />
              </label>
            </div>
            <div>
              {errors.linkedin && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.linkedin.message as string}
                </p>
              )}
              {resumeValue && resumeValue.length > 0 && (
                <p className="text-blue-600 text-xs mt-1 font-medium">
                  {resumeValue[0].name}
                </p>
              )}
            </div>

          {isParsing && (
            <div className="mt-4 w-full max-w-md mx-auto">
              <p className="text-sm text-blue-600 font-medium text-center mb-2 transition-all duration-300">
                {
                  (resumeValue && resumeValue.length > 0
                    ? resumeMessages
                    : linkedinMessages)[currentMessageIndex]
                }
              </p>

              {/* Animated Looping Progress Bar */}
              <div className="max-w-sm bg-blue-100 rounded-full h-2 overflow-hidden relative m-auto">
                <div className="loading-bar absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
              </div>

              {/* Local CSS for animation */}
              <style>
                {`
                  @keyframes loadingBar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  .loading-bar {
                    animation: loadingBar 5s linear infinite;
                  }
                `}
              </style>
            </div>
          )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isDisabled}
                className={`
                  bg-gradient-to-r from-blue-500 to-blue-400 text-white py-3 rounded-xl
                  font-medium flex items-center justify-center gap-2 transition mt-4 text-sm px-6
                  ${isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90 cursor-pointer"}
                `}
              >
                {loading ? "Fetching..." : "TELL ME HOW DOOMED I AM"}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">
              +2,847 professionals already stress-tested
            </p>
          </form>
        </section>

        {/* FEATURE SECTION */}
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-slate-500 tracking-widest mb-10">
            HOW IT WORKS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

            <div className="flex flex-col items-center text-center border border-blue-100 bg-white shadow-md rounded-xl p-3">
              <Shield className="w-8 h-8 text-[#1E3A8A] mb-4" />
              <h3 className="font-semibold text-slate-900 mb-1">
                01 — Share your LinkedIn or CV
              </h3>
              <p className="text-xs text-slate-600">
                We analyze your experience, skills, and career trajectory.
              </p>
            </div>

            <div className="flex flex-col items-center text-center border border-blue-100 bg-white shadow-md rounded-xl p-3">
              <BarChart className="w-8 h-8 text-[#1E3A8A] mb-4" />
              <h3 className="font-semibold text-slate-900 mb-1">
                02 — AI reads your real capabilities
              </h3>
              <p className="text-xs text-slate-600">
                Not just titles — what you actually do.
              </p>
            </div>

            <div className="flex flex-col items-center text-center border border-blue-100 bg-white shadow-md rounded-xl p-3">
              <Zap className="w-8 h-8 text-[#1E3A8A] mb-4" />
              <h3 className="font-semibold text-slate-900 mb-1">
                03 — Get your Career Threat Report™
              </h3>
              <p className="text-xs text-slate-600">
                Clear risk level. Honest insights. No corporate politeness.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-10 italic">
            Because “hardworking team player” is not a competitive advantage.
          </p>
        </section>

        <section className="text-center pb-20 px-6">
          <h2 className="text-2xl font-bold mb-4">
            Find Out Where You Stand in the AI Economy
          </h2>
          <p className="text-xs text-slate-500 mt-3">
            Takes less than a minute.
          </p>
        </section>
      </>
    )
  :(<>
  <section className="px-6 pt-16 max-w-3xl mx-auto">

    {/* MAIN TITLE */}
    <h1 className="text-4xl font-bold text-center mb-2 text-slate-900">
      Your AI Threat Report
    </h1>
    <p className="text-center text-slate-500 text-sm mb-10">
      Brutally honest analysis of your professional survivability.
    </p>

    {/* SCORE CARD */}
    <div className="bg-white shadow-xl border border-blue-100 rounded-2xl p-8 mb-10">
      <p className="text-sm text-slate-600 font-medium mb-1">AI THREAT LEVEL</p>

      <div className="flex items-end gap-3 mb-4">
        <h2 className="text-6xl font-extrabold text-blue-600">9.2</h2>
        <span className="text-slate-500 text-xl mb-1">/ 10</span>
      </div>

      <p className="text-lg font-semibold text-red-600 mb-2">
        NON-PLAYER CHARACTER
      </p>

      <p className="text-sm text-slate-700 leading-relaxed">
        You have managed to turn your professional identity into a mythic LARP,
        but unfortunately for you, AI is significantly better at world-building
        and community management than you'll ever be. Your role as 'Valkyrie
        Asgard' in the tech ecosystem is just a fancy mask for a moderator whose
        entire existence can be replaced by a well-tuned sentiment analysis
        algorithm and a few lines of Python.
      </p>
    </div>

    {/* DETAILS GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

      {/* TECHNICAL SKILLS */}
      <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">TECHNICAL SKILLS</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Your 'skills' appear to be a collection of soft-touch buzzwords that
          ChatGPT can hallucinate with 10x the efficiency and none of the ego.
          You aren't building the future; you're just reacting to it in a Discord
          channel.
        </p>
      </div>

      {/* AI ADAPTABILITY */}
      <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">AI ADAPTABILITY</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          You think using a pseudonym makes you tech-savvy, but it actually just
          makes you easier to delete. You’re not adapting to AI; you're being
          outpaced by basic automation that doesn't need a lunch break or a sense
          of self-importance.
        </p>
      </div>

      {/* CAREER MOAT */}
      <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">CAREER MOAT</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Your moat is made of paper-thin 'soft skills' that are the first thing
          to get liquidated when the budget tightens. There is absolutely nothing
          you do that a specialized agent couldn't do better for the price of a
          monthly API subscription.
        </p>
      </div>

      {/* MARKET POSITIONING */}
      <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">MARKET POSITIONING</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Positioned as a 'Valkyrie' in a market that needs engineers, you're
          essentially a decorative hood ornament on a car that's about to be
          replaced by a drone. Your title carries zero weight in a world where
          real value is measured in tokens and compute.
        </p>
      </div>
    </div>

    {/* RESET BUTTON */}
    <div className="flex justify-center mb-20">
      <button
        onClick={() =>{ 
          setValue("resume", []);       
          setValue("linkedin", "");     
          clearErrors();
          setIsParsing(false)           
          setResponse(false);  
        }}
        className="bg-gradient-to-r from-blue-500 to-blue-400 text-white py-3 px-8 rounded-xl font-medium hover:opacity-90 transition"
      >
        CHECK AGAIN
      </button>
    </div>
  </section>
</>)}
      <footer className="py-6 text-center text-xs text-slate-700 border-t border-blue-100">
        <p>Worko will never share your data.</p>
      </footer>
    </div>
  );
};

export default WorkoFutureProofLanding;