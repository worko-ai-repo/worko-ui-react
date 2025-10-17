import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import CustomButtonWithButton from "../../Shared/CustomButtonWithButton";
import SignupForm from "./SignupForm";
import {
  AuthFormDto,
  AuthSignupBaseDto,
  DevEmployeeDto,
  CognitoSignupResponse,
  DevCandidateDto,
  AwsS3FileUploadResponse,
  AuthLoginForGeneralUserDto,
} from "@Interfaces/Auth.dto";
import CognitoServiceObj from "@Utils/Cognito.utils";
import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import httpServiceObj from "@Services/ApiHandler.service";
import { auth_bg, auth_bg2 } from "@Assets";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@Context/App.context";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import { currentSession } from "../Login/LoginForm";
import { CompanyShortDto, UserBasicDetailsDto } from "@Interfaces/JobsAndCompany.dto";
import { getToastOptions } from "@Utils/Toast.utils";
import ReferralLoader from "@Components/ReferralRequest/ReferralLoader";
import MessageModal from "@Components/Modals/MessageModal";
import { useCrossAppAuth } from "@Hooks/useCrossAppAuth.hook";
import { NormalizedUser, normalizeUserData } from "@Utils/NormalizeUser";

export type SignupMode = "EMP" | "CAND";
interface ToggleOptionsDto {
  label: string;
  value: SignupMode;
}

const Signup = () => {
  const navigateTo = useNavigate();
  const { setPendingApply, tempCvFile, PendingApply, isLoggedIn, setUpdateCheck, setUserDetails } =
    useAppContext();
  const appHref = useCrossAppAuth();
  const location = useLocation(); // Get location object
  // Remove initialFrame variable
  // let initialFrame: SignupMode = 'CAND'; // Default to 'CAND'
  const [currStep, setCurrStep] = useState<0 | 1 | 2 | 3 | 4>(0); // Current step of the loader
  const APP_API_URI = import.meta.env.APP_API_URI;

  // Set activeFrame from URL param on mount
  const getInitialFrame = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get("mode");
    if (mode === "EMP" || mode === "CAND") return mode as SignupMode;
    return "CAND";
  };
  const [activeFrame, setActiveFrame] = useState<SignupMode>(getInitialFrame());

  // Keep URL param in sync with activeFrame
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", activeFrame);
    window.history.replaceState({}, "", url.toString());
  }, [activeFrame]);

  // If the user is already logged in, redirect
  useLayoutEffect(() => {
    if (isLoggedIn) {
      navigateTo("/");
    }
  }, [isLoggedIn, navigateTo]);

  const [cv, setCv] = useState<FileList | null>(null);
  const [CompanyDetails, setCompanyDetails] = useState<CompanyShortDto | undefined>(undefined);
  const [OpenReferralLoader, setOpenReferralLoader] = useState<boolean>(false);
  const [resumeUserFileName, setResumeUserFileName] = useState<string>("");
  const [resumeUserFileMimeType, setResumeUserFileMimeType] = useState<string>("");
  const [modalData, setModalData] = useState<{
    type: "none" | "error" | "warning" | "success" | "info";
    heading?: { message: string; type: "error" | "warning" | "success" | "info" };
    message: string;
    buttons?: {
      label: string;
      action: () => void;
      type?: "primary" | "danger" | "warning" | "success";
    }[];
  } | null>(null);

  const [formData, setFormData] = useState<AuthSignupBaseDto>({
    name: "",
    emailId: "",
/*     ctc: 0,
    ectc: 0, */
    password: "",
    candidateOtp: "",
    phoneNumber: "",
    confirmPassword: "",
    checkboxChecked: false,
    acceptedTermsAndConditions: false,
    companySk: "",
  });

  const options: ToggleOptionsDto[] = [
    { label: "Candidate/Job Seeker", value: "CAND" },
    { label: "Employee/Referee", value: "EMP" },
  ];

  const [CognitoResponse, setCognitoResponse] = useState<CognitoSignupResponse | null>(null);
  /**
   * check if the user is already logged in
   */
  useLayoutEffect(() => {
    if (isLoggedIn) {
      navigateTo("/");
    }
  }, []);

  /**
   * metaDataFilter
   *
   * @description This function is used to filter the meta data according to the frame we are in
   * Validates all required fields before processing
   *
   * @param data - Form data from the signup form
   * @throws Error if required fields are missing or invalid
   */
  const metaDataFilter = (data: AuthFormDto): File | null => {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new Error("Name is required");
    }
    if (!data.email || data.email.trim().length === 0) {
      throw new Error("Email is required");
    }
    if (!data.password || data.password.trim().length === 0) {
      throw new Error("Password is required");
    }
    if (!data.phone || data.phone.trim().length === 0) {
      throw new Error("Phone number is required");
    }
    if (!data.termsAndConditions) {
      throw new Error("Terms and conditions must be accepted");
    }

    // Update the form data with validated values
    setFormData((prev) => ({
      ...prev,
      name: data.name.trim(),
      emailId: data.email.trim().toLowerCase(),
      password: data.password,
      phoneNumber: data.phone.trim(),
      confirmPassword: data.confirmPassword,
      acceptedTermsAndConditions: data.termsAndConditions,
    }));

    if (activeFrame === "CAND") {
      // Validate CTC values
/*       const ctc = data.ctc ?? 0;
      const ectc = data.ectc ?? 0;

      if (ctc < 0 || ectc < 0) {
        throw new Error("CTC values cannot be negative");
      } */

      setFormData((prev) => ({
        ...prev,
      /*   ectc: ectc,
        ctc: ctc, */
      }));

      // Handle CV file: prefer uploaded from form; fallback to tempCvFile from context
      let resumeFile: File | null = null;
      if (data.cv && data.cv.length > 0) {
        resumeFile = data.cv[0] as File;
      } else if (tempCvFile) {
        resumeFile = tempCvFile;
      }

      if (resumeFile) {
        // Validate file type and size
        if (resumeFile.type !== "application/pdf") {
          throw new Error("Only PDF files are allowed for CV");
        }
        if (resumeFile.size > 2 * 1024 * 1024) {
          throw new Error("CV file size must be less than 2MB");
        }

        setResumeUserFileName(resumeFile.name);
        setResumeUserFileMimeType(resumeFile.type);
        // Do not rely on async state for upload flow; return the file instead
        if (data.cv && data.cv.length > 0) {
          setCv(data.cv);
        }
        return resumeFile;
      } else {
        throw new Error("CV file is required for candidates");
      }
    } else {
      // Validate company selection for employees
      if (!data.company || data.company.trim().length === 0) {
        throw new Error("Company selection is required for employees");
      }
      setFormData((prev) => ({
        ...prev,
        companySk: data.company.trim(),
      }));
      return null;
    }
  };

  // Build a processed snapshot from current submit data to avoid stale state usage
  const buildProcessedForm = (data: AuthFormDto): AuthSignupBaseDto => {
    const base: AuthSignupBaseDto = {
      name: data.name.trim(),
      emailId: data.email.trim().toLowerCase(),
      password: data.password,
      candidateOtp: "",
      phoneNumber: data.phone.trim(),
      confirmPassword: data.confirmPassword,
      checkboxChecked: false,
      acceptedTermsAndConditions: !!data.termsAndConditions,
      /* ctc: activeFrame === "CAND" ? data.ctc ?? 0 : 0,
      ectc: activeFrame === "CAND" ? data.ectc ?? 0 : 0, */
      companySk: activeFrame === "EMP" ? data.company?.trim() ?? "" : "",
    };
    return base;
  };

  /**
   * initiateFinalRedirection
   *
   * @description This function is used to redirect the user to the final page after the signup process is completed
   */
  const initiateFinalRedirection = () => {
    // Retrieve pending referral data from context and secure storage
    let pendingReferral =
      PendingApply ||
      secureStorage.getItem<continueReferralRequestDataDto>(
        SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS
      );

    // Sync PendingApply and secureStorage
    if (
      PendingApply &&
      !secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)
    ) {
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
    } else if (
      !PendingApply &&
      secureStorage.getItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS)
    ) {
      setPendingApply(pendingReferral);
    }

    if (PendingApply) {
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, PendingApply);
      window.location.href = PendingApply.url; // Redirect to the referral page
    } else {
      const AuthActiveFrame = localStorage.getItem("AuthActiveFrame");
      const finalActiveFrame = AuthActiveFrame ? (AuthActiveFrame as SignupMode) : activeFrame;
      // prefer local over state
      finalActiveFrame === "CAND"
        ? navigateTo("/jobs", { replace: true })
        : appHref(`/${import.meta.env.APP_PROXY_DASH}/employee/profile`); // Redirect to the home page
    }
  };
  /**
   * checkBasicDetails
   *
   * @description This function is used to check if the user has completed the basic details or not
   */
  const checkBasicDetails = async () => {
    let retryCount = 0;
    const maxRetries = 3;

    const attemptCheck = async () => {
      try {
        if (activeFrame === "EMP") {
           initiateFinalRedirection();
          //  window.location.href = "/post-signup-form";
        } else {
          window.location.href = "/post-signup-form";
         /*  if (retryCount === 0) {
            setOpenReferralLoader(true);
          }
          const { response, error } = await httpServiceObj.get<UserBasicDetailsDto>(
            `${APP_API_URI}/user/basic-details`,
            true,
            {},
            true
          );

          if (error) throw error;

          const designation = response?.candidateExperience?.designation;
          const coreSkills = response?.coreSkills?.map((skill) => skill.skillName);

          // If either designation or coreSkills exist, update filters
          if (response?.cvExtractParsed && (designation || coreSkills?.length || response?.YOE)) {
            setOpenReferralLoader(false);
            initiateFinalRedirection();
          } else {
            // setOpenReferralLoader(false);
            // Check if we should retry
            if (retryCount < maxRetries) {
              retryCount++;
              setCurrStep((prev) => (prev < 4 ? ((prev + 1) as 0 | 1 | 2 | 3 | 4) : prev));
              setTimeout(attemptCheck, 5000); // Retry after 5 seconds
            } else {
              setOpenReferralLoader(false);
              // console.log("Max retries reached for checkBasicDetails");
              // Optional: Show a message to the user that we couldn't get their details
              toast.warning(
                "Could not retrieve user details after multiple attempts",
                getToastOptions()
              );
              setTimeout(() => {
                (window.location.href = `/jobs`), { replace: true };
              }, 5000); // Redirect to the jobs page after 5 seconds
            }
          } */
        }
      } catch (error) {
        console.error("Error fetching user basic details:", error);
        const params = import.meta.env.APP_WORKO_BASE_URL + "/jobs";
        setModalData({
          type: "error",
          heading: { message: "Something Went Wrong", type: "error" },
          message:
            "We encountered some issue while analysing your cv, Plese enter few details manually in your profile , It will help us understand your better & upload your cv again",
          buttons: [
            {
              label: "Go To Dashboard",
              action: () =>
                appHref(`/${import.meta.env.APP_PROXY_DASH}/candidate/profile?returnUrl=${params}`),
            },
          ],
        });
      }
    };

    // Start the first attempt
    await attemptCheck();
  };

  const handleAutoLogin = async (data: any): Promise<void> => {
    const loginData = {
      email: data.email,
      password: data.password,
    };

    try {
      const { response, error } = await CognitoServiceObj.handleSignIn(loginData);
      // If error occurs, show the error message and reset the form
      if (error) {
        toast.error(error.message, getToastOptions());
        window.location.href = "/auth/login"; // Navigate to the login page if an error occurs
      } else {
        /**
         * If the account is confirmed, proceed with the sign-in process
         */
        if (response?.isSignedIn) {
          const email = data.email.toLowerCase();
          const { response: userResponse, error: userError } = await httpServiceObj.get<[{}]>(
            `/user/${email}/details`,
            true,
            {}
          );

          if (userError) {
            toast.error("Error: " + userError, getToastOptions());
            throw new Error();
          } else {
            // Extract the first element from the array response
            const user: NormalizedUser = normalizeUserData(userResponse?.[0] || {});
            setUserDetails(user);

            if (!user) {
              toast.error("Error: No user data found", getToastOptions());
              throw new Error();
            }

            // Store user details
            secureStorage.setItem(SecureStorageKeyEnum.LASTACCESSEDDASH, user.lastAccessedDash);
            secureStorage.setItem(SecureStorageKeyEnum.USERNAME, user.fullName);
            secureStorage.setItem<NormalizedUser>(SecureStorageKeyEnum.LOGINDETAILS, user);

            await currentSession();
            setUpdateCheck((prev) => !prev);
            toast.success("Successfully signed in", getToastOptions());
            checkBasicDetails();
          }
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong", getToastOptions());
      // CognitoServiceObj.handleSignOut();
    }
  };

  /**
   * handleVerifyOtp
   */
  const handleVerifyOtp = async (email: string, otp: string, password: string) => {
    try {
      let signupform = {
        username: email,
        confirmationCode: otp,
      };
      let autoLoginData = {
        email: email,
        password: password,
      };
      // Call handleSignUpConfirmation and await the result
      const { response, error } = await CognitoServiceObj.handleSignUpConfirmation(signupform);

      // Check if the confirmation was successful
      if (response) {
        toast.success("User registered successfully", getToastOptions());
        await handleAutoLogin(autoLoginData);
        // Handle the confirmed sign-up as needed
        return { response: response };
      } else if (error) {
        throw error;
      }
      // If no response or error was encountered, return a default value
      throw new Error("Unexpected error: No response or error.");
    } catch (error: any) {
      toast.error(error.message, getToastOptions());
    }
  };

  /**
   * CvS3MemAllocation
   *
   * @description This function is used to allocate the memory to the CV from dev server and return the URL to upload the CV
   */
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };
  const CvS3MemAllocation = useCallback(
    async (userdata: any, emailIdForPatch: string, file: File) => {
      // Validate required data
      if (!userdata?.userId) {
        throw new Error("User ID is required for CV upload");
      }
      if (!file) {
        throw new Error("CV file is required for upload");
      }

      // Derive name/mime from the selected file if not present in state
      const derivedFileName = resumeUserFileName || file.name;
      const derivedMimeType = resumeUserFileMimeType || file.type;
      if (!derivedFileName || !derivedMimeType) {
        throw new Error("CV file information is missing");
      }

      const cvS3metaData = {
        userId: userdata.userId,
        resumeUserFileName: derivedFileName,
        resumeFileMimeType: derivedMimeType,
      };

      const { response, error } = await httpServiceObj.post<AwsS3FileUploadResponse>(
        "/file/gsu2u/USER_RESUME",
        cvS3metaData,
        true
      );

      if (error) {
        throw new Error(`Failed to get S3 upload URL: ${error.message}`);
      }

      if (!response?.awsS3SignedUrl) {
        throw new Error("Invalid S3 upload response");
      }

      // Upload to S3
      const fileUploadHandler = await httpServiceObj.put<null>(
        response.awsS3SignedUrl,
        file,
        false,
        {
          awsS3Tag: response.awsS3Tag,
          fileType: derivedMimeType,
        },
        true
      );

      if (fileUploadHandler.error) {
        throw new Error(`Failed to upload file to S3: ${fileUploadHandler.error.message}`);
      }

      // Patch the data to the backend
      const finalEmail = emailIdForPatch.toLowerCase();
      const CvNamePatchRequest = await httpServiceObj.patch<null>(
        `/user/${finalEmail}/cv`,
        {
          isCvExtracted: false,
          resume: response.cloudFileName,
          userCvFileName: (`${userdata.name}_resume.pdf`).toLowerCase(),
        },
        true
      );

      if (CvNamePatchRequest.error || CvNamePatchRequest.status !== 200) {
        throw new Error(
          `Failed to update CV reference: ${CvNamePatchRequest.error?.message || "Unknown error"}`
        );
      }

      toast.success("CV uploaded successfully", getToastOptions());
    },
    [resumeUserFileName, resumeUserFileMimeType]
  );

  /**
   * mutateDatatoBackend
   *
   * @description This function is used to add the data to the backend
   */
  const mutateDatatoBackend = useCallback(
    async (ClientId: string, processed: AuthSignupBaseDto, selectedFile: File | null) => {
      // Validate ClientId
      if (!ClientId || ClientId.trim().length === 0) {
        throw new Error("Client ID is required");
      }

      // Validate form data
      if (!processed.name || !processed.emailId || !processed.phoneNumber) {
        throw new Error("Required form data is missing");
      }

      if (activeFrame === "CAND") {
/*         // Validate candidate-specific data
        if (processed.ctc < 0 || processed.ectc < 0) {
          throw new Error("CTC values cannot be negative");
        }
 */
        const candidateData: DevCandidateDto = {
          name: processed.name.trim(),
          email: processed.emailId.toLowerCase(),
          number: "+91" + processed.phoneNumber,
          userId: ClientId,
          /* CTC: processed.ctc,
          ECTC: processed.ectc, */
          acceptedTermsAndConditions: processed.acceptedTermsAndConditions,
        };

        const { response, error } = await httpServiceObj.post(
          "/user/register/candidate",
          candidateData,
          true
        );

        if (error) {
          throw new Error(`Failed to register candidate: ${error.message}`);
        }
        if (selectedFile) {
          await CvS3MemAllocation(response, processed.emailId, selectedFile);
        }

        return response;
      } else {
        // Validate employee-specific data
        if (!CompanyDetails?.name || !CompanyDetails?.id) {
          throw new Error("Company details are required for employee registration");
        }

        const employeeData: DevEmployeeDto = {
          name: processed.name.trim(),
          email: processed.emailId.toLowerCase(),
          number: "+91" + processed.phoneNumber,
          YOE: 0,
          companyName: CompanyDetails.name,
          companySK: CompanyDetails.id,
          userId: ClientId,
          acceptedTermsAndConditions: processed.acceptedTermsAndConditions,
        };

        const { response, error } = await httpServiceObj.post(
          "/user/register/employee",
          employeeData,
          true
        );

        if (error) {
          throw new Error(`Failed to register employee: ${error.message}`);
        }

        return response;
      }
    },
    [activeFrame, CompanyDetails, CvS3MemAllocation]
  );

  const runCognitoBasicSignup = async (data: AuthFormDto): Promise<boolean> => {
    try {
      // Validate and filter form data
      const selectedFile = metaDataFilter(data);

      // Always use the latest submitted values snapshot to avoid stale state
      const processed = buildProcessedForm(data);

      const signupform = {
        password: processed.password,
        username: processed.emailId,
        name: processed.name,
        phone_number: "+91" + processed.phoneNumber,
      };

      const { response, error } = await CognitoServiceObj.handleSignUp(signupform);

      if (error) {
        // Handle specific Cognito errors
        if (error.name === "UserLambdaValidationException" && error.message.includes("PreSignUp")) {
          toast.info(
            "An account with this email already exists. Please sign in instead.",
            getToastOptions({})
          );
          return false;

          /* // Don't show toast for existing users, continue with backend registration
          console.log("User already exists in Cognito, proceeding with backend registration");
          
          // Try to get existing user ID or create a fallback
          // This is a workaround for existing users
          const { response } = await httpServiceObj.get<ApplicantDetails>(
            `/admin/user/${processed.emailId}/detail`,
            true,
            {},
            false,
          );
          
          try {
            // await mutateDatatoBackend(existingUserId, processed);
            toast.info("Account updated successfully. Please sign in.", getToastOptions());
            // Do NOT show OTP for existing users; finish early
            return true;
          } catch (backendError) {
            console.error("Backend registration failed for existing user:", backendError);
            toast.error("Account exists but setup failed. Please contact support.", getToastOptions());
            return false;
          } */
        } else {
          toast.error(error.message, getToastOptions());
          return false;
        }
      }

      if (response?.userId) {
        setCognitoResponse(response);

        try {
          // Use processed snapshot for backend mutation; ensure latest values were used to set state already
          await toast.promise(
            mutateDatatoBackend(response.userId, processed, selectedFile),
            {
              pending: "Registering user...",
              success: "User registered successfully",
              error: "Error registering user",
            },
            getToastOptions()
          );
          toast.info("OTP sent to your email. Please verify it.", getToastOptions());
          return true;
        } catch (mutationError: any) {
          console.error("Error during backend mutation:", mutationError);
          toast.error(`Registration failed: ${mutationError.message}`, getToastOptions());
          return false;
        }
      }

      throw new Error("Invalid response from Cognito signup");
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error(`Signup failed: ${err.message}`, getToastOptions());
      return false;
    }
  };

  /**
   * verifyOtp
   *
   * @description This function is used to verify the OTP entered by the user and it is the final step of the signup process
   *
   * @param otp
   * @returns
   */
  const verifyOtp = async (otp: string) => {
    return true;
  };

  /**
   * useEffect
   *
   * @description This hook is used to reset the state when the component is unmounted or activeFrame changes
   */
  useEffect(() => {
    // Reset the state when the activeFrame changes
    setFormData({
      name: "",
      emailId: "",
/*       ctc: 0,
      ectc: 0, */
      password: "",
      candidateOtp: "",
      phoneNumber: "",
      confirmPassword: "",
      checkboxChecked: false,
      acceptedTermsAndConditions: false,
      companySk: "",
    });
    setCv(null);
    setCompanyDetails(undefined);
    setResumeUserFileName("");
    setResumeUserFileMimeType("");
    setCognitoResponse(null);
    setUploadedFile(null);
  }, [activeFrame]);

  return (
    <>
      <img src={auth_bg} alt="auth_bg" className="absolute -left-20 top-10 z-10 " />
      <img src={auth_bg2} alt="auth_bg2" className="absolute z-10  bottom-10 right-0" />
      <div className=" flex justify-center relative my-2 w-full  sm:max-w-[80vw] md:w-[80vw]  md:max-w-[1000px] overflow-hidden rounded-md mx-2 sm:rounded-3xl bg-white shadow z-20 ">
        <div className="px-2 gap-2 py-5 sm:py-6  w-full flex flex-col ">
          {/* Header and toggle button */}
          <div className="  relative header flex justify-around flex-wrap w-full  items-center ">
            <p className="font-semibold text-sm md:text-xl text-gray-900 self-end ">
              {" "}
              {!tempCvFile ? "Create your account as" : "A few details for verification"}
            </p>
            {/* onToggleChange={setActiveFrame} activeFrame={activeFrame} */}
            {!tempCvFile && (
              <div className="w-[90vw] lg:w-fit min-w-[50%] lg:pl-16 ">
                <CustomButtonWithButton
                  options={options}
                  activeFrame={activeFrame}
                  setActiveFrame={setActiveFrame}
                />
              </div>
            )}
          </div>
          {/* Signup form */}
          <div className="scale-90 sm:scale-100  flex mt-2 flex-1 sm:mx-auto sm:w-[85%] ">
            <SignupForm
              activeFrame={activeFrame}
              runCognitoBasicSignup={runCognitoBasicSignup}
              handleVerifyOtp={handleVerifyOtp}
              verifyOtp={verifyOtp}
              onFileUpload={handleFileUpload}
              setCompanyName={setCompanyDetails}
            />
          </div>
        </div>
      </div>
      {/* Show modal only when modalData is set */}
      {modalData && (
        <MessageModal
          {...modalData}
          onClose={() => {
            setModalData(null);
          }}
          showCloseButton={false}
        />
      )}

      {OpenReferralLoader && <ReferralLoader step={currStep} />}
    </>
  );
};

export default Signup;
