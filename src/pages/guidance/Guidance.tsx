import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { validationRules } from '@Utils/FormValidator.utils';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import DropdownCalendar from '@Components/Shared/DropdownCalender';
import CompanyBanner from '@Components/Company/CompanyBanner';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import httpServiceObj from '@Services/ApiHandler.service';
import MessageModal from '@Components/Modals/MessageModal';
import { toast } from 'react-toastify';
import { useAppContext } from '@Context/App.context';
import { useQuery } from '@tanstack/react-query';
import { CompanyByIdDto } from '@Interfaces/JobsAndCompany.dto';
import { fetchCompanyById } from '@Pages/request-referral/RequestReferral';
import { getToastOptions } from '@Utils/Toast.utils';
import { ApiCallResponse } from '@Interfaces/HttpOption.dto';
import { RBAC } from '@Utils/RoleBaseAccessControll.utils';

// Define guidance form data interface
interface GuidanceFormDTO {
	guidanceRequestType: string;
	guidanceRequestDeadline: string;
	guidanceRequestDescription: string;
	companyName: string;
	jobUrl: string;
  companyId?: string;
}

// Continue request data interface matching your existing pattern
interface ContinueGuidanceRequestData {
	type: 'guidance';
	url: string;
	data: GuidanceFormDTO;
}

const Guidance = () => {
	const nav = useNavigate();
	const { isLoggedIn } = useAppContext();
	// const companyData =
	// Form setup with default values
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		trigger,
		watch,
		setError,
    clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<GuidanceFormDTO>({
		mode: 'onChange',
		defaultValues: {
			guidanceRequestType: '',
			guidanceRequestDeadline: undefined,
			companyName: '',
			jobUrl: '',
			guidanceRequestDescription: '',
		},
	});

	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [modalData, setModalData] = useState<any>(null);
	const [pendingGuidance, setPendingGuidance] = useState<ContinueGuidanceRequestData | null>(null);
	const [submitGuidance, setSubmitGuidance] = useState(false);

	/**
	 * UseQuery - This is a react-query hook used to fetch the company details on page mount
	 */
	const { data, error } = useQuery<CompanyByIdDto, Error>({
		queryKey: ['company', location.hash],
		queryFn: () => fetchCompanyById(location.hash.substring(1)), // No extra error handling
		enabled: Boolean(location.hash),
		staleTime: 1000 * 60 * 5,
		retry: 0,
	});

	if (data) {
		setValue('companyName', data.name);
	}

	// Function to show different modal messages
	const showModalMessage = (type: 'success' | 'error' | 'duplicate' | 'jobUrlInvalid') => {
		switch (type) {
			case 'success':
				setModalData({
					type: 'success',
					heading: { message: 'Request Submitted', type: 'success' },
					message: 'Your guidance request has been successfully submitted!',
					size: 'md',
					buttons: [
						{
							label: 'OK',
							type: 'primary',
							action: () => {
								setModalData(null);
								setSubmitSuccess(true);
								reset();
							},
						},
					],
				});
				break;
			case 'error':
				setModalData({
					type: 'error',
					heading: { message: 'Submission Failed', type: 'error' },
					message: "We couldn't submit your guidance request. Please try again later.",
					size: 'md',
					buttons: [
						{
							label: 'OK',
							type: 'danger',
							action: () => {
								setModalData(null);
							},
						},
					],
				});
				break;
			case 'duplicate':
				setModalData({
					type: 'warning',
					heading: { message: 'Request Already Exists', type: 'warning' },
					message: 'You have already submitted a similar guidance request. Check your dashboard for reference.',
					size: 'md',
					buttons: [
						{
							label: 'OK',
							type: 'primary',
							action: () => {
								setModalData(null);
							},
						},
					],
				});
				break;
			default:
				setModalData({
					type: 'error',
					heading: { message: 'Something Went Wrong!', type: 'error' },
					message: 'Looks like something went wrong. Please try again later.',
					size: 'md',
					buttons: [
						{
							label: 'OK',
							type: 'danger',
							action: () => {
								setModalData(null);
							},
						},
					],
				});
		}
	};

	// useEffect to check login status and restore form data
	useEffect(() => {
		// First check from state, then fallback to secure storage
		const savedGuidance = pendingGuidance || secureStorage.getItem<ContinueGuidanceRequestData>(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS);

		if (savedGuidance?.type === 'guidance' && isLoggedIn) {
			// Safely patch form data if it exists
			if (savedGuidance.data) {
				setValue('guidanceRequestType', savedGuidance.data.guidanceRequestType || '');
				// console.log(savedGuidance.data.guidanceRequestType);
				setValue('guidanceRequestDeadline', savedGuidance.data.guidanceRequestDeadline || new Date().toISOString().split('T')[0]);
				setValue('companyName', savedGuidance.data.companyName || '');
				setValue('jobUrl', savedGuidance.data.jobUrl || '');
				setValue('guidanceRequestDescription', savedGuidance.data.guidanceRequestDescription || '');

				// Clear stored data
				setPendingGuidance(null);
				secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, null);

				// Auto-submit if data exists
				handleSubmit(onSubmit)();
			} else {
				reset();
				toast.error('Something went wrong!',getToastOptions());
				secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, null);
			}
		}
	}, [isLoggedIn, pendingGuidance]);

	// Modified onSubmit to handle non-logged in users
	const onSubmit = async (formData: GuidanceFormDTO) => {
		if (submitGuidance) return; // Prevent multiple submissions
		setSubmitGuidance(true);

		// Ensure the field has a value before validating
		const selectedDate = watch('guidanceRequestDeadline');
		if (!selectedDate) {
			setError('guidanceRequestDeadline', {
				type: 'manual',
				message: 'Please select a Date from the dropdown',
			});
			setSubmitGuidance(false);
			return;
		}

		// Validate with react-hook-form
		const isDateValid = await trigger('guidanceRequestDeadline');
		if (!isDateValid) {
			setSubmitGuidance(false);
			return;
		}

		// Check if user is logged in
		if (!isLoggedIn) {
			// Store guidance request data
			const continueGuidanceRequestData: ContinueGuidanceRequestData = {
				type: 'guidance',
				url: window.location.href,
				data: formData,
			};

			// Save to state and secure storage
			setPendingGuidance(continueGuidanceRequestData);
			secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, continueGuidanceRequestData);

			// Redirect to login
			nav('/auth/login');
			return;
		}

		// Existing submission logic for logged-in users
		try {
			setSubmitError(null);
      // Append companyId if data.id exists
      const companyId = data?.id;
      if(companyId) formData = {...formData, companyId};
			const result = await toast.promise(httpServiceObj.post('/user/guidance-request', formData, true), {
				pending: 'Submitting guidance request...',
			},getToastOptions()) as ApiCallResponse;

			const { response, error, status } = result;

			if (status === 409) {
				showModalMessage('duplicate');
				return;
			}

			if (error) {
				console.error('Error details:', error);
				throw new Error(error.message || 'Failed to submit guidance request');
			}

			// console.log('Guidance request submitted successfully:', response);
			showModalMessage('success');
		} catch (error) {
			console.error('Error submitting guidance request:', error);
			setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
			showModalMessage('error');
		}
	};
	const finalTitle = data ? `Get Guidance for ${data.name.toLowerCase()} jobs at Worko` : 'Get Guidance for any jobs at Worko';
	return (
		<div className="w-full">
			<CompanyBanner BannerMode={CompanyPageModeEnum.GUIDANCE} />
			<div className="section-wrapper !max-w-5xl">
				<form onSubmit={handleSubmit(onSubmit)} className="mx-auto bg-[#F2F4F5] pb-10 rounded-2xl">
					<h2 className="capitalize text-lg text-left py-2 px-4 sm:px-10 font-semibold mb-4 border-b border-black">{finalTitle}</h2>

					{/* second section */}
					<div className="grid sm:grid-cols-2 gap-4 mb-10 pb-7 border-b border-gray-400 px-4 sm:px-10">
						<div className="flex flex-col items-start justify-start">
							<label className="my-3 block text-sm font-semibold !ml-0 text-black">Guidance Type</label>
							<select {...register('guidanceRequestType', { required: 'Please select a guidance type' })} className="select_primary max-sm:min-w-[70vw] sm:max-w-[300px] w-full p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm">
								<option value="">What you need guidance for</option>
								<option value="INTERVIEW_HAND_HOLDING">Interview hand holding</option>
								<option value="MOCK_INTERVIEW_PREPARATION">Mock Interview / Preparation</option>
								<option value="HELP_WITH_ASSIGNMENT">Help with assignment</option>
								<option value="CAREER_GUIDANCE">Career Guidance</option>
								<option value="RESUME_REVIEW">Resume Review</option>
								<option value="OTHER">Other</option>
							</select>
							{errors.guidanceRequestType && <p className="text-red-500 text-xs">{errors.guidanceRequestType.message as string}</p>}
						</div>

						{/* Date */}
						<div className="flex flex-col items-start justify-start">
							<label className="my-3 block text-sm font-semibold text-black"
							>Deadline date (By When you need the Guidance) </label>
							<div className="flex justify-start w-full sm:max-w-[300px] text-left">
								<DropdownCalendar onSelectDate={(date: any) => {setValue('guidanceRequestDeadline', date);
        trigger('guidanceRequestDeadline'); clearErrors('guidanceRequestDeadline');}} Cname="select_primary sm:max-w-[300px] w-full p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm text-left" />
							</div>
							{errors.guidanceRequestDeadline && <p className="text-red-500 text-xs">{errors.guidanceRequestDeadline.message as string}</p>}
						</div>
						<div className="flex flex-col items-start justify-start">
							<label className="my-3 block text-sm font-semibold text-black">Company Name</label>
							<input disabled={data ? true : false} {...register('companyName', { required: 'Company name is required' })} className="w-full max-sm:min-w-[70vw] sm:max-w-[300px] p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm" placeholder="Enter the company name" />
							{errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message as string}</p>}
						</div>

						{/* Job URL */}
						<div className="flex flex-col items-start justify-start">
							<label
							data-tooltip-id='my-tooltip'
							data-tooltip-content='Is there any specific role for which you need the guidance'
							className="my-3 block text-sm font-semibold text-black">Job URL <i 
                  className="fa-solid fa-circle-info animate-pulse cursor-pointer text-xs"
                ></i> </label>
							<input {...register('jobUrl', validationRules.url)} className="w-full max-sm:min-w-[70vw] sm:max-w-[300px] p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm" placeholder="Enter the job URL" />
							{errors.jobUrl && <p className="text-red-500 text-xs">{errors.jobUrl.message as string}</p>}
						</div>
					</div>

					{/* third sections */}
					<div className="px-4 sm:px-10">
						<div className="mt-4">
							<label className="block text-sm font-semibold text-black">Provide the detailed description of the required guidance</label>
							<textarea {...register('guidanceRequestDescription', { required: 'Description is required' })} className="w-full p-2 border rounded-md bg-white" rows={10} />
							{errors.guidanceRequestDescription && <p className="text-red-500 text-xs">{errors.guidanceRequestDescription.message as string}</p>}
						</div>
					</div>

					<button 
					type="submit" 
					data-tooltip-id='my-tooltip'
					data-tooltip-content={(RBAC.can("apply_jobs") ? "Click to submit your guidance request" : "Login as candidate to submit your guidance request")}
					className="btn_primary mt-6 px-6 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					// className="btn_primary mt-6 px-6 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:!bg-gray-300 cursor-not-allowed"
					disabled={(isSubmitting || !RBAC.can("apply_jobs") )}>
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
