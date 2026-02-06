import { useEffect, useState } from 'react';
import { Upload, CheckCircle, Briefcase, TrendingUp, Users, SendIcon, ClipboardList, Award, MapPin, Wallet, Clock, Code } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { getToastOptions } from '@Utils/Toast.utils';
import { logo_text } from '@Assets';
import { useSearchParams } from 'react-router-dom';
import httpServiceObj from '@Services/ApiHandler.service';
import { toTitleCase } from '@Utils/Titlecase.utils';
import { JobDto } from '@Interfaces/JobsAndCompany.dto';
import styles from "./jobDescription.module.scss";

interface ApplyForm {
  currentCTC: number | null;
  expectedCTC: number | null;
  noticePeriod: number;
  resume: FileList | null;
}

const Applyjob:React.FC = () => {
 const { register, handleSubmit, reset, setValue, watch,formState: { errors },} = useForm<ApplyForm>({ mode: "onChange",
      defaultValues: {
        currentCTC: null,
        expectedCTC: null,
        noticePeriod: 0,
        resume: null,
      },
    });
  const [searchParams] = useSearchParams();
  const [isSubmitting,setIsSubmitting]  = useState(false);
  const [isFormOpen,setIsFormOpen]  = useState(true);
  // const queryParamjobId = searchParams.get("jobId");
  const [isJobDetailsLoading, setIsJobDetailsLoading] = useState(false);
  const [queryParamjobId, setQueryParamjobId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDto>();
  const [jobDescription, setJobDescription] = useState<string>("");

  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI

  const isFullyEscapedHTML = (html: string) => {
    return /&lt;[^&]*&gt;/.test(html);
  };
  const getHTML = (html: string) => {
    if (isFullyEscapedHTML(html)) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return doc.documentElement.textContent || "";
    }
    return html;
  };
  const decode = getHTML(jobDescription);
  
  useEffect(()=>{
    setQueryParamjobId(searchParams.get("jobId"))
    if(!queryParamjobId) return
    getJobDetails()
  },[queryParamjobId])

  const getJobDetails = async () =>{
    if(!queryParamjobId){
      toast.error("No job id found",getToastOptions({}))
      return
    }
    setIsJobDetailsLoading(true)
    try {
      const {response, error} = await httpServiceObj.get<JobDto>(`${APP_JOBS_API_URI}/job/${queryParamjobId}`,true,{},true)

      if(error){
        toast.error(error.message,getToastOptions({}))
        return
      }
      if(!response?.id){
        toast.error("No job found for this id",getToastOptions({}))
        setTimeout(() => {
          window.location.href = "https://www.worko.ai/";
        }, 3000);
        return
      }
      if(response.isDeleted){
        toast.error("Job has been deleted",getToastOptions({}))
        setTimeout(() => {
          window.location.href = "https://www.worko.ai/jobs/";
        }, 3000);
        return
      }
      setJobDetails(response)
      if(response?.htmlJobDescription){
        setJobDescription(response.htmlJobDescription)
      }
    } catch (error) {
      console.log("error finding job details",error)
    } finally {
      setIsJobDetailsLoading(false)
    }
  }
  
  const formSubmit = async (data:any) => {
    if(data.expectedCTC === 0) {
      toast.error("Expected ctc cannot be zero or empty",getToastOptions({}))
      return
    }
    if(data.currentCTC > data.expectedCTC){
      toast.error("Current ctc cannot be greated than expected ctc",getToastOptions({}))
      return
    }
    const file = data.resume[0]
    if (!file) {
      toast.error("Please upload a resume",getToastOptions({}))
      return
    };
    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid pdf format resume",getToastOptions({}))
      return
    };
    const oversizedFiles = file.size / 1024 / 1024
    if (oversizedFiles > 5) {
      toast.error(`Max limit for resume is 5MB`,getToastOptions({}));
      return;
    }
    console.log(data.resume[0])
  }
  const selectedFile = watch("resume")?.item(0);
  return (    <div className="w-full text-[#333]">
      <div className="z-[1] w-full bg-white pb-6 sticky top-0">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center sticky top-0 h-24">
          <img className="h-20 w-32 object-contain border-2 rounded-xl" src={jobDetails?.companyLogoUrl} alt="Logo Left" />
          <img className="h-20 w-32 object-contain border-2 rounded-xl" src={logo_text} alt="Logo Right" />
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="text-left flex-1">
            <h1 className="text-3xl font-semibold text-[#444] mb-6">
              {toTitleCase(jobDetails?.jobTitle ?? "N/A")}
            </h1>
            <p className="text-sm font-bold text-[#666] mb-2">
              {toTitleCase(jobDetails?.location?.city[0].split(", ")[0] ?? "N/A")} - 
              {toTitleCase(jobDetails?.location?.state[0].split(", ")[1] ?? "N/A")}
            </p>
            <p className="text-sm font-bold text-[#777] mb-2">
              {toTitleCase(jobDetails?.department) ?? "N/A"} / 
              {toTitleCase(jobDetails?.typeofEmployment) ?? "N/A"} / 
              On-Site</p>
            <p className="text-sm font-bold text-[#777]">
              Years of experience required : {
                jobDetails?.experienceRange?.min != null && jobDetails?.experienceRange?.max != null
                  ? `${jobDetails.experienceRange.min} - ${jobDetails.experienceRange.max}`
                  : jobDetails?.experienceRange?.min != null
                    ? jobDetails.experienceRange.min
                    : jobDetails?.experienceRange?.max != null
                      ? jobDetails.experienceRange.max
                      : "N/A"
              }
            </p>
          </div>
        </div>
        
        <div className="w-full flex gap-4 justify-center">
          <button 
            className={`px-4 py-2 text-sm font-semibold rounded-tl-md rounded-tr-md cursor-pointer 
            ${isFormOpen ? "bg-yellow-400" : "bg-gray-200"}`}
            disabled={isJobDetailsLoading}
            onClick={() => setIsFormOpen(true)}>
              Application Form
          </button>

          <button 
            className={`px-4 py-2 text-sm font-semibold rounded-tl-md rounded-tr-md cursor-pointer 
            ${!isFormOpen ? "bg-yellow-400" : "bg-gray-200"}`}
            disabled={isJobDetailsLoading}
            onClick={() => {
              if(jobDescription){
                setIsFormOpen(false)
              }else{
                toast.error("No job description found",getToastOptions({}))
              }
              }}>
              Job Description
          </button>
        </div>
      </div>

      <div className="w-full bg-[#f5f5f5] border-t py-14">
        <div className="max-w-4xl mx-auto px-4">
        {isFormOpen ?   
        (  <>   
          {/* LEFT aligned section title */}
          <h2 className="text-left text-md font-semibold text-[#444] mb-10 tracking-wide">SUBMIT YOUR APPLICATION</h2>
          {/* FORM */}
          <form onSubmit={handleSubmit(formSubmit)} className="max-w-[720px] w-full space-y-8">
            {/* Resume Upload */}
            <div className="grid grid-cols-2 gap-4 items-center mb-5">
              <label htmlFor="resume" className="text-[#444]">Upload Resume <span className='text-red-500'>*</span></label>
              <div className="relative">
                <input type="file" 
                accept="application/pdf"
                id="resume"
                className="hidden"
                {...register("resume", { required: "Resume is required" })} 
                />
                <label htmlFor="resume" className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer transition-all bg-slate-50 hover:bg-blue-50">
                <Upload className="size-5 text-slate-600" />
                <span className="text-sm text-slate-600">
                  {selectedFile ? selectedFile.name : "Choose file or drag here"}
                </span>
                </label>
                {errors.resume && (<p className="text-left text-red-500 text-sm mt-1">{errors.resume.message}</p>)}
                <p className="text-xs text-slate-500">Only .pdf files allowed (max 5MB)</p>
              </div>
            </div>

            {/* Current CTC */}
            <div className='grid grid-cols-2 gap-4 items-center mb-5'>
              <label htmlFor="currentCTC" className="text-[#444]">Current CTC <span className='text-red-500'>*</span></label>
              <div>
                <input type="number" step="0.1" placeholder='10' className="w-full border rounded-lg px-4 py-2" {...register("currentCTC", { required: "Current CTC is required", valueAsNumber: true })} />
                {errors.currentCTC && <p className="text-left text-red-500 text-sm mt-1">{errors.currentCTC.message}</p>}
              </div>
            </div>

            {/* Expected CTC */}
            <div className='grid grid-cols-2 gap-4 items-center mb-5'>
              <label htmlFor="expectedCTC" className="text-[#444]">Expected CTC <span className='text-red-500'>*</span></label>
              <div>
                <input type="number" step="0.1" placeholder='12' className="w-full border rounded-lg px-4 py-2" {...register("expectedCTC", { required: "Expected CTC is required", valueAsNumber: true })} />
                {errors.expectedCTC && <p className="text-left text-red-500 text-sm mt-1">{errors.expectedCTC.message}</p>}
              </div>
            </div>

            {/* Notice Period */}
            <div className='grid grid-cols-2 gap-4 items-center mb-5'>
              <label htmlFor="noticePeriod" className="text-[#444]">Notice Period <span className='text-red-500'>*</span></label>
              <select id="noticePeriod" className="w-full border rounded-lg px-4 py-2" {...register("noticePeriod", { required: "Notice period is required", valueAsNumber: true })}>
                <option value={0}>Immediate</option>
                <option value={15}>15 Days</option>
                <option value={30}>1 Month</option>
                <option value={60}>2 Months</option>
                <option value={90}>3 Months</option>
              </select>
              {errors.noticePeriod && <p className="text-left text-red-500 text-sm mt-1">{errors.noticePeriod.message}</p>}
            </div>

            {/* Submit button */}
            <button className={`text-white text-sm font-medium h-12 px-6 rounded-md ${isSubmitting ? "bg-blue-300 cursor-not-allowed opacity-70" : "bg-blue-500"}`}>
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
          </>
        ) : jobDescription ?
        ( <div
            className={`text-left ${styles.job_description_container}`}
            dangerouslySetInnerHTML={{ __html: decode }}
          />)
          : (<p className="text-center text-red-500">No job description found</p>)
        }
        </div>
      </div>
    </div>

  );
}

export default Applyjob