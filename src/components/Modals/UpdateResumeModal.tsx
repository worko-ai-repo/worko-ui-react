import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./modals.module.scss";
import { TriangleAlert } from "lucide-react";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import httpServiceObj from "@Services/ApiHandler.service";
import { AwsS3FileUploadResponse, FileUpload } from "@Interfaces/Auth.dto";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";
import { getCurrentUser, GetCurrentUserOutput } from "@aws-amplify/auth";
import ResumeDropzone from "@Components/Shared/ResumeDropZone";
import { useAppContext } from "@Context/App.context";
import CVParsingPopup from "./CVParsingPopup";

interface CvS3MetaData {
  userId: string;
  resumeUserFileName: string;
  resumeFileMimeType: string;
}

const UpdateResumeModal = ({ onClose }: { onClose: () => void }) => {
  const {userDetails} = useAppContext();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFinaltick, setShowFinalTick] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileError, setFileError] = useState<string | undefined>(undefined);
  const [secondStepEnabled, setSecondStepEnabled] = useState(false);
  const [retrySteps, setRetrySteps] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  const content = {
    0: "Analizing your resume...",
    1: "Extracting your skills...",
    2: "Processing your data...",
    3: "Refining jobs based on your skills...",
    4: "Finalizing the setup...",
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      setFileName("");
      setSelectedFile(null); // reset
    } else if (file.size > 2 * 1024 * 1024) {
      setFileError("File must be less than 2MB.");
      setFileName("");
      setSelectedFile(null); // reset
    } else {
      setFileError("");
      setFileName(file.name);
      setSelectedFile(file); // set the selected file
    }
  };

  const simulateProgressAndClose = () => {
    let step = 1;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;
        if (nextStep >= 4) {
          setShowFinalTick(true);
          clearInterval(interval);
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 2000); // small delay before closing
          return 4;
        }
        return nextStep as 0 | 1 | 2 | 3 | 4;
      });
      step++;
    }, 1000); // show each step for 1s
  };

  const retryCountRef = useRef(0); // Persist retry count across function calls

  const attemptCheck = async () => {
    const maxRetries = 4;
    try {
      if (retryCountRef.current === 0) {
        setSecondStepEnabled(true);
      }

      const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(
        `${import.meta.env.APP_API_URI}/user/basic-details`,
        true,
        {},
        true
      );

      if (error) throw error;

      const hasRelevantData = response && 'isCvExtracted' in response && response.isCvExtracted === true;

      // Always show message for user
      // toast.info("Checking your profile details...", getToastOptions());

      if (hasRelevantData) {
        simulateProgressAndClose();
      } else {
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current += 1;
          setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as 0 | 1 | 2 | 3 | 4) : prev));
          setTimeout(attemptCheck, 8000);
        } else {
          toast.warning(
            "Could not retrieve user details after multiple attempts. Please write to us at support@worko.ai",
            getToastOptions()
          );
          setShowFinalTick(true);
          setRetrySteps(true);
          // reset all fields
          setFileName(undefined);
          setFileError(undefined);
          setSelectedFile(null);
          setCurrentStep(0);
          retryCountRef.current = 0;
        }
      }
    } catch (error) {
      console.error("Error in attemptCheck:", error);
      toast.error("An error occurred while checking user details", getToastOptions());
    }
  };

  /**
   * * Function to handle the file upload process
   * @returns {Promise<void>} - A promise that resolves when the file upload is complete.
   */
  const handleUpdateResume = useCallback(async () => {
    if (!selectedFile) {
      setFileError("Please select a PDF file before uploading.");
      return;
    }

    const resumeUserFileMimeType = selectedFile.type;
    const user: GetCurrentUserOutput = await getCurrentUser();

    const userId = user.userId;

    const cvS3metaData: CvS3MetaData = {
      userId,
      resumeUserFileName: selectedFile?.name ?? "unnamed_resume",
      resumeFileMimeType: resumeUserFileMimeType ?? "application/pdf", // Default to PDF if not provided
    };

    const { response, error } = await httpServiceObj.post<AwsS3FileUploadResponse>(
      "/file/gsu2u/USER_RESUME",
      cvS3metaData,
      true
    );

    if (error) {
      console.error("Error getting signed URL:", error);
      return;
    }

    const signedUrl: string = response?.awsS3SignedUrl || "";
    const awsS3Tag = response?.awsS3Tag;

    if (!selectedFile || selectedFile.size === 0 || !selectedFile.name || !selectedFile.type) {
      console.error("Invalid or empty file");
      setFileError("Invalid or empty file.");
      return;
    }

    const uploadResult = await httpServiceObj.put<null>(
      signedUrl,
      selectedFile,
      false,
      { awsS3Tag, fileType: resumeUserFileMimeType },
      true
    );

    if (uploadResult.error) {
      console.error("Error uploading file:", uploadResult.error);
      return;
    }

    // PATCH resume name to user
    const finalEmail = secureStorage.getItem(SecureStorageKeyEnum.USEREMAIL);
    const patchResult = await httpServiceObj.patch<null>(
      `/user/${finalEmail}/cv`,
      {
        isCvExtracted: false,
        resume: response?.cloudFileName,
        userCvFileName: `${userDetails?.fullName}_resume.pdf`.toLowerCase(),
      },
      true
    );

    if (patchResult.status !== 200) {
      console.error("Error patching CV name:", patchResult.error);
      return;
    }

    toast.success("CV uploaded successfully", getToastOptions());
    setSecondStepEnabled(true);
    await attemptCheck(); // Start the check after successful upload
  }, [selectedFile, userDetails?.fullName]);

  return (
    <div className="overflow-y-hidden fixed inset-0 flex items-center justify-center bg-black/50 w-full backdrop-blur-sm z-50  ">
      <div
        id={secondStepEnabled ? styles.updateResumeHeader : undefined}
        className={` max-sm:w-11/12 bg-white rounded-xl  overflow-hidden shadow-xl transform transition-transform opacity-1 animate-fadeIn w-full max-sm:min-h-[200px] min-h-[350px] ax-w-full sm:max-w-xl `}>
        {secondStepEnabled && (
          <CVParsingPopup
          isInitial={false}
          onClose={()=>{onClose(); window.location.reload();}}
        />
      /*     <div className="">
            <div className="absolute bottom-0 w-full">
              <svg
                className={styles.waves}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
                shape-rendering="auto">
                <defs>
                  <path
                    id="gentle-wave"
                    d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
                  />
                </defs>
                <g className={styles.parallax}>
                  <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
                  <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
                  <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
                  <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
                </g>
              </svg>
            </div>
            {showFinaltick ? (
              <div className="content relative top-16 text-2xl font-semibold animate-pulse left-0 ">
                {retrySteps ? (
                  <>
                    <i
                      className="fa-solid fa-rotate-right cursor-pointer"
                      onClick={() => {
                        setShowFinalTick(false);
                        setSecondStepEnabled(false);
                        setRetrySteps(false);
                      }}></i>{" "}
                    <span
                      onClick={() => {
                        setShowFinalTick(false);
                        setSecondStepEnabled(false);
                        setRetrySteps(false);
                      }}
                      className="cursor-pointer">
                      Click here to retry.
                    </span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-circle-check"></i> <span>Process Complete</span>
                  </>
                )}
              </div>
            ) : (
              <div className="content relative top-16 text-2xl font-semibold animate-pulse left-0 ">
                {content[currentStep]}
              </div>
            )}
          </div> */
        )}

        {!secondStepEnabled && (
          <div className="uploadCvBox w-11/12 mx-auto mt-8 mb-8">
            <h2 className="text-xl font-semibold text-blue-300 mb-5">Update Your Resume</h2>
            <ResumeDropzone
              fileName={fileName}
              fileError={fileError}
              onFileSelect={handleFileSelect}
              onUpdateResume={handleUpdateResume}
            />
            <small className="flex mt-2  gap-1 text-left text-xs text-gray-500  ">
              <TriangleAlert className="text-yellow-500 inline text-xs w-5 " /> Your Cv must be in
              readable format and should not contain any scanned document
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateResumeModal;
