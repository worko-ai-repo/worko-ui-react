import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HeadBanner from "@Components/JobDescription/HeadBanner/index";
import JobJD from "@Components/JobDescription/JobJD";
import httpServiceObj from "@Services/ApiHandler.service";
import MainLoader from "@Components/Loader/Loader";
import { CompanyDto, JobDto, JobMatchingScoreDto } from "@Interfaces/JobsAndCompany.dto";
import MessageModal from "@Components/Modals/MessageModal";
import { MessagePopupProps } from "@Components/Modals/MessageModal";
import RequestReferralMessage from "@Components/ReferralRequest/RequestReferralMessage";
import FeedbackModal, { FeedbackModalProps } from "@Components/Shared/Feedback";
import { useAppContext } from "@Context/App.context";
import { continueReferralRequestDataDto } from "./request-referral/RequestReferral";
import { AuthLoginForGeneralUserDto } from "@Interfaces/Auth.dto";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import ReferralLoader from "@Components/ReferralRequest/ReferralLoader";
import { MatchingScore } from "@Services/MatchingScore.service";

const stripHtmlTags = (html: string) => {
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  return tempElement.innerText || tempElement.textContent || '';
}

  // Function to concatenate job description and skills
  const  getFormattedJobDescription = (jobDetails: any) => {

    //convert job Description from HTML to Plain Text
    const jobDescriptionPlainText =  stripHtmlTags(jobDetails.jobDescription || '');

    // Extract the job title, with a fallback in case it's not provided
    const jobTitle = jobDetails.jobTitle || 'Job Title not specified';

    // Combining all the skills arrays into a single array
    let allSkills = [
      ...(jobDetails.technicalSkills || []),
      ...(jobDetails.coreSkills || []),
      ...(jobDetails.softSkills || []),
      ...(jobDetails.mislaneiousSkills || [])
    ].join(', ');  // Joining all skills with a comma and space

    // Extracting experience range
    let experience = `${jobDetails.experienceRange?.min} - ${jobDetails.experienceRange?.max} years of experience`;
    // console.log(experience)

    // Construct the jdExtracted field with job description and skills
    let jdExtracted = `
    ${jobDescriptionPlainText}
    \n Job Title: ${jobTitle}
     \n\nExperience Required: ${experience}
    \n\nSkills Required: ${allSkills}
  `;

    return jdExtracted.trim();  // Return the concatenated job description and skills
  }


const JobDescription = () => {
	// check if the use is logged in
	const { PendingApply, setPendingApply, isLoggedIn, userDetails ,setIsModalOpen } = useAppContext() as { PendingApply: continueReferralRequestDataDto | null; setPendingApply: React.Dispatch<React.SetStateAction<continueReferralRequestDataDto | null>>; isLoggedIn: boolean; userDetails: Partial<AuthLoginForGeneralUserDto> ,setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>};

	// navigate to a different page
	const nav = useNavigate();

	// get the current location
	const location = useLocation();

  // States For Internal Apply
  const [isLoader, setLoader] = useState(false); // Show loader when the form is submitted
  const [MessageEnabled, setMessageEnabled] = useState(false); // Show message when the form is submitted
  const [currStep, setCurrStep] = useState<0 | 1 | 2 | 3 | 4>(0); // Current step of the loader
  const [ModalType, setModalType] = useState<'zeroReferral' | 'profileCompletion' | 'AlreadyRequested' | 'RequestAccepted' | 'RequestRejected' | 'Error_250' | 'Error_251' | 'Max_tries'>('zeroReferral'); // Current step of the loader
  const [gaugeEnabled, setGaugeEnabled] = useState(false); // Show gauge when the form is submitted
  const [gaugeScore, setGaugeScore] = useState(0); // Show gauge when the form is submitted
  const [IsFeedbackOpen, setIsFeedbackOpen] = useState(false); // Show feedback modal when the form is submitted
  const [FeedbackInfo, setFeedbackInfo] = useState<FeedbackModalProps>();

  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const { jobid } = useParams();
  const [jobDataState, setJobDataState] = useState<JobDto | undefined>(undefined);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<boolean>(false);
  const [modalData, setModalData] = useState<MessagePopupProps | null>(null);
  // Add a new state to track if user has already applied
const [hasAlreadyApplied, setHasAlreadyApplied] = useState<boolean>(false);

// Reset application status when jobid changes
useEffect(() => {
  setApplicationStatus(false);
  setHasAlreadyApplied(false);
}, [jobid]);
// Add this new function to check application status
const checkApplicationStatus = async () => {
  if (!isLoggedIn || !jobDataState) return;
  
  try {
    const { response, error, status } = await httpServiceObj.get<{data:[JobMatchingScoreDto], pagination:Object}>(
      `https://jobs.dev.worko.work/user-matching-score-job/?jobIds=${jobid}`,
      true,
      {},
      true
    );
    
    // Check each item in the array for status property
    if (response?.data) {
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].status) {
          setHasAlreadyApplied(true);
          setApplicationStatus(true);
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error checking application status:", error);
  }
};

// Add useEffect to call the check function when job data is loaded
useEffect(() => {
  if (jobDataState) {
    checkApplicationStatus();
  }
}, [jobDataState, isLoggedIn]);


  useEffect(() => {

      // Else , Check if the use has come from the page of auth or not by checking the secure storage for stale request data.
      // If the user is not logged in and the referral request is not present in the secure storage, redirect to login page
      // Retrieve any pending referral data from context or secure storage
      const pendingReferral = PendingApply || secureStorage.getItem<continueReferralRequestDataDto>(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA);
  
      if (pendingReferral && isLoggedIn) {
  
        // Remove from storage *after* submitting
          setPendingApply(null);
          secureStorage.setItem(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA, null); 
  
          // handleApplyClick(); // Call submit function
      }
    }, [location.hash, nav, isLoggedIn, PendingApply]);

  // Function to show error modals
  const showModalsError = (caseType: 'isExternalJobApplied' | 'expired_in' | 'application_success' | 'application_failure' | 'redundant') => {
    switch (caseType) {
      case "isExternalJobApplied":
        setModalData({
          type: "info",
          heading: {message: "Have you applied for this job?", type:'info'},
          size: 'md',
          buttons: [
            { 
              label: "No", 
              type: "danger", 
              action: () => {
                setShowApplyModal(false); 
                setModalData(null);
              }
            }, 
            {
              label: "Yes", 
              action: () => {
                updateExternalJobApplication(); 
                setModalData(null); 
                setShowApplyModal(false);
              }, 
              type: "primary"
            }
          ],
        });
        break;
      case "expired_in":
        setModalData({
          type: "error",
          heading: { message: "Invite Expired", type: "error" },
          message: "The invite you are trying to access has expired. Please contact the company for a new invite.",
          buttons: [{ label: "Back to Home", action: () => null }],
        });
        break;
      case "application_success":
        setModalData({
          type: "success",
          heading: { message: "Application Submitted", type: "success" },
          message: "Your job application has been successfully submitted!",
          buttons: [{ 
            label: "OK", 
            type: "primary", 
            action: () => {
              setModalData(null);
            } 
          }],
        });
        break;
        case "redundant":
          setModalData({
            type: "error",
            heading: { message: "Already submitted", type: "error" },
            message: "You have already applied for this job. Check your dashboard for reference.",
            buttons: [{ 
              label: "OK", 
              type: "primary", 
              action: () => {
                setModalData(null);
              } 
            }],
          });
          break;
      case "application_failure":
        setModalData({
          type: "error",
          heading: { message: "Application Failed", type: "error" },
          message: "We couldn't submit your application. Please try again later.",
          buttons: [{ 
            label: "OK", 
            type: "danger", 
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
          buttons: [{ label: "Back to Home", action: () => null }],
        });
    }
  };

  /**
   * Use Query to fetch job data
   */
  const {
    data: jobData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobData", jobid],
    queryFn: async () => {
      const { response, error } = await httpServiceObj.get<JobDto>(
        `https://jobs.dev.worko.work/job/${jobid}`,
        true,
        {},
        true
      );

      if (error) throw new Error(error.message);
      return response;
    },
    enabled: !!jobid, // Enable the query when jobId exists
    retry: 0,
  });

  useEffect(() => {
    if (jobData && !jobData.externalJobId) {
      const fetchCompanyDetails = async () => {
        try {
          const { response, error } = await httpServiceObj.get<[CompanyDto]>(
            `/company/${jobData.companyId}`,
            true
          );

          if (error) throw new Error(error.message);
          if (response)
            setJobDataState({
              ...jobData,
              companyDetails: response[0],
            });

        } catch (fetchError) {
          console.error("Error fetching company details:", fetchError);
        }
      };

      fetchCompanyDetails();
    } else if (jobData) {
      // If it's an external job, we still want to update jobDataState
      setJobDataState(jobData);
    }
  }, [jobData]);

  if (isLoading) return <MainLoader />;

  if (error)
    return (
      <div>
        Error loading job:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );


  if (isLoading) return <div>Loading job data...</div>;

  /**
   * updateExternalJobApplication
   *
   * @description - It will handle post job apply function for external jobs.
   */
  const updateExternalJobApplication = async () => {
    try {
      setIsApplying(true);
      setApplicationStatus(false);

      const payload = {
        jobId: jobData?.id,
        jobUrl: window.location.href,
        jobPortal: jobData?.jobUrl || undefined,
        matchingScore: jobData?.matchingScore || undefined,
        ...(!jobData?.externalJobId && {
          companyName: jobData?.companyName || jobDataState?.companyDetails?.name,
        }),
      };
      const constructUrl = jobData?.externalJobId
        ? `https://jobs.dev.worko.work/external-job-application/`
        : `https://jobs.dev.worko.work/job-application/`;

      const { response, error, status } = await httpServiceObj.post(
        constructUrl,
        payload,
        true,
        {},
        true
      );
        if(status===403) {
          setApplicationStatus(true);
          setShowApplyModal(true);
          // Show success modal after redundant application
          showModalsError('redundant');
          return;
        }
      if (error) {
        throw new Error(error.message || "Failed to submit application");
      } else {
        setApplicationStatus(true);
        setShowApplyModal(true);
        // Show success modal after successful application
        showModalsError('application_success');
      }
    } catch (error) {
      console.error("Application error:", error);
      setApplicationStatus(false);
      // Show failure modal if application fails
      showModalsError('application_failure');
    } finally {
      setIsApplying(false);
    }
  };

  /*
   * Handle Apply Click function
   */
  async function handleApplyClick() {
    
		if (!isLoggedIn) {
			const continueReferralRequestData = {
				type: 'referral',
				url: window.location.href,
				data:null,
			};
			setPendingApply(continueReferralRequestData);
			secureStorage.setItem(SecureStorageKeyEnum.CONTINUEREFERRALREQUESTDATA, continueReferralRequestData);
			localStorage.setItem('continueReferralRequestData', JSON.stringify(continueReferralRequestData));
			nav('/auth/login');
			return;
		}
    else{
    // Open the job URL in a new tab if available
    if (jobData?.externalJobId && jobData?.jobUrl) {
      window.open(jobData.jobUrl, "_blank");
      // Show the confirmation modal
      setShowApplyModal(true);
      showModalsError('isExternalJobApplied')
    } else {
      setLoader(true); // Show loader

      //construct the data
      let data = {
        "companyId": jobDataState?.companyDetails?.SK,
        "companyName": jobDataState?.companyName,
        // "jobTitle": jobDataState?.jobTitle,
        "jobUrl": window.location.href,
        //"jdExtracted": jobDataState.jobDescription 
        "jdExtracted": getFormattedJobDescription(jobDataState),
        "jobId": jobDataState?.id,
        "jobPortal": 'worko',
      }

		//  Step 1: Check Profile Completion
		setCurrStep(0);
		const { response: profilePer } = await httpServiceObj.get<any>(`/user/${userDetails.email}/profilePercentage`, true);
		if (profilePer) {
			const cvCurPerc = profilePer?.candidate[2]?.curPerc;
      setCurrStep(1);
			if (cvCurPerc === 0) {
				setGaugeEnabled(false)
				setMessageEnabled(true);
				setModalType('profileCompletion');
				setLoader(false);
				return;
			}
		}

		//  Step 3: Create Referral Request
		setCurrStep(2);
		
		const CreateReferrakPayload = data

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
			MatchingScore(refCreated.referralRequestId, userDetails.email!, setLoader, setMessageEnabled, setModalType, setGaugeEnabled, setGaugeScore,setFeedbackInfo,setIsFeedbackOpen,updateExternalJobApplication);
		}
  }
}
  }
  function ModalAction() {
		switch (ModalType) {
			case 'zeroReferral':
				window.location.href = '/v1/candidate/subscription';
				break;
			case 'AlreadyRequested':
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'RequestAccepted':
				window.location.href = '/v1/candidate/jobs/applied';
				break;
			case 'RequestRejected':
				setLoader(false);
				setMessageEnabled(false);
				setIsFeedbackOpen(true);
				break;
			case 'Error_250':
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'Error_251':
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'Max_tries':
				setLoader(false);
				setMessageEnabled(false);
				break;
			case 'profileCompletion':
				window.location.href = '/v1/candidate/edit-profile';
				break;
		}
	}

  if (isLoading) return <MainLoader />;

 
  // Use jobDataState which will be updated from the useEffect
  const displayData = jobDataState || jobData;

  if (!displayData) return <div>Loading job data...</div>;

  return (
    <div className="w-full ">
     {jobDataState && (
  <>
    <HeadBanner jobData={jobDataState} applicationStatus={applicationStatus || hasAlreadyApplied} handleApplyClick={handleApplyClick} />
    <JobJD jobData={jobDataState} applicationStatus={applicationStatus || hasAlreadyApplied} handleApplyClick={handleApplyClick} />
  </>
)}

      {isLoader && <ReferralLoader step={currStep} />}
      {MessageEnabled && <RequestReferralMessage Type={ModalType} gaugeScore={gaugeScore} gaugeEnabled={gaugeEnabled} onClose={() => ModalAction()} />}
      {IsFeedbackOpen && (
        <FeedbackModal
          title={FeedbackInfo?.title || ""}
          details={FeedbackInfo?.details || ""}
          onClose={() => {
            setIsFeedbackOpen(false);
            setLoader(false);
            setMessageEnabled(false);
          }}
        />
      )}

      {/* Will show modal after clicking apply on external job. */}
      {showApplyModal && modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}
    </div>
  );
};

export default JobDescription;