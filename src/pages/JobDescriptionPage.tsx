import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HeadBanner from "@Components/JobDescription/HeadBanner/index";
import JobJD from "@Components/JobDescription/JobJD";
import httpServiceObj from "@Services/ApiHandler.service";
import MainLoader from "@Components/Loader/Loader";
import { CompanyDto, JobDto } from "@Interfaces/JobsAndCompany.dto";
import MessageModal from "@Components/Modals/MessageModal";
import { MessagePopupProps } from "@Components/Modals/MessageModal";

const JobDescription = () => {
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const { jobid } = useParams();
  const [jobDataState, setJobDataState] = useState<JobDto | undefined>(undefined);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<boolean>(false);
  const [modalData, setModalData] = useState<MessagePopupProps | null>(null);

  // Function to show error modals
  const showModalsError = (caseType: 'isExternalJobApplied' | 'expired_in' | 'application_success' | 'application_failure') => {
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
          const { response, error } = await httpServiceObj.get<CompanyDto>(
            `/company/${jobData.companyId}`,
            true
          );

          if (error) throw new Error(error.message);
          if (response)
            setJobDataState({
              ...jobData,
              companyDetails: response,
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
          companyName: jobData?.companyName || jobData?.companyName,
        }),
      };

      const endpoint = "https://jobs.dev.worko.work/external-job-application/";

      const { response, error } = await httpServiceObj.post(
        endpoint,
        payload,
        true,
        {},
        true
      );

      

      if (error) {
        throw new Error(error.message || "Failed to submit application");
      } else {
        setApplicationStatus(true);
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
  const handleApplyClick = () => {
    // Open the job URL in a new tab if available
    if (jobData?.externalJobId && jobData?.jobUrl) {
      window.open(jobData.jobUrl, "_blank");
      // Show the confirmation modal
    setShowApplyModal(true);
    showModalsError('isExternalJobApplied');

    } else {updateExternalJobApplication()}
  };

  if (isLoading) return <MainLoader />;

  if (error)
    return (
      <div>
        Error loading job:{" "}
        {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );

  // Use jobDataState which will be updated from the useEffect
  const displayData = jobDataState || jobData;

  if (!displayData) return <div>Loading job data...</div>;

  return (
    <div className="w-full">
      <HeadBanner
        jobData={displayData}
        applicationStatus={applicationStatus}
        handleApplyClick={handleApplyClick}
      />

      <JobJD
        jobData={displayData}
        applicationStatus={applicationStatus}
        handleApplyClick={handleApplyClick}
      />

      {/* Display modal when modalData exists */}
      {modalData && (
        <MessageModal
          {...modalData}
          onClose={() => {
            setModalData(null);
            setShowApplyModal(false);
          }}
          showCloseButton={false}
        />
      )}
    </div>
  );
};

export default JobDescription;