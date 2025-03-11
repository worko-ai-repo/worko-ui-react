import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import HeadBanner from "@Components/JobDescription/HeadBanner/index";
import JobJD from "@Components/JobDescription/JobJD";
import httpServiceObj from "@Services/ApiHandler.service";
import MainLoader from "@Components/Loader/Loader";
import { CompanyDto, JobDto } from "@Interfaces/JobsAndCompany.dto";
import MessageModal from "@Components/Modals/MessageModal";

const JobDescription = () => {
  const [showApplyModal, setShowApplyModal] = useState<boolean>(false);
  const { jobid } = useParams();
  const [jobDataState, setJobDataState] = useState<JobDto | undefined>(
    undefined
  );
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<boolean>(false);

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

  // Use jobDataState which will be updated from the useEffect
  const displayData = jobDataState || jobData;

  if (!displayData) return <div>Loading job data...</div>;

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
        }), //@vaibhav check this previously it was company why?
      };

      const endpoint = "https://jobs.dev.worko.work/external-job-application/"; //For internal job-> : 'https://jobs.dev.worko.work/job-application/';

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
      }
    } catch (error) {
      console.error("Application error:", error);
      setApplicationStatus(false);
    } finally {
      setIsApplying(false);
    }
  };

  /*
   *Handle Apply Click function
   */
  const handleApplyClick = () => {
    // Open the job URL in a new tab if available
    if (jobData?.externalJobId && jobData?.jobUrl) {
      window.open(jobData.jobUrl, "_blank");
    } else {
      window.alert("Job URL not available"); //@Implement Ashutosh ApplyJob
    }
    // Show the confirmation modal
    setShowApplyModal(true);
  };

  return (
    <div className="w-full ">
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

      {/* Will show modal after clicking apply on external job. */}
      {showApplyModal && (
        <MessageModal
          type="info"
          size="lg"
          heading={{ type: "info", message: "Application Confirmation" }}
          message="Did you complete the application process?"
          onClose={() => setShowApplyModal(false)}
          showCloseButton={false}
          buttons={[
            {
              label: "Yes",
              action: () => {
                updateExternalJobApplication();
                setShowApplyModal(false);
              },
              type: "success",
            },
            {
              label: "No",
              action: () => {
                setShowApplyModal(false);
              },
              type: "danger",
            },
          ]}
        />
      )}
    </div>
  );
};

export default JobDescription;
