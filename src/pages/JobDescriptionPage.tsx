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
import { set } from "react-hook-form";


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
  const [modalData, setModalData] = useState<MessagePopupProps | null>(null);
  const [globalMatchingScore, setGlobalMatchingScore] = useState<number | 0>(0)
  const [applicationStatus, setApplicationStatus] = useState<boolean>(false);
  const [jobMatchDetails , setJobMatchDetails] = useState<JobMatchingScoreDto | undefined>(undefined);

  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI
  const APP_API_URI = import.meta.env.APP_API_URI


// Add this new function to check application status
const checkApplicationStatus = async () => {
  if (!isLoggedIn || !jobDataState) return;
  
  try {
    const { response, error, status } = await httpServiceObj.get<{data:[JobMatchingScoreDto], pagination:Object}>(
      `${APP_JOBS_API_URI}/user-matching-score-job/?jobIds=${jobid}`,
      true,
      {},
      true
    );
    
    // Check each item in the array for status property
    if (response?.data[0]) {
      const fullData = response.data[0];
      if (fullData.status) {
        // set the status correctly
        setApplicationStatus(true);
      } else {
        setApplicationStatus(false);
      }
      if(fullData.scoreDetails)
      {
        // set the score details correctly
        fullData.scoreDetails = JSON.parse(fullData.scoreDetails);
        // console.log(JSON.parse(fullData.scoreDetails))
      }
      // set the job match details
         setJobMatchDetails(fullData);
      // Check if matching score is present and set it
        setGlobalMatchingScore(fullData.matchingScore || 0);
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
        `${APP_JOBS_API_URI}/job/${jobid}`,
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
      let payload;
      if(jobDataState?.externalJobId) {
        // debugger;
        payload = {
          jobId: jobDataState?.id,
          jobPortal: jobDataState?.jobUrl || undefined,
          jobUrl: window.location.href,
          matchingScore:globalMatchingScore || 0,
        };
      }
      else{
        payload = {
          jobId: jobDataState?.id,
          companyName: jobData?.companyName || jobDataState?.companyDetails?.name,
          jobPortal: 'worko',
          matchingScore: jobDataState?.matchingScore || undefined,
        };
      }

      const constructUrl = jobData?.externalJobId
        ? `${APP_JOBS_API_URI}/external-job-application/`
        : `${APP_JOBS_API_URI}/job-application/`;

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
    // Step 2: Apply for the job
    updateExternalJobApplication();
  }
}
  }
  function ModalAction() {
		switch (ModalType) {
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
    <HeadBanner jobData={jobDataState} applicationStatus={applicationStatus} handleApplyClick={handleApplyClick} jobMatchDetails={jobMatchDetails}/>
    <JobJD jobData={jobDataState} applicationStatus={applicationStatus } handleApplyClick={handleApplyClick} />
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