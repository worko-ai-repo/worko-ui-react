import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { validationRules } from '@Utils/FormValidator.utils';
import DropdownCalendar from '@Components/Shared/DropdownCalender';
import CompanyBanner from '@Components/Company/CompanyBanner';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import httpServiceObj from '@Services/ApiHandler.service';
import MessageModal from '@Components/Modals/MessageModal';
import { toast } from 'react-toastify';

// Define the enum for guidance request types
enum UserGuidanceRequestTypeEnum {
  INTERVIEW_HANDHOLDING = "INTERVIEW_HAND_HOLDING",
  MOCK_INTERVIEW = "MOCK_INTERVIEW_PREPARATION",
  ASSIGNMENT_HELP = "HELP_WITH_ASSIGNMENT",
  CAREER_GUIDANCE = "CAREER_GUIDANCE",
  RESUME_REVIEW = "RESUME_REVIEW",
  OTHER = "OTHER"
}

// Define the interface for the request payload
interface GuidanceRequestPayload {
  guidanceRequestType: UserGuidanceRequestTypeEnum;
  guidanceRequestDeadline: string;
  companyName: string;
  jobUrl: string;
  guidanceRequestDescription: string;
}

const Guidance = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onChange' });

  // Map form values to API payload
  const mapFormToPayload = (formData: any): GuidanceRequestPayload => {
    // Map the select options to the enum values
    const typeMapping: { [key: string]: UserGuidanceRequestTypeEnum } = {
      'interview-handholding': UserGuidanceRequestTypeEnum.INTERVIEW_HANDHOLDING,
      'mock-interview': UserGuidanceRequestTypeEnum.MOCK_INTERVIEW,
      'assignment-help': UserGuidanceRequestTypeEnum.ASSIGNMENT_HELP,
      'career-guidance': UserGuidanceRequestTypeEnum.CAREER_GUIDANCE,
      'resume-review': UserGuidanceRequestTypeEnum.RESUME_REVIEW,
      'other': UserGuidanceRequestTypeEnum.OTHER
    };

    return {
      guidanceRequestType: typeMapping[formData.guidanceType] || UserGuidanceRequestTypeEnum.OTHER,
      guidanceRequestDeadline: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      companyName: formData.companyName,
      jobUrl: formData.jobUrl,
      guidanceRequestDescription: formData.serviceDescription
    };
  };

  // Function to show different modal messages
  const showModalMessage = (type: 'success' | 'error' | 'duplicate' | 'jobUrlInvalid') => {
    switch (type) {
      case 'success':
        setModalData({
          type: "success",
          heading: { message: "Request Submitted", type: "success" },
          message: "Your guidance request has been successfully submitted!",
          size: 'md',
          buttons: [{ 
            label: "OK", 
            type: "primary", 
            action: () => {
              setModalData(null);
              setSubmitSuccess(true);
              reset();
            } 
          }],
        });
        break;
      case 'error':
        setModalData({
          type: "error",
          heading: { message: "Submission Failed", type: "error" },
          message: "We couldn't submit your guidance request. Please try again later.",
          size: 'md',
          buttons: [{ 
            label: "OK", 
            type: "danger", 
            action: () => {
              setModalData(null);
            } 
          }],
        });
        break;
      case 'duplicate':
        setModalData({
          type: "warning",
          heading: { message: "Request Already Exists", type: "warning" },
          message: "You have already submitted a similar guidance request. Check your dashboard for reference.",
          size: 'md',
          buttons: [{ 
            label: "OK", 
            type: "primary", 
            action: () => {
              setModalData(null);
            } 
          }],
        });
        break;
      default:
        setModalData({
          type: "error",
          heading: { message: "Something Went Wrong!", type: "error" },
          message: "Looks like something went wrong. Please try again later.",
          size: 'md',
          buttons: [{ 
            label: "OK", 
            type: "danger", 
            action: () => {
              setModalData(null);
            } 
          }],
        });
    }
  };

  const onSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      const payload = mapFormToPayload(formData);
      
      const { response, error, status } = await toast.promise(
        httpServiceObj.post(
          '/user/guidance-request', 
          payload,
          true
        ),
        {
          pending: 'Submitting guidance request...',
        }
      );
      
      if (status === 409) {
        // Handle duplicate request
        showModalMessage('duplicate');
        return;
      }
      
      if (error) {
        console.error('Error details:', error);
        throw new Error(error.message || 'Failed to submit guidance request');
      }

      console.log('Guidance request submitted successfully:', response);
      showModalMessage('success');
    } catch (error) {
      console.error('Error submitting guidance request:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
      showModalMessage('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <CompanyBanner BannerMode={CompanyPageModeEnum.GUIDANCE} />
      <div className="section-wrapper !max-w-5xl">
       
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto bg-[#F2F4F5] pb-10 rounded-2xl">
            <h2 className="text-lg text-left py-2 px-4 sm:px-10 font-semibold mb-4 border-b border-black">
              Get Guidance for any job listed on Worko
            </h2>

          
            
            {/* second section */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10 pb-7 border-b border-gray-400 px-4 sm:px-10">
              <div className="flex flex-col items-start justify-start">
                <label className="my-3 block text-sm font-semibold !ml-0 text-black">Guidance Type</label>
                <select 
                  {...register('guidanceType', { required: 'Please select a guidance type' })} 
                  className="select_primary max-sm:min-w-[70vw] sm:max-w-[300px] w-full p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm"
                >
                  <option value="">What you need guidance for</option>
                  <option value="interview-handholding">Interview hand holding</option>
                  <option value="mock-interview">Mock Interview / Preparation</option>
                  <option value="assignment-help">Help with assignment</option>
                  <option value="career-guidance">Career Guidance</option>
                  <option value="resume-review">Resume Review</option>
                  <option value="other">Other</option>
                </select>
                {errors.guidanceType && <p className="text-red-500 text-xs">{errors.guidanceType.message as string}</p>}
              </div>
              
              {/* Date */}
              <div className="flex flex-col items-start justify-start">
                <label className="my-3 block text-sm font-semibold text-black">Deadline Date</label>
                <div className="flex justify-start w-full sm:max-w-[300px] text-left">
                  <DropdownCalendar 
                    onSelectDate={(date: any) => setValue('date', date)} 
                    Cname="select_primary sm:max-w-[300px] w-full p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm text-left" 
                  />
                </div>
                {errors.date && <p className="text-red-500 text-xs">{errors.date.message as string}</p>}
              </div>
              
              <div className="flex flex-col items-start justify-start">
                <label className="my-3 block text-sm font-semibold text-black">Company Name</label>
                <input 
                  {...register('companyName', { required: 'Company name is required' })} 
                  className="w-full max-sm:min-w-[70vw] sm:max-w-[300px] p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm" 
                  placeholder="Enter the company name"
                />
                {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message as string}</p>}
              </div>

              {/* Job URL */}
              <div className="flex flex-col items-start justify-start">
                <label className="my-3 block text-sm font-semibold text-black">Job URL</label>
                <input 
                  {...register('jobUrl', validationRules.url)} 
                  className="w-full max-sm:min-w-[70vw] sm:max-w-[300px] p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm" 
                  placeholder="Enter the job URL"
                />
                {errors.jobUrl && <p className="text-red-500 text-xs">{errors.jobUrl.message as string}</p>}
              </div>
            </div>

            {/* third sections */}
            <div className="px-4 sm:px-10">
              <div className="mt-4">
                <label className="block text-sm font-semibold text-black">Provide the detailed description of the required guidance</label>
                <textarea 
                  {...register('serviceDescription', { required: 'Description is required' })} 
                  className="w-full p-2 border rounded-md bg-white" 
                  rows={10}
                />
                {errors.serviceDescription && <p className="text-red-500 text-xs">{errors.serviceDescription.message as string}</p>}
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn_primary mt-6 px-6 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        
      </div>
      
      {/* Modal for displaying messages */}
      {modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}
    </div>
  );
};

export default Guidance;