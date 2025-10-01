import { useEffect, useState } from 'react';
import { set, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '@Context/App.context';
import httpServiceObj from '@Services/ApiHandler.service';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageModal, { MessagePopupProps } from '@Components/Modals/MessageModal';
import { CompanyByIdDto } from '@Interfaces/JobsAndCompany.dto';
import { validationRules } from '@Utils/FormValidator.utils';
import ReferralLoader from '@Components/ReferralRequest/ReferralLoader';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';
import { getHttpOptions } from '@Utils/HttpOptions.utils';
import { AuthLoginForGeneralUserDto } from '@Interfaces/Auth.dto';
import RequestReferralMessage from '@Components/ReferralRequest/RequestReferralMessage';
import { MatchingScore } from '@Services/MatchingScore.service';
import FeedbackModal, { FeedbackModalProps } from '@Components/Shared/Feedback';
import { handleEditProfileRedirection } from '@Components/Company/CompanyJobContent';
import { useCrossAppAuth } from '@Hooks/useCrossAppAuth.hook';
import { NormalizedUser } from '@Utils/NormalizeUser';
import { RBAC } from '@Utils/RoleBaseAccessControll.utils';

/**
 * MatchingScoreDto
 */
export interface MatchScore {
	jdMatchErrorCode: number;
	jdMatchErrorDesc: string;
	matchingScore: number;
	rejectionFeedbackBySystem: string;
}

/**
 * ReferralRequestFormDto - This interface is used to define the structure of ReferralRequestFormDto
 */
export interface ReferralRequestFormDto {
	url: string;
	experience: number;
	description: string;
}

/**
 * continueReferralRequestDataDto - This interface is used to define the structure of continueReferralRequestDataDto
 */
export interface continueReferralRequestDataDto<T = ReferralRequestFormDto> {
	type: string;
	url: string;
	data: T | null;
}

/**
 * fetchCompanyById - This function is used to fetch the company details
 */
export async function fetchCompanyById(id: string): Promise<CompanyByIdDto> {
	const { response, error } = await httpServiceObj.get<[CompanyByIdDto]>(`/company/${id}`, true);
	if (!response?.length) {
		throw new Error('Something went wrong! Please try again later.'); // Proper error handlin
	}
	if (error) {
		throw error; // Throw instead of returning
	}
	return response[0]; // Directly return data
}

/**
 * RequestReferral - This functional component is used to raise a referral request
 */
const RequestReferral = () => {

	// useCrossAppAuth - This is a custom hook used to navigate to a different page
	const appHref = useCrossAppAuth();

	// check if the use is logged in
	const { PendingApply, setPendingApply, isLoggedIn, userDetails ,setIsModalOpen } = useAppContext() as { PendingApply: continueReferralRequestDataDto | null; setPendingApply: React.Dispatch<React.SetStateAction<continueReferralRequestDataDto | null>>; isLoggedIn: boolean; userDetails: NormalizedUser ,setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>};

	// navigate to a different page
	const nav = useNavigate();

	// get the current location
	const location = useLocation();

	// form validation
	const {
		register,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<ReferralRequestFormDto>({
		defaultValues: { url: '', experience: undefined, description: '' },
		mode: 'onChange',
	});

	// States
	const [modalData, setModalData] = useState<MessagePopupProps | null>(null);
	const [isLoader, setLoader] = useState(false); // Show loader when the form is submitted
	const [MessageEnabled, setMessageEnabled] = useState(false); // Show message when the form is submitted
	const [currStep, setCurrStep] = useState<0 | 1 | 2 | 3 | 4>(0); // Current step of the loader
	const [ModalType, setModalType] = useState<'zeroReferral' | 'profileCompletion' | 'AlreadyRequested' | 'RequestAccepted' | 'RequestRejected' | 'Error_250' | 'Error_251' | 'Max_tries'>('zeroReferral'); // Current step of the loader
	const [gaugeEnabled, setGaugeEnabled] = useState(false); // Show gauge when the form is submitted
	const [gaugeScore, setGaugeScore] = useState(0); // Show gauge when the form is submitted
	const [IsFeedbackOpen, setIsFeedbackOpen] = useState(false); // Show feedback modal when the form is submitted
	const [FeedbackInfo, setFeedbackInfo] = useState<FeedbackModalProps>();

	useEffect(() => {
		  setIsModalOpen(true);
		return () => {
		  setIsModalOpen(false);
		};
	  }, [isLoader, MessageEnabled, IsFeedbackOpen]);

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

	// Handle error in useEffect
	useEffect(() => {
		if (error) {
			setModalData({
				type: 'error',
				size: 'lg',
				heading: { message: 'Error', type: 'error' },
				message: error.message,
				buttons: [{ label: 'Close', action: () => setModalData(null), type: 'primary' }],
			});
			setTimeout(() => nav('/'), 5000); // Redirect to 404 page after 10 seconds
		}
	}, [error]);

	useEffect(() => {
		// Redirect to 404 page if the company ID is not present
		if (!location.hash) {
			nav('/404'); // Redirect to 404 page if the company ID is not present
		}
		// Else , Check if the use has come from the page of auth or not by checking the secure storage for stale request data.
		// If the user is not logged in and the referral request is not present in the secure storage, redirect to login page
		// Retrieve any pending referral data from context or secure storage
		const pendingReferral = PendingApply || secureStorage.getItem<continueReferralRequestDataDto>(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS);

		if (pendingReferral && isLoggedIn) {
			// Patch the form data safely
			setValue('url', pendingReferral.data?.url || '');
			setValue('description', pendingReferral.data?.description || '');
			setValue('experience', pendingReferral.data?.experience || 0);

			// Remove from storage *after* submitting
				setPendingApply(null);
				secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, null); 

			handleSubmit(onSubmit)(); // Call submit function
		}
	}, [location.hash, nav, isLoggedIn, PendingApply]);

	/**
	 * onSubmit - This function is called when the user submits the form
	 *
	 * @param data - Refers to the form data that user fills in order to raise a referral request
	 */
	const onSubmit = async (data: ReferralRequestFormDto) => {
		setLoader(true); // Show loader

		if (!isLoggedIn) {
			const continueReferralRequestData = {
				type: 'referral',
				url: window.location.href,
				data,
			};
			setPendingApply(continueReferralRequestData);
			secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, continueReferralRequestData);
			localStorage.setItem('continueReferralRequestData', JSON.stringify(continueReferralRequestData));
			nav('/auth/login');
			return;
		}

		//  Step 1: Check Referral Count
		const { response: refCount, error } = await httpServiceObj.get<{ isSubscribed: boolean; referralCount: number }>(`/user/${userDetails.email}/subscription/status`, true);
		if (error) {
			setMessageEnabled(true);
			setModalType('Max_tries');
			setLoader(false);
			return;
		} else if (refCount?.referralCount && refCount?.referralCount <= 0) {
			setGaugeEnabled(false)
			setMessageEnabled(true);
			setModalType('zeroReferral');
			setLoader(false);
			return;
		}

		//  Step 2: Check Profile Completion
		setCurrStep(1);
		// this was commented because backend no longer needs profilePercentage
		// const { response: profilePer } = await httpServiceObj.get<any>(`/user/${userDetails.email}/profilePercentage`, true);
		// if (profilePer) {
		// 	const totalPercentage = profilePer?.candidate.reduce((sum: any, element: any) => sum + element.curPerc, 0);
		// 	const cvCurPerc = profilePer?.candidate[2]?.curPerc;

		// 	if (cvCurPerc === 0) {
		// 		setGaugeEnabled(false)
		// 		setMessageEnabled(true);
		// 		setModalType('profileCompletion');
		// 		setLoader(false);
		// 		return;
		// 	}
		// }

		//  Step 3: Create Referral Request
		setCurrStep(2);
		const jobPortal = data.url.split('.')[1];
		const CreateReferrakPayload = {
			companyId: location.hash.substring(1),
			jobUrl: data.url,
			jdExtracted: data.description,
			jobId: '',
			jobPortal,
		};

		setCurrStep(3);
		const { response: refCreated, status: refApiStatus } = await httpServiceObj.post<{ referralRequestId: string }>(`/user/${userDetails.email}/referral/request`, CreateReferrakPayload, true);

		if (refApiStatus === 403) {
			setGaugeEnabled(false)
			setMessageEnabled(true);
			setModalType('AlreadyRequested');
			setLoader(false);
			return;
		}

		if (refCreated?.referralRequestId) {
			MatchingScore(refCreated.referralRequestId, userDetails.email!, setLoader, setMessageEnabled, setModalType, setGaugeEnabled, setGaugeScore,setFeedbackInfo,setIsFeedbackOpen);
		}
	};

	function ModalAction() {
		switch (ModalType) {
			case 'zeroReferral':
				reset();
				appHref(`/${import.meta.env.APP_PROXY_DASH}/candidate/subscription`);
				break;
			case 'AlreadyRequested':
				reset();
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'RequestAccepted':
				appHref(`/${import.meta.env.APP_PROXY_DASH}/candidate/referral`);
				break;
			case 'RequestRejected':
				reset();
				setLoader(false);
				setMessageEnabled(false);
				setIsFeedbackOpen(true);
				break;
			case 'Error_250':
				reset();
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'Error_251':
				reset();
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'Max_tries':
				reset();
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'profileCompletion':
				  handleEditProfileRedirection(userDetails?.lastAccessedDash as 'CAND' | 'EMP' || 'CAND');
				break;
		}
	}

	// Show reusable 1st made modal for error Dialogs and all
	{
		modalData && <MessageModal {...modalData} onClose={() => {setModalData(null) ; setGaugeEnabled(false)}} showCloseButton={false} />;
	}

	return (
		<div className="w-full ">
			<div className="section-wrapper !max-w-7xl  ">
				<form onSubmit={handleSubmit(onSubmit)} className=" mx-auto bg-[#F2F4F5]  pt-10 pb-14 px-5   rounded-[10px] sm:rounded-3xl  relative sm:pb-10">
					<div className="absolute top-7 right-4 flex gap-2 justify-center items-center min-w-20 ">
						<a className="fa-brands text-3xl bg-blue text-blue-700 fa-linkedin active:scale-75 " href={data?.linkedIn} target="_blank" rel="noopener noreferrer"></a>
						<a className="fa-solid fa-magnifying-glass text-black" href={data?.carrierPage} target="_blank" rel="noopener noreferrer"></a>
					</div>
					{/* <div className="px-4 sm:px-10"> */}
					<div className="mt-6 text-left">
						<label className="block text-xl font-semibold text-black max-sm:mb-10 sm:mb-5 capitalize">Get referral for any job in {data?.name.toLowerCase()}</label>

						<div className="flex justify-between gap-2  max-sm:flex-col   ">
							<div className="sm:w-2/3 flex-initial ">
								<input placeholder="Paste job url of any open role" {...register('url', validationRules.url)} className="border-[#929292] p-4 border rounded-2xl w-full   text-left bg-white " />
								{errors.url && <p className="text-red-500 text-xs">{errors.url.message}</p>}
							</div>
							<div className="sm:w-1/3 ">
								<input {...register('experience', validationRules.defaultNumber)} placeholder="Paste YOE required from job description" className="border-[#929292]  p-4 border rounded-2xl w-full  text-left bg-white " />
								{errors.experience && <p className="text-red-500 text-xs">{errors.experience.message}</p>}
							</div>
						</div>
					</div>

					<div className="mt-4">
						<textarea {...register('description', validationRules.jobDescription)} placeholder="Paste job description for above url here" className="border-[#929292] w-full p-4 border rounded-2xl bg-white " rows={18}></textarea>
						{errors.description && <p className="text-red-500 text-xs text-left">{errors.description.message}</p>}
					</div>
					<div className="w-full text-left ml-2">
						<button 
						disabled={!RBAC.can('apply_jobs')}
						data-tooltip-id='my-tooltip'
						data-tooltip-content={(RBAC.can("apply_jobs") ? "Click to submit your referral request" : "Login as candidate to submit your referral request")}
						type="submit" className="btn_primary  mt-6 px-3 py-1 bg-gradient-to-t from-blue-900 to-sky-500 text-white rounded-lg scale-110 disabled:cursor-not-allowed hover:bg-blue-700">
							Request Referral
						</button>
					</div>
				</form>
			</div>

			{isLoader && <ReferralLoader step={currStep} />}
			{MessageEnabled && <RequestReferralMessage Type={ModalType} gaugeScore={gaugeScore} gaugeEnabled={gaugeEnabled} onClose={() => ModalAction()} />}
			{IsFeedbackOpen && <FeedbackModal title={FeedbackInfo?.title || ""} details={FeedbackInfo?.details || ""} onClose={()=>{setIsFeedbackOpen(false) ; setLoader(false) ; setMessageEnabled(false); reset()}} />}
		</div>
	);
};

export default RequestReferral;
