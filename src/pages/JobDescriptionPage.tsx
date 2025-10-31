import React, { Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import httpServiceObj from "@Services/ApiHandler.service";
import MainLoader from "@Components/Loader/Loader";
import {
  CompanyDto,
  JobApplicationExternalDto,
  JobApplicationInternalDto,
  JobDto,
  JobMatchingScoreDto,
  UserBasicDetailsDto,
} from "@Interfaces/JobsAndCompany.dto";
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
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { ApiCallResponse } from "@Interfaces/HttpOption.dto";
import { handleEditProfileRedirection } from "@Components/Company/CompanyJobContent";
import UpdateResumeModal from "@Components/Modals/UpdateResumeModal";
import { compareResumeWithJD } from "@Utils/CompareResumeWithJD.utils";
import { NormalizedUser } from "@Utils/NormalizeUser";

interface initialMatchingScoreDetails {
  finalScore: number;
  jobId: string;
  matchRank: number;
}

const HeadBanner = React.lazy(() => import("@Components/JobDescription/HeadBanner"));
const JobJD = React.lazy(() => import("@Components/JobDescription/JobJD"));

const fetchUserBasicDetails = async () => {
  const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(
    `${import.meta.env.APP_API_URI}/user/basic-details`,
    true,
    {},
    true
  );
  if (error) throw error;
  return response;
};

const JobDescription = () => {
  // check if the use is logged in
  const { setPendingApply, isLoggedIn, userDetails } = useAppContext() as {
    PendingApply: continueReferralRequestDataDto | null;
    setPendingApply: React.Dispatch<React.SetStateAction<continueReferralRequestDataDto | null>>;
    isLoggedIn: boolean;
    userDetails: NormalizedUser;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };

  // navigate to a different page
  const nav = useNavigate();

  // get the current location
  const location = useLocation();

  // States For Internal Apply
  const [isLoader, setLoader] = useState(false); // Show loader when the form is submitted
  const [MessageEnabled, setMessageEnabled] = useState(false); // Show message when the form is submitted
  const [currStep, setCurrStep] = useState<0 | 1 | 2 | 3 | 4>(0); // Current step of the loader
  const [ModalType, setModalType] = useState<
    | "zeroReferral"
    | "profileCompletion"
    | "AlreadyRequested"
    | "RequestAccepted"
    | "RequestRejected"
    | "Error_250"
    | "Error_251"
    | "Max_tries"
  >("zeroReferral"); // Current step of the loader
  const [gaugeEnabled, setGaugeEnabled] = useState(false); // Show gauge when the form is submitted
  const [gaugeScore, setGaugeScore] = useState(0); // Show gauge when the form is submitted
  const [IsFeedbackOpen, setIsFeedbackOpen] = useState(false); // Show feedback modal when the form is submitted
  const [FeedbackInfo, setFeedbackInfo] = useState<FeedbackModalProps>();

  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const { jobid } = useParams();
  const [jobDataState, setJobDataState] = useState<JobDto | undefined>(() => {
    const job = (location.state as any)?.FullJob;

    // Clear location state after extracting the data
    if (job) {
      window.history.replaceState({}, document.title);
    }

    return job;
  });
  const [isApplying, setIsApplying] = useState(false);
  const [updateResume, setUpdateResume] = useState(false);
  const [modalData, setModalData] = useState<MessagePopupProps | null>(null);
  const [globalMatchingScore, setGlobalMatchingScore] = useState<number | -1>(-1);
  const [applicationStatus, setApplicationStatus] = useState<boolean>(false);
  const [isProfileCheckComplete, setIsProfileCheckComplete] = useState(false); // Track profile check completion
  const [jobMatchDetails, setJobMatchDetails] = useState<JobMatchingScoreDto>({
    id: "",
    userId: "",
    jobId: "",
    jdMatchErrorCode: 0,
    jdMatchErrorDesc: "",
    matchingScore: -1,
    scoreDetails: {
      coreSkills: -1,
      experience: -1,
      roleAndResponsibilities: -1,
      softSkills: -1,
    },
    createdAt: "",
    updatedAt: "",
    isTriggered: false,
  });
  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI;

  const { data, isSuccess } = useQuery({
    queryKey: ["userBasicDetails"],
    queryFn: fetchUserBasicDetails,
    refetchOnWindowFocus: false,
  });

  async function fetchMatchingScore(job: JobDto) {
    try {
      const { response: finalScoreData, error: finalScoreError } = await httpServiceObj.get<{
        initialMatchingScoreDetails: initialMatchingScoreDetails;
      }>(
        `${APP_JOBS_API_URI}/job/${job?.id}/s3-vector`,
        true,
        {
          coreSkills: data?.coreSkills?.map((skill) => skill.skillName).join(",") || "",
          YOE: data?.YOE || 0,
        },
        true
      );

      if (finalScoreError) throw finalScoreError;
      if (finalScoreData && job) {
        // Patch that score in finalScore of the job finalscore
        job.initialMatchingScoreDetails = finalScoreData.initialMatchingScoreDetails;
      }
    } catch (error) {
      console.error("Error fetching matching score:", error);
    }
  }
  useEffect(() => {
    if (!isSuccess || !data) return;

    const processUserData = async () => {
      const designation = data?.candidateExperience?.designation;
      const coreSkills = data?.coreSkills?.map((s) => s.skillName);
      const yoe = data?.YOE;
      const isProfileComplete =
        data &&
        "CTC" in data &&
        data?.isCvExtracted === true &&
        (designation || coreSkills?.length > 0 || yoe);
      const jobDescription = jobDataState ?? jobData ?? null;
      if (jobDescription && !jobDescription.initialMatchingScoreDetails)
        await fetchMatchingScore(jobDataState ?? jobData ?? ({} as JobDto));

      if (isProfileComplete) {
        const cvExtract = data?.isCvExtracted === true;

        if (cvExtract && jobDescription) {
          const {
            totalScore,
            coreSkillsScore,
            softSkillsScore,
            experienceScore,
            responsibilitiesScore,
          } = compareResumeWithJD(jobDescription, data);
          // console.log("Matching Score:", matchingScore);

          setJobMatchDetails((prev) => ({
            ...prev,
            id: prev?.id || "",
            userId: prev?.userId || "",
            jobId: prev?.jobId || "",
            jdMatchErrorCode: prev?.jdMatchErrorCode || 0,
            jdMatchErrorDesc: prev?.jdMatchErrorDesc || "",
            matchingScore: totalScore,
            scoreDetails: {
              coreSkills: coreSkillsScore,
              experience: experienceScore,
              roleAndResponsibilities: responsibilitiesScore,
              softSkills: softSkillsScore,
            },
            createdAt: prev?.createdAt || "",
            updatedAt: prev?.updatedAt || "",
            isTriggered: prev?.isTriggered || false,
          }));
        }
        // Mark profile check as complete only after all validations pass
        setIsProfileCheckComplete(true);
      } else {
        if (!coreSkills || coreSkills.length === 0 || !yoe || !("CTC" in data)) {
          // If core skills or yoe or CTC is missing, prompt to update profile
          const continueReferralRequestData = {
            type: "referral",
            url: window.location.href,
            data: null,
          };
          setPendingApply(continueReferralRequestData);
          secureStorage.setItem(
            SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS,
            continueReferralRequestData
          );
          localStorage.setItem(
            "continueReferralRequestData",
            JSON.stringify(continueReferralRequestData)
          );
          setShowApplyModal(true);
          showModalsError("NoBasicDetailsWithoutCv");
          // Don't mark as complete since profile is incomplete
          setIsProfileCheckComplete(false);
          return;
        }
        setShowApplyModal(true);
        showModalsError("NoBasicDetails");
        // Don't mark as complete since profile is incomplete
        setIsProfileCheckComplete(false);
      }
    };

    processUserData();
  }, [isSuccess, data, jobDataState]);

  // This effect will run when the component mounts or when jobid changes
  // It will set the jobDataState from location state if available
  useEffect(() => {
    const job = (location.state as any)?.FullJob;
    if (job) {
      setJobDataState(job);
      window.history.replaceState({}, document.title); // Clean up state again
      setApplicationStatus(false); // Reset application status
    }
  }, [location, jobid]); // Depends on jobid or location change

  // Add this new function to check application status
  const checkApplicationStatus = async (retryCount = 0) => {
    if (!isLoggedIn || !jobDataState) return;

    try {
      const userEmail =
        secureStorage.getItem<string>(SecureStorageKeyEnum.USEREMAIL) || userDetails.email;
      const { response, status } = await httpServiceObj.get<{
        data: JobApplicationExternalDto[] | JobApplicationInternalDto[];
        pagination: object;
      }>(
        `${APP_JOBS_API_URI}/${
          jobDataState?.externalJobId ? "external-" : ""
        }job-application/${jobid}/${userEmail}`,
        true,
        {},
        true
      );
      if (status === 404) {
        setApplicationStatus(false); // Set application status to true if data is present
      } else {
        setApplicationStatus(true);
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

  /*   useEffect(() => {

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
 */
  // Function to show error modals
  const showModalsError = (
    caseType:
      | "isExternalJobApplied"
      | "expired_in"
      | "application_success"
      | "application_failure"
      | "redundant"
      | "badScore"
      | "NoBasicDetails"
      | "NoBasicDetailsWithoutCv"
  ) => {
    switch (caseType) {
      case "isExternalJobApplied":
        setModalData({
          type: "info",
          heading: { message: "Have you applied for this job?", type: "info" },
          size: "md",
          buttons: [
            {
              label: "No",
              type: "danger",
              action: () => {
                setShowApplyModal(false);
                setModalData(null);
              },
            },
            {
              label: "Yes",
              action: () => {
                updateExternalJobApplication();
                setModalData(null);
                setShowApplyModal(false);
              },
              type: "primary",
            },
          ],
        });
        break;
      case "expired_in":
        setModalData({
          type: "error",
          heading: { message: "Invite Expired", type: "error" },
          message:
            "The invite you are trying to access has expired. Please contact the company for a new invite.",
          buttons: [{ label: "Back to Home", action: () => null }],
        });
        break;
      case "application_success":
        setModalData({
          type: "success",
          heading: { message: "Application Submitted", type: "success" },
          message: "Your job application has been successfully submitted!",
          buttons: [
            {
              label: "OK",
              type: "primary",
              action: () => {
                setModalData(null);
              },
            },
          ],
        });
        break;
      case "redundant":
        setModalData({
          type: "error",
          heading: { message: "Already submitted", type: "error" },
          message: "You have already applied for this job. Check your dashboard for reference.",
          buttons: [
            {
              label: "OK",
              type: "primary",
              action: () => {
                setModalData(null);
              },
            },
          ],
        });
        break;
      case "application_failure":
        setModalData({
          type: "error",
          heading: { message: "Application Failed", type: "error" },
          message: "We couldn't submit your application. Please try again later.",
          buttons: [
            {
              label: "OK",
              type: "danger",
              action: () => {
                setModalData(null);
              },
            },
          ],
        });
        break;
      case "badScore":
        setModalData({
          type: "error",
          heading: { message: "Failed to apply", type: "error" },
          message:
            "It looks like you've managed to submit an application before the matching scores were fully processed. While your score generation is in process, please note that bypassing standard checks won’t affect the evaluation process. Matching insights will be available shortly. Kindly try again in a few minutes.",
          buttons: [
            {
              label: "OK",
              type: "danger",
              action: () => {
                setModalData(null);
              },
            },
          ],
        });
        break;
      case "NoBasicDetails":
        setModalData({
          type: "error",
          heading: { message: "Profile Incomplete", type: "error" },
          message:
            "It looks like your profile is incomplete. Please click the button below to update your resume.",
          buttons: [
            {
              label: "Update Resume",
              action: () => {
                setUpdateResume(true);
                setModalData(null);
                setShowApplyModal(false);
              },
              type: "primary",
            },
          ],
        });
        break;
      case "NoBasicDetailsWithoutCv":
        setModalData({
          type: "error",
          heading: { message: "Profile Incomplete", type: "error" },
          message:
            "It looks like your profile is incomplete. Please click the button below to update your Profile.",
          buttons: [
            {
              label: "Update Profile",
              action: () => {
                window.location.href = "/post-signup-form";
                setModalData(null);
                setShowApplyModal(false);
              },
              type: "primary",
            },
          ],
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
   * Modal to handle promise for low score
   * @description - It will handle the promise for low score modal.
   * @param type
   * @returns
   */
  const showModalPromise = (type: "lowScore"): Promise<boolean> => {
    return new Promise((resolve) => {
      if (type === "lowScore") {
        setModalData({
          type: "warning",
          heading: { message: "Low Score Detected!", type: "warning" },
          message:
            "Your matching score is low. We recommend improving your profile before applying. If you still want to apply, please click on the button below.",
          buttons: [
            {
              label: "Apply Anyway",
              type: "danger",
              action: () => {
                setModalData(null);
                resolve(true); // Proceed
              },
            },
            {
              label: "Cancel",
              type: "primary",
              action: () => {
                setModalData(null);
                resolve(false); // Break the flow
              },
            },
          ],
        });
      }
    });
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
    enabled: !!jobid && !jobDataState,
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
    return <div>Error loading job: {error instanceof Error ? error.message : "Unknown error"}</div>;

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
      const urlParams = new URLSearchParams(window.location.search);
      const referAndEarnId = urlParams.get("referAndEarnId");
      let payload;
      if (jobDataState?.externalJobId) {
        payload = {
          jobId: jobDataState?.id,
          jobPortal: jobDataState?.jobUrl || undefined,
          jobUrl: window.location.href,
          // companyName:  jobDataState?.companyName,
          matchingScore: jobMatchDetails.matchingScore || 0,
        };
      } else {
        payload = {
          jobId: jobDataState?.id,
          companyName: jobDataState?.companyName || jobDataState?.companyDetails?.name,
          jobPortal: "worko",
          matchingScore: jobMatchDetails.matchingScore || 0,
          ...(referAndEarnId ? { referAndEarnId } : {}), //conditionally check if referAndEarnId exists.
        };
      }

      const constructUrl = jobDataState?.externalJobId
        ? `${APP_JOBS_API_URI}/external-job-application/`
        : `${APP_JOBS_API_URI}/job-application/`;

      const result = (await toast.promise(
        httpServiceObj.post(constructUrl, payload, true, {}, true),
        {
          pending: "Applying...",
          error: "Failed to submit application",
        },
        getToastOptions()
      )) as ApiCallResponse;

      const { response, error, status } = result;

      if (status === 403) {
        setApplicationStatus(true);
        setShowApplyModal(true);
        // Show success modal after redundant application
        showModalsError("redundant");
        return;
      }
      if (error) {
        throw new Error(error.message || "Failed to submit application");
      } else {
        setApplicationStatus(true);
        setShowApplyModal(true);
        // Show success modal after successful application
        showModalsError("application_success");
      }
    } catch (error) {
      console.error("Application error:", error);
      setApplicationStatus(false);
      // Show failure modal if application fails
      showModalsError("application_failure");
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
        type: "referral",
        url: window.location.href,
        data: null,
      };
      setPendingApply(continueReferralRequestData);
      secureStorage.setItem(
        SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS,
        continueReferralRequestData
      );
      localStorage.setItem(
        "continueReferralRequestData",
        JSON.stringify(continueReferralRequestData)
      );
      nav("/auth/login");
      return;
    } else {
      // Open the job URL in a new tab if available
      if (jobDataState?.externalJobId && jobDataState?.jobUrl) {
        window.open(jobDataState.jobUrl, "_blank");
        // Show the confirmation modal
        setShowApplyModal(true);
        showModalsError("isExternalJobApplied");
      } else {
        // If the scores are very Low then warn the user
        /*  if (jobMatchDetails && jobMatchDetails.matchingScore < 30) {
          if (jobMatchDetails.matchingScore < 0) {
            setShowApplyModal(true);
            showModalsError("badScore");
            return;
          } else {
            setShowApplyModal(true);
            const proceed = await showModalPromise("lowScore");
            if (!proceed) return; // User cancelled, break the flow
          }
        } */
        setCurrStep(0);
        // this was commented because backend no longer needs profilePercentage
        // const { response: profilePer } = await httpServiceObj.get<any>(`/user/${userDetails.email}/profilePercentage`, true);
        // if (profilePer) {
        //   const cvCurPerc = profilePer?.candidate[2]?.curPerc;
        //   setCurrStep(1);
        //   if (cvCurPerc === 0) {
        //     setGaugeEnabled(false);
        //     setMessageEnabled(true);
        //     setModalType("profileCompletion");
        //     setLoader(false);
        //     return;
        //   }
        // }
        // Step 2: Apply for the job
        updateExternalJobApplication();
      }
    }
  }
  function ModalAction() {
    switch (ModalType) {
      case "profileCompletion":
        handleEditProfileRedirection((userDetails?.lastAccessedDash as "CAND" | "EMP") || "CAND");
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
        <Suspense fallback={<MainLoader />}>
          <HeadBanner
            jobData={jobDataState}
            applicationStatus={applicationStatus}
            handleApplyClick={handleApplyClick}
            jobMatchDetails={jobMatchDetails}
            isProfileCheckComplete={isProfileCheckComplete}
          />
          <JobJD
            jobData={jobDataState}
            applicationStatus={applicationStatus}
            handleApplyClick={handleApplyClick}
            jobMatchDetails={jobMatchDetails}
            isProfileCheckComplete={isProfileCheckComplete}
          />
        </Suspense>
      )}

      {isLoader && <ReferralLoader step={currStep} />}
      {MessageEnabled && (
        <RequestReferralMessage
          Type={ModalType}
          gaugeScore={gaugeScore}
          gaugeEnabled={gaugeEnabled}
          onClose={() => ModalAction()}
        />
      )}
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
      {showApplyModal && modalData && (
        <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />
      )}
      {updateResume && <UpdateResumeModal onClose={() => setUpdateResume(false)} />}
    </div>
  );
};

export default JobDescription;
