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
import MessageModal from '@Components/Modals/MessageModal';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: { message?: string };
};
interface ApplyForm {
  currentCTC: number | null;
  expectedCTC: number | null;
  noticePeriod: number;
  resume: FileList | null;
}
interface UploadToAwsData{
  awsS3SignedUrl: string;
  cloudFileName: string;
  fileExtension: string;
  fileMimeType: string;
  userFileName: string;
}

type ParsedCandidate = {
  id:string;
  name: string;
  email: string;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  location: string;
  readyToRelocate: boolean;
  about?: string;
  education?: {
    collage: string;
    degree: string;
    startedYear?: number;
    passingYear: number;
    grade?: string;
    field?: string;
  }[];
  coreSkills?: {
    skillName: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  technicalSkills?: {
    skillName: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  userPreferredDepartments: string[];
  userPreferredIndustries: string[];
  userPreferredlocations: string[];
  userPreferredRoles: string[];
  
  cvAwsS3FileName: string;
  companyId: string;
  jobId: string;
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
  const [cloudFileName, setCloudFileName] = useState<string | undefined>("");
  const [modalData, setModalData] = useState<{
  type: "none" | "error" | "warning" | "success" | "info";
  heading?: { message: string; type: "error" | "warning" | "success" | "info" };
  message: string;
  buttons?: { label: string; action: () => void; type?: "primary" | "danger" | "warning" | "success" }[];
} | null>(null);

  const agencyBaseUrl = import.meta.env.APP_PROXY_AGENCY_BASE
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
        // setTimeout(() => {
        //   window.location.href = "https://www.worko.ai/";
        // }, 1000);
        return
      }
      if(response.isDeleted){
        toast.error("Job has been deleted",getToastOptions({}))
        // setTimeout(() => {
        //   window.location.href = "https://www.worko.ai/jobs/";
        // }, 1000);
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
    if(!jobDetails){
      toast.error("No company details found",getToastOptions({}))
      return
    }
    if(!queryParamjobId){
      toast.error("No job id found",getToastOptions({}))
      return
    }
    setIsSubmitting(true)
    // step 1 create a request to upload
    const payloadForAws = {
      companyId: jobDetails?.companyId,
      jobId: queryParamjobId,
      fileName: file?.name,
      fileMimeType: file?.type
    }
    const responseFromAws = await creatingRequestToUploadToAws(payloadForAws);
    if (!responseFromAws.success) {
      toast.error("Failed to upload resume", getToastOptions({}));
      console.error(responseFromAws.error)
      setIsSubmitting(false)
      return;
    }
    setCloudFileName(responseFromAws?.data?.cloudFileName)

    // step 2 upload the actuall file to s3
    const payloadForFileUpload = {
      fileType: responseFromAws?.data?.fileMimeType
    }
    const fileUpload = await uploadFileToAws(responseFromAws?.data?.awsS3SignedUrl, file, payloadForFileUpload);

    // step 3 parsing the uploaded cv
    const updatedPayload = {
      companyId: jobDetails?.companyId,
      jobId: queryParamjobId,
      candidateParsedCvAwsS3FileName: responseFromAws?.data?.cloudFileName,
      currentCTC:data?.currentCTC,
      expectedCTC:data?.expectedCTC,
      noticePeriod:data?.noticePeriod
    }
    const responseFromParsing = await parseTheUploadedCV(updatedPayload);
    if (!responseFromParsing?.success) {
      toast.error((responseFromParsing?.error as { message?: string })?.message, getToastOptions({}));
      setIsSubmitting(false)
      return;
    }
    setIsSubmitting(false)
    setModalData({
      type: "success",
      heading: { message: "Thanks for showing interest!", type: "success" },
      message: "Your application has been successfully submitted. Please keep an eye on your email for the next steps.",
    });
    reset()
    // toast.success("Resume uploaded successfully. Please check your email for further updates.", getToastOptions({}))
    // // step 4 sending the parse details to submit
    // const payloadWithParsedData = {
    //   ...responseFromParsing.data,
    //   currentCTC:data?.currentCTC,
    //   expectedCTC:data?.expectedCTC,
    //   noticePeriod:data?.noticePeriod,
    //   cvAwsS3FileName: responseFromAws?.data?.cloudFileName,
    //   companyId: jobDetails?.companyId,
    //   jobId: queryParamjobId,
    // }
    // const submitParsedDetailsApiResponse = await submitParsedDetails(payloadWithParsedData)
    // if(!submitParsedDetailsApiResponse?.success){
    //   toast.error((submitParsedDetailsApiResponse?.error as { message?: string })?.message,getToastOptions({}))
    //   setIsSubmitting(false)
    //   return
    // }

    // // step 5 moving to applicants
    // const moveToApplicantPayload = {
    //   candidateParsedCvId:submitParsedDetailsApiResponse?.data?.id,
    //   jobId: queryParamjobId,
    //   companyName: jobDetails?.companyName,
    //   jobTitle: jobDetails?.jobTitle,
    // }
    // const moveToApplicantResponse = await movingToApplicant(moveToApplicantPayload)
    // if(!moveToApplicantResponse?.success){
    //   toast.error((moveToApplicantResponse?.error as { message?: string })?.message, getToastOptions({}))
    //   return
    // }
  }

  const creatingRequestToUploadToAws = async (payload: any) => {
    try {
      const { response, error } = await httpServiceObj.post<UploadToAwsData>(`${agencyBaseUrl}/file/gsu2u/CAND_SUBMIT_CV_JOB`, payload, true, {}, true);
      if (response) {
        return { success: true, data: response };
      }
      return { success: false, error };
    } catch (error) {
      console.error("Upload failed:", error);
      return { success: false, error };
    }
  };

  const uploadFileToAws = async (url:any,contractFile:any,payload: any) => {
    try {
      const { response } = await httpServiceObj.put(url, contractFile, false, payload, true);
      if (response) {
        return { success: true, data: response };
      }
      return { success: false };
    } catch (error) {
      console.error("Upload failed:", error);
      return { success: false, error };
    }
  };

  const parseTheUploadedCV = async (payload: any) => {
    try {
      const { response,error } = await httpServiceObj.post<ParsedCandidate>(`${agencyBaseUrl}/candidate-parsed-cv/parse/submit-form`, payload, true, {}, true);
      if(error){
        toast.error(error.message,getToastOptions({}))
        return
      }
      if (response) {
        return { success: true, data: response };
      }
      return { success: false,error };
    } catch (error) {
      console.error("Agency creation failed:", error);
      return { success: false, error };
    }
  };

  // const submitParsedDetails = async (payload: any) => {
  //   try {
  //     const { response,error } = await httpServiceObj.post<ParsedCandidate>(`${agencyBaseUrl}/candidate-parsed-cv/create/submit-form`, payload, true, {}, true);
  //     if(error){
  //       toast.error(error.message,getToastOptions({}))
  //       return
  //     }
  //     if (response) {
  //       return { success: true, data: response };
  //     }
  //     return { success: false, error };
  //   } catch (error) {
  //     console.error("Agency creation failed:", error);
  //     return { success: false, error };
  //   }
  // };

  // const movingToApplicant = async (payload: any) => {
  //   try {
  //     const { response,error } = await httpServiceObj.post(`${agencyBaseUrl}/candidate-parsed-cv/move-to-applicant/submit-form`, payload, true, {}, true);
  //     if(error){
  //       toast.error(error.message,getToastOptions({}))
  //       return
  //     }
  //     if (response) {
  //       return { success: true, data: response };
  //     }
  //     return { success: false,error };
  //   } catch (error) {
  //     console.error("Agency creation failed:", error);
  //     return { success: false, error };
  //   }
  // };

  const selectedFile = watch("resume")?.item(0);
  return (    
  <div className="w-full text-[#333]">
      <div className="z-[1] w-full bg-white pb-6 sticky top-0">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center sticky top-0 h-24">
          {jobDetails?.createdByCorporateUserId &&
          <img className="h-20 w-32 object-contain border-2 rounded-xl" src={jobDetails?.companyLogoUrl} alt="Company logo" />
          }
          { jobDetails?.createdByUserId &&
            <img className="h-20 w-32 object-contain border-2 rounded-xl" src={logo_text} alt="Company logo" />
          }
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <div className="text-left flex-1">
            <h1 className="text-3xl font-semibold text-[#444] mb-6">
              {toTitleCase(jobDetails?.jobTitle ?? "N/A")}
            </h1>
            <p className="text-sm font-bold text-[#666] mb-2">
              {jobDetails?.location?.fullLocation? toTitleCase(jobDetails?.location?.fullLocation[0].split(", ")[0]) :"N/A"}
               {/* {toTitleCase(jobDetails?.location?.city[0].split(", ")[0] ?? "N/A")} - 
               {toTitleCase(jobDetails?.location?.state[0].split(", ")[1] ?? "N/A")} */}
            </p>
            <p className="text-sm font-bold text-[#777] mb-2">
              {toTitleCase(jobDetails?.department) ?? "N/A"} / 
              {toTitleCase(jobDetails?.typeofEmployment) ?? "N/A"} / 
              {toTitleCase(jobDetails?.workMode ?? "On Site")}
            </p>

            {jobDetails?.displaySalaryRange ? 
            <p className="text-sm font-bold text-[#777] mb-2">
              Salary (CTC) : {`${jobDetails?.salaryRange?.min} LPA - ${jobDetails?.salaryRange?.max} LPA`}
            </p>
            : <p className="text-sm font-bold text-[#777] mb-2">
              Salary (CTC) : Not Disclosed
            </p>
            }

            <p className="text-sm font-bold text-[#777]">
              YOE Required : {
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
                {...register("resume", {
                  required: "Resume is required",
                  validate: {
                    fileType: (files) => {
                      if (!files || !files[0]) return true;
                      return files[0].type === "application/pdf" || "Only PDF files are allowed";
                    },
                    fileSize: (files) => {
                      if (!files || !files[0]) return true;
                      return files[0].size <= 5 * 1024 * 1024 || "File size must be under 5MB";
                    }
                  }
                })} 
                />
                <label htmlFor="resume" className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 cursor-pointer transition-all bg-slate-50 hover:bg-blue-50">
                <Upload className="size-5 text-slate-600" />
                <span className="text-sm text-slate-600">
                  {selectedFile ? selectedFile.name : "Choose file or drag here"}
                </span>
                </label>
                {errors.resume && (<p className="text-red-500 text-sm mt-1 text-center">{errors.resume.message}</p>)}
                <p className="text-xs text-slate-500 text-center">Only .pdf files allowed (max 5MB)</p>
              </div>
            </div>

            {/* Current CTC */}
            <div className='grid grid-cols-2 gap-4 items-center mb-5'>
              <label htmlFor="currentCTC" className="text-[#444]">Current CTC <span className='text-red-500'>*</span></label>
              <div>
                <input type="number" step="0.1" min={0} placeholder='10' className="w-full border rounded-lg px-4 py-2" {...register("currentCTC", { required: "Current CTC is required", valueAsNumber: true })} />
                {errors.currentCTC && <p className="text-left text-red-500 text-sm mt-1">{errors.currentCTC.message}</p>}
              </div>
            </div>

            {/* Expected CTC */}
            <div className='grid grid-cols-2 gap-4 items-center mb-5'>
              <label htmlFor="expectedCTC" className="text-[#444]">Expected CTC <span className='text-red-500'>*</span></label>
              <div>
                <input 
                type="number" 
                step="0.1" 
                min={0}
                placeholder='12' 
                className="w-full border rounded-lg px-4 py-2" 
                {...register("expectedCTC", { required: "Expected CTC is required", valueAsNumber: true, 
                  validate: (value) => {
                    const current = Number(watch("currentCTC") ?? 0);
                    const expected = Number(value ?? 0);
                    return expected >= current || "Expected CTC cannot be less than Current CTC";
                } })} />
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
          <div className={`text-left mb-6 min-h-[250px] break-words text-wrap ${styles.job_description_container}`}>
            <h2 className="text-xl font-semibold mb-4 break-words text-wrap">Job description</h2>
            <div
              className={`space-y-4 mb-4 break-words  ${styles.job_description}`}
              dangerouslySetInnerHTML={{ __html: decode }}></div>
          </div>
          : (<p className="text-center text-red-500">No job description found</p>)
        }
        </div>
      </div>
      {modalData && (
        <MessageModal
          {...modalData}
          onClose={() => {
            setModalData(null);
          }}
          showCloseButton={true}
        />
      )}
    </div>

  );
}

export default Applyjob