import React, { useEffect, useState } from "react";
import {
  Upload,
  Link as LinkIcon,
  ArrowRight,
  Shield,
  BarChart,
  Zap,
  ArrowBigRight,
} from "lucide-react";
import { useForm } from "react-hook-form";
import httpServiceObj from "@Services/ApiHandler.service";
import { getToastOptions } from "@Utils/Toast.utils";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { logo_text } from "@Assets";

interface ResponseFromPost {
  id:string
}

interface GetDataResponse {
  data: string;
  error:string;
}

interface FormattedSection {
  title: string;
  content: string;
}

interface FinalFormattedData {
  threatLevel: string;
  sections: FormattedSection[];
}

const WillAiReplaceYouLanding: React.FC = () => {
  const { register, handleSubmit, watch, clearErrors,setValue, setError, formState: { errors } } = useForm();
  const linkedinValue = watch("linkedin");
  const resumeValue = watch("resume");
  const [loading, setLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [response,setResponse] = useState<boolean>(false);
  const [responseId,setResponseId] = useState<string | undefined>("");
  const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/;
  const [finalData, setFinalData] = useState<any[]>([]);
  const [showFinalizing, setShowFinalizing] = useState(false);

  const {
    data: apidata,
    isLoading,
    error,
  } = useQuery<GetDataResponse>({
    queryKey: ["find-data", responseId],
    queryFn: () => getData(responseId!),
    enabled: !!responseId,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => {
      const currentData = query.state.data;

      if (query.state.status === "error") {
        return false;
      }

      if (!currentData || currentData.data.length === 0) {
        return 5000;
      }

      return false;
    },
  });

  const formatApiResponse = (raw: string): FormattedSection[] => {
    const cleaned = raw?.trim();

    const blocks = cleaned
      // .replace("AI THREAT LEVEL", "### AI THREAT LEVEL")
      .split("###")
      .filter(Boolean);
    console.log(blocks)
    return blocks.map((block) => {
      const [titleLine, ...rest] = block.trim().split("\n");
      return {
        title: titleLine.trim(),
        content: rest.join("\n").trim(),
      };
    });
  };

  const linkedinMessages = [
    "Scanning your LinkedIn profile...",
    "Extracting your career history...",
    "Analyzing your job titles for existential risk...",
    "Measuring how replaceable your responsibilities look...",
    "Checking your endorsements (even the fake ones)...",
    "Estimating your long-term survival probability...",
    "Comparing your skills to AI automation trends...",
  ];
  const resumeMessages = [
    "Uploading and reading your resume...",
    "Parsing your experience from top to bottom...",
    "Detecting transferable skills (if any)...",
    "Checking your buzzword-to-skill ratio...",
    "Analyzing roles vulnerable to automation...",
    "Mapping your competencies against AI models...",
    "Ranking your future-proof abilities...",
  ];

  const getData = async (id: string): Promise<GetDataResponse> => {
    const { response, error } =
      await httpServiceObj.get<GetDataResponse>(
        `https://rayyanblue.app.n8n.cloud/webhook/get-data`,
        true,
        { id },
        true
      );
    if(response && response?.error){
      toast.error(response.error,getToastOptions({}))
      setIsParsing(false);
      setProgress(0);
      setCurrentMessageIndex(0)
      setLoading(false);
      throw new Error(response.error);
    }
    if (error) {
      setIsParsing(false);
      setProgress(0);
      setCurrentMessageIndex(0)
      setLoading(false);
      throw new Error(error.message);
    }

    if (!response) {
      setIsParsing(false);
      setProgress(0);
      setCurrentMessageIndex(0)
      setLoading(false);
      throw new Error("No response received");
    }

    return response;
  };

  useEffect(() => {
    if (!apidata || !apidata.data || apidata.data.length === 0) {
      return;
    }

    const formattedSections = formatApiResponse(apidata.data);

    setShowFinalizing(true);
    setCurrentMessageIndex(0);

    setTimeout(() => {
      setFinalData([{ sections: formattedSections }]);
      setIsParsing(false);
      setProgress(100);
      setLoading(false);
      setResponse(true);
      setShowFinalizing(false);
}, 2000);
  }, [apidata]);

  const onSubmit = async(data: any) => {
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

    setIsParsing(true);
    setCurrentMessageIndex(0);
    setProgress(5);
    setLoading(true)

    try {
    if(hasResume){
      const file = data?.resume?.[0];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://rayyanblue.app.n8n.cloud/webhook/resume-upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadResult = await res.json();
      const link = uploadResult?.link || uploadResult?.url;
        try {
          if(!link.trim){
            toast.error("No link found please try later",getToastOptions({}))
            return
          }
          const payload = {
            link
          }
          const {response,error} = await httpServiceObj.post<ResponseFromPost>(`https://rayyanblue.app.n8n.cloud/webhook/submit-resume-link`,payload,true,{},true)
          if(error){
            toast.error(error.message,getToastOptions({}))
            setIsParsing(false);
            setProgress(0);
            setCurrentMessageIndex(0)
            setLoading(false);
            return
          }
          if(!response?.id){
            toast.error("No Id recieved please try again later",getToastOptions({}))
            setIsParsing(false);
            setProgress(0);
            setCurrentMessageIndex(0)
            setLoading(false);
            return
          }
          setResponseId(response?.id)
          } catch (error) {
            console.log(error,"error in submiting the link after uploading resume")
          }
      }
      if(hasLinkedin){
        const payload = {
          link:linkedin
        }
        const {response,error} = await httpServiceObj.post<ResponseFromPost>(`https://rayyanblue.app.n8n.cloud/webhook/submit-resume-link`,payload,true,{},true)
        if(error){
          toast.error(error.message,getToastOptions({}))
          setIsParsing(false);
          setProgress(0);
          setCurrentMessageIndex(0)
          setLoading(false);
          return
        }
        if(!response?.id){
          toast.error("No Id recieved please try again later",getToastOptions({}))
          setIsParsing(false);
          setProgress(0);
          setCurrentMessageIndex(0)
          setLoading(false);
          return
        }
        setResponseId(response?.id)
      }
    } catch (error) {
      console.log(error,"Error while post api send the linkedin link")
    }
  };

  useEffect(() => {
  if (!isParsing) return;

  const activeMessages =
    resumeValue && resumeValue.length > 0
      ? resumeMessages
      : linkedinMessages;

  const messageInterval = setInterval(() => {
  setCurrentMessageIndex((prev) =>
    (prev + 1) % activeMessages.length
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
  const firstSectionContent = finalData[0]?.sections?.[0]?.content;
  const score = firstSectionContent?.split("—")?.[0]?.trim();
  const gained = score?.split(" / ")?.[0]?.trim();
  const outOf = score?.split(" / ")?.[1]?.trim();
  const feedbackNote = firstSectionContent?.split("—")?.[1]?.trim();
  const getScoreColor = (score: number): string => {
    if (score > 8) return "text-red-800";
    if (score > 6) return "text-red-400";
    if (score > 4) return "text-yellow-500";    
    if (score > 2) return "text-green-400";
    if (score > 0) return "text-green-700";
    return "text-gray-500";                     
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white via-blue-50 to-slate-100 text-slate-900 flex flex-col">
            
      {/* STICKY NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-blue-100">
        <div className="flex items-center justify-between px-4 py-2 max-w-6xl mx-auto">
          <img src={logo_text} alt="" className="h-12 w-auto" />
          {/* <div className="text-xl px-4 py-2 font-semibold">Worko FutureProof</div> */}
          {/* <button className="text-sm bg-gradient-to-r from-blue-500 to-blue-400 text-white px-4 py-2 rounded-lg font-medium">
            Get Your Score
          </button> */}
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
          <div className="flex gap-6 text-slate-600 mt-2">
            <span>• Brutally honest.</span>
            <span>• Mildly traumatic.</span>
            <span>• Surprisingly useful.</span>
          </div>
          </p>

          {/* INPUT CARD */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100 max-w-2xl w-full"
          >
            {/* <p className="text-sm text-slate-600 text-center mb-3">
              Paste your LinkedIn profile or upload your CV.
            </p> */}

            <div className="flex items-center gap-2 mb-1 flex-col">
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
              placeholder="Paste your LinkedIn profile"
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
              {errors.linkedin && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.linkedin.message as string}
                </p>
              )}
            </div>
              <p>OR</p>
              <label className="w-full flex items-center justify-center h-[48px] px-4 rounded-xl border border-dashed border-blue-500 bg-blue-50 cursor-pointer hover:bg-blue-100 transition">
                <Upload className="w-5 h-5 text-[#1E3A8A]" />
                <p>Upload your CV</p>
                <input
                  type="file"
                  className="hidden"
                  {...register("resume", {
                    validate: {
                      isPdf: (files) =>
                        !files?.length ||
                        files[0].type === "application/pdf" ||
                        "Only PDF files are allowed",

                      fileSize: (files) =>
                        !files?.length ||
                        files[0].size <= 5 * 1024 * 1024 ||
                        "File size must be less than 5MB",
                    },
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
              {errors.resume && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.resume.message as string}
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
                  showFinalizing
                  ? "Finalizing your Career Threat Score..."
                  : (resumeValue && resumeValue.length > 0
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
                {loading ? "Auditing..." : "AUDIT ME"}
              </button>
            </div>

            {/* <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">
              +2,847 professionals already stress-tested
            </p> */}
          </form>
        </section>

        {/* FEATURE SECTION */}
        <section className="py-10 px-6 max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-semibold text-slate-500 tracking-widest mb-10">
            HOW IT WORKS?
          </h2>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-4 items-center">

  {/* STEP 1 */}
  <div className="flex items-center justify-center gap-6 sm:gap-3">
    <div className="w-full flex flex-col items-center text-center border border-blue-100 bg-white shadow-md rounded-xl p-3">
      <Shield className="w-8 h-8 text-[#1E3A8A] mb-4" />
      <h3 className="font-semibold text-slate-900 mb-1">
        Share your LinkedIn Profile or CV
      </h3>
      <p className="text-xs text-slate-600">
        We analyze your experience, skills, and career trajectory.
      </p>
    </div>

    <ArrowBigRight className="opacity-50 hidden sm:block text-blue-400 w-8 h-8 lg:w-10 lg:h-10" />
  </div>

  {/* STEP 2 */}
  <div className="flex items-center justify-center gap-6 sm:gap-3">
    <div className="w-full flex flex-col items-center text-center border border-blue-100 bg-white shadow-md rounded-xl p-3">
      <BarChart className="w-8 h-8 text-[#1E3A8A] mb-4" />
      <h3 className="font-semibold text-slate-900 mb-1">
        AI reads your real capabilities
      </h3>
      <p className="text-xs text-slate-600">
        Not just titles but what you actually do.
      </p>
    </div>

    <ArrowBigRight className="opacity-50 hidden sm:block text-blue-400 w-8 h-8 lg:w-10 lg:h-10" />
  </div>

  {/* STEP 3 */}
  <div className="w-full flex flex-col items-center text-center border border-blue-100 bg-white shadow-md rounded-xl p-3">
    <Zap className="w-8 h-8 text-[#1E3A8A] mb-4" />
    <h3 className="font-semibold text-slate-900 mb-1">
      Get your Career Threat Report
    </h3>
    <p className="text-xs text-slate-600">
      Clear risk level. Honest insights. No corporate politeness.
    </p>
  </div>

</div>

          <p className="font-semibold text-center text-md text-slate-500 mt-10 italic">
            Because “hardworking team player” is not a competitive advantage.
          </p>
        </section>

        <section className="text-center pb-10 px-6">
          <h2 className="text-2xl font-bold mb-4">
            Find Out Where You Stand in the AI Economy
          </h2>
          {/* <p className="text-xs text-slate-500 mt-3">
            Takes less than a minute.
          </p> */}
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

      <div className="flex justify-center items-end gap-3 mb-4">
        <h2 className={`text-6xl font-extrabold ${getScoreColor(gained)}`}>{gained}</h2>
        <span className="text-slate-500 text-xl mb-1">/ {outOf}</span>
      </div>
      <p>{feedbackNote}</p>
    </div>

    {/* DETAILS GRID */}
    <div className="grid grid-cols-1 gap-6 mb-12">
      {finalData[0] && (
      <div className="flex flex-col gap-4">
        {finalData[0].sections
          .filter((_:any, index:number) => index !== 0) // skip first section
          .map((section: any, index: number) => (
            <div
              key={index}
              className="bg-white shadow-md border border-blue-100 rounded-xl p-5"
            >
              <p className="text-sm text-blue-600 font-semibold mb-2">
                {section.title}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line text-left">
                {section.content}
              </p>
            </div>
          ))}
      </div>
    )}

      {/* TECHNICAL SKILLS */}
      {/* <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">TECHNICAL SKILLS</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Your 'skills' appear to be a collection of soft-touch buzzwords that
          ChatGPT can hallucinate with 10x the efficiency and none of the ego.
          You aren't building the future; you're just reacting to it in a Discord
          channel.
        </p>
      </div> */}

      {/* AI ADAPTABILITY */}
      {/* <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">AI ADAPTABILITY</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          You think using a pseudonym makes you tech-savvy, but it actually just
          makes you easier to delete. You’re not adapting to AI; you're being
          outpaced by basic automation that doesn't need a lunch break or a sense
          of self-importance.
        </p>
      </div> */}

      {/* CAREER MOAT */}
      {/* <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">CAREER MOAT</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Your moat is made of paper-thin 'soft skills' that are the first thing
          to get liquidated when the budget tightens. There is absolutely nothing
          you do that a specialized agent couldn't do better for the price of a
          monthly API subscription.
        </p>
      </div> */}

      {/* MARKET POSITIONING */}
      {/* <div className="bg-white shadow-md border border-blue-100 rounded-xl p-5">
        <p className="text-sm text-blue-600 font-semibold mb-2">MARKET POSITIONING</p>
        <p className="text-sm text-slate-700 leading-relaxed">
          Positioned as a 'Valkyrie' in a market that needs engineers, you're
          essentially a decorative hood ornament on a car that's about to be
          replaced by a drone. Your title carries zero weight in a world where
          real value is measured in tokens and compute.
        </p>
      </div> */}
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
          setResponseId("")
          setProgress(0)
          setCurrentMessageIndex(0)
          setLoading(false)
          setFinalData([])
        }}
        className="bg-gradient-to-r from-blue-500 to-blue-400 text-white py-3 px-8 rounded-xl font-medium hover:opacity-90 transition"
      >
        CHECK AGAIN
      </button>
    </div>
  </section>
</>)}
    <footer className="py-6 text-center text-xs text-slate-700 border-t border-blue-100 space-y-1">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        worko.ai
      </p>
    </footer>
    </div>
  );
};

export default WillAiReplaceYouLanding;