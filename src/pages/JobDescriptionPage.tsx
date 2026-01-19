import React, { Suspense, useEffect, useRef, useState } from "react";
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
import SEOHead from "@Components/SEO/SEOHead";
import { generateJobPostingSchema, generateBreadcrumbSchema } from "@Utils/JobSchema.utils";
import { generateCanonicalJobSlug, generateSlugFromJob } from "@Utils/JobUriSlug.utils";
import { doesSlugMatchJob } from "@Utils/JobSlugResolver.utils";

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
  // ============================================
  // ALL HOOKS MUST BE CALLED BEFORE ANY RETURNS
  // ============================================
  
  // Context and Router Hooks
  const { PendingApply, setPendingApply, isLoggedIn, userDetails } = useAppContext() as {
    PendingApply: continueReferralRequestDataDto | null;
    setPendingApply: React.Dispatch<React.SetStateAction<continueReferralRequestDataDto | null>>;
    isLoggedIn: boolean;
    userDetails: NormalizedUser;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  };
  const nav = useNavigate();
  const location = useLocation();
  const params = useParams();
  // Support both old format (jobid) and new format (slug)
  const jobid = params.jobid;
  const slug = params.slug;
  const companyName = params.companyName; // Legacy support

  // State Hooks
  const [isLoader, setLoader] = useState(false);
  const [MessageEnabled, setMessageEnabled] = useState(false);
  const [currStep, setCurrStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [ModalType, setModalType] = useState<
    | "zeroReferral"
    | "profileCompletion"
    | "AlreadyRequested"
    | "RequestAccepted"
    | "RequestRejected"
    | "Error_250"
    | "Error_251"
    | "Max_tries"
  >("zeroReferral");
  const [gaugeEnabled, setGaugeEnabled] = useState(false);
  const [gaugeScore, setGaugeScore] = useState(0);
  const [IsFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [FeedbackInfo, setFeedbackInfo] = useState<FeedbackModalProps>();
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const [jobDataState, setJobDataState] = useState<JobDto | undefined>(() => {
    const job = (location.state as any)?.FullJob;
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
  const [isProfileCheckComplete, setIsProfileCheckComplete] = useState(false);
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
  
  const pendingApplyHandledRef = useRef(false);
  const APP_JOBS_API_URI = import.meta.env.APP_JOBS_API_URI;

  // Query Hooks
  const { data, isSuccess } = useQuery({
    queryKey: ["userBasicDetails"],
    queryFn: fetchUserBasicDetails,
    refetchOnWindowFocus: false,
  });

  // Determine job identifier - prefer jobid, fallback to slug extraction
  const jobIdentifier = jobid || (slug ? extractJobIdFromSlug(slug) : null);
  
  const {
    data: jobData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobData", jobIdentifier],
    queryFn: async () => {
      if (!jobIdentifier) {
        throw new Error("No job identifier provided");
      }

      // Try to fetch by ID first
      const { response, error, status } = await httpServiceObj.get<JobDto>(
        `${APP_JOBS_API_URI}/job/${jobIdentifier}`,
        true,
        {},
        true
      );

      // Handle expired/deleted jobs (410 Gone)
      if (status === 410 || (error && error.message?.includes("expired"))) {
        // Set expired flag for 410 handling
        throw { status: 410, message: "Job has expired" };
      }

      if (error) throw new Error(error.message);
      if (!response) throw new Error("Job not found");

      // If we have a slug, verify it matches the job for SEO canonical URL
      if (slug && response) {
        const expectedSlug = generateSlugFromJob(response);
        if (slug !== expectedSlug && !doesSlugMatchJob(slug, response)) {
          // Redirect to canonical URL for SEO
          const canonicalSlug = generateCanonicalJobSlug(response);
          nav(canonicalSlug, { replace: true });
          return response; // Return response but URL will be updated
        }
      }

      return response;
    },
    enabled: !!jobIdentifier && !jobDataState,
    retry: 0,
  });

  // Helper to extract job ID from slug (for backward compatibility)
  function extractJobIdFromSlug(slug: string): string | null {
    // If slug ends with a number (old format), extract it
    const match = slug.match(/\/(\d+)$/);
    return match ? match[1] : null;
  }

  // Helper function for fetching matching score
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
        job.initialMatchingScoreDetails = finalScoreData.initialMatchingScoreDetails;
      }
    } catch (error) {
      console.error("Error fetching matching score:", error);
    }
  }

  // Check application status
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
        setApplicationStatus(false);
      } else {
        setApplicationStatus(true);
      }
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  };

  // Effect: Process user data and matching scores
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
        (coreSkills?.length > 0 || yoe);
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
        setIsProfileCheckComplete(true);
      } else {
        if (!coreSkills || coreSkills.length === 0 || !yoe || !("CTC" in data)) {
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
          setIsProfileCheckComplete(false);
          return;
        }
        setShowApplyModal(true);
        showModalsError("NoBasicDetails");
        setIsProfileCheckComplete(false);
      }
    };

    processUserData();
  }, [isSuccess, data, jobDataState]);

  // Effect: Update jobDataState from location
  useEffect(() => {
    const job = (location.state as any)?.FullJob;
    if (job) {
      setJobDataState(job);
      window.history.replaceState({}, document.title);
      setApplicationStatus(false);
    }
  }, [location, jobid]);

  // Effect: Check application status
  useEffect(() => {
    if (jobDataState) {
      checkApplicationStatus();
    }
  }, [jobDataState, isLoggedIn]);

  // Effect: Fetch company details
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
      setJobDataState(jobData);
    }
  }, [jobData]);

  // Effect: Handle pending apply after login
  useEffect(() => {
    if (pendingApplyHandledRef.current) return;
    if (!isLoggedIn || !isProfileCheckComplete) return;

    const targetJob = jobDataState || jobData;
    if (!targetJob) return;

    const pendingReferral =
      PendingApply ||
      secureStorage.getItem<continueReferralRequestDataDto>(
        SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS
      ) ||
      (() => {
        const local = localStorage.getItem("continueReferralRequestData");
        return local ? (JSON.parse(local) as continueReferralRequestDataDto) : null;
      })();

    if (!pendingReferral) return;

    const clearPending = () => {
      setPendingApply(null);
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, null);
      localStorage.removeItem("continueReferralRequestData");
    };

    pendingApplyHandledRef.current = true;
    setShowApplyModal(true);
    setModalData({
      type: "info",
      heading: { message: "Resume your application?", type: "info" },
      message: "You were about to apply for this job. Do you want to continue now?",
      buttons: [
        {
          label: "Not now",
          type: "danger",
          action: () => {
            clearPending();
            setModalData(null);
            setShowApplyModal(false);
          },
        },
        {
          label: "Yes, apply",
          type: "primary",
          action: () => {
            clearPending();
            setModalData(null);
            setShowApplyModal(false);
            handleApplyClick();
          },
        },
      ],
    });
  }, [PendingApply, isLoggedIn, isProfileCheckComplete, jobDataState, jobData]);

  // ============================================
  // HELPER FUNCTIONS (after all hooks)
  // ============================================

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
            "It looks like you've managed to submit an application before the matching scores were fully processed. While your score generation is in process, please note that bypassing standard checks won't affect the evaluation process. Matching insights will be available shortly. Kindly try again in a few minutes.",
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
                resolve(true);
              },
            },
            {
              label: "Cancel",
              type: "primary",
              action: () => {
                setModalData(null);
                resolve(false);
              },
            },
          ],
        });
      }
    });
  };

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
          matchingScore: jobMatchDetails.matchingScore || 0,
        };
      } else {
        payload = {
          jobId: jobDataState?.id,
          companyName: jobDataState?.companyName || jobDataState?.companyDetails?.name,
          jobPortal: "worko",
          matchingScore: jobMatchDetails.matchingScore || 0,
          ...(referAndEarnId ? { referAndEarnId } : {}),
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
        showModalsError("redundant");
        return;
      }
      if (error) {
        throw new Error(error.message || "Failed to submit application");
      } else {
        setApplicationStatus(true);
        setShowApplyModal(true);
        showModalsError("application_success");
      }
    } catch (error) {
      console.error("Application error:", error);
      setApplicationStatus(false);
      showModalsError("application_failure");
    } finally {
      setIsApplying(false);
    }
  };

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
    }

    if (jobDataState?.externalJobId && jobDataState?.jobUrl) {
      window.open(jobDataState.jobUrl, "_blank");
      setShowApplyModal(true);
      showModalsError("isExternalJobApplied");
      return;
    }

    setCurrStep(0);
    updateExternalJobApplication();
  }

  function ModalAction() {
    switch (ModalType) {
      case "profileCompletion":
        handleEditProfileRedirection((userDetails?.lastAccessedDash as "CAND" | "EMP") || "CAND");
        break;
    }
  }

  // ============================================
  // EARLY RETURNS (after all hooks)
  // ============================================

  if (isLoading) return <MainLoader />;

  // Handle expired jobs (410 Gone) - return 410 status for SEO
  if (error && (error as any).status === 410) {
    return (
      <>
        <SEOHead
          title="Job Expired - Worko"
          description="This job posting has expired and is no longer available."
          noindex={true}
          robots="noindex, nofollow"
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Job Expired</h1>
            <p className="text-gray-600 mb-6">
              This job posting has expired and is no longer available.
            </p>
            <button
              onClick={() => nav("/jobs")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Other Jobs
            </button>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEOHead
          title="Job Not Found - Worko"
          description="The job you're looking for could not be found."
          noindex={true}
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">
              {error instanceof Error ? error.message : "The job you're looking for could not be found."}
            </p>
            <button
              onClick={() => nav("/jobs")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </>
    );
  }

  const displayData = jobDataState || jobData;

  if (!displayData) {
    return <MainLoader />;
  }

  // Generate SEO metadata
  const baseUrl = import.meta.env.APP_WORKO_BASE_URL || window.location.origin;
  const companyNameSEO = displayData.companyName || displayData.companyDetails?.name || "Company";
  const jobTitle = displayData.jobTitle || "Job";
  const locationSEO = displayData.location?.fullLocation?.join(", ") || "Location";
  const experience = displayData.experienceRange
    ? `${displayData.experienceRange.min}-${displayData.experienceRange.max} years`
    : "Experience";
  
  const seoTitle = `${jobTitle} at ${companyNameSEO} - ${locationSEO} | Worko`;
  const seoDescription = displayData.jobDescription
    ? displayData.jobDescription.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
    : `Apply for ${jobTitle} at ${companyName} in ${locationSEO}. ${experience} experience required.`;
  
  const canonicalSlug = generateCanonicalJobSlug(displayData);
  const canonicalUrl = `${baseUrl}${canonicalSlug}`;
  
  // Generate Schema.org JSON-LD - combine into single script tag
  const jobSchema = generateJobPostingSchema(displayData, baseUrl);
  
  // Generate breadcrumb schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Jobs", url: `${baseUrl}/jobs` },
    { name: companyNameSEO, url: `${baseUrl}/jobs?company=${encodeURIComponent(companyNameSEO)}` },
    { name: jobTitle, url: canonicalUrl },
  ]);
  
  // Combine schemas for single JSON-LD script
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [jobSchema, breadcrumbSchema],
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`${jobTitle}, ${companyNameSEO}, jobs, ${locationSEO}, ${displayData.department || ""}, ${displayData.coreSkills?.join(", ") || ""}`}
        canonicalUrl={canonicalUrl}
        ogTitle={seoTitle}
        ogDescription={seoDescription}
        ogImage={displayData.companyDetails?.logoUrl || displayData.companyLogoUrl || `${baseUrl}/logo-text.png`}
        ogType="article"
        ogUrl={canonicalUrl}
        twitterCard="summary_large_image"
        twitterTitle={seoTitle}
        twitterDescription={seoDescription}
        twitterImage={displayData.companyDetails?.logoUrl || displayData.companyLogoUrl || `${baseUrl}/logo-text.png`}
        schemaJsonLd={combinedSchema}
      />
      <div className="w-full ">
        {displayData && (
          <Suspense fallback={<MainLoader />}>
            <HeadBanner
              jobData={displayData}
              applicationStatus={applicationStatus}
              handleApplyClick={handleApplyClick}
              jobMatchDetails={jobMatchDetails}
              isProfileCheckComplete={isProfileCheckComplete}
            />
            <JobJD
              jobData={displayData}
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

      {showApplyModal && modalData && (
        <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />
      )}
      {updateResume && <UpdateResumeModal onClose={() => setUpdateResume(false)} />}
      </div>
    </>
  );
};

export default JobDescription;