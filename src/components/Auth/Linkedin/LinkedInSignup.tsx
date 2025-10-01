import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AuthSessionDto } from "./LinkedInSignupForm";
import {
  AuthFormDto,
  AuthSignupBaseDto,
  DevEmployeeDto,
  CognitoSignupResponse,
  DevCandidateDto,
  AwsS3FileUploadResponse,
  FileUpload,
  AuthLoginForGeneralUserDto,
} from "@Interfaces/Auth.dto";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import httpServiceObj from "@Services/ApiHandler.service";
import { auth_bg, auth_bg2 } from "@Assets";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@Context/App.context";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
import secureStorage from "@Utils/SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { SignupMode } from "../Signup/Signup";
import { LinkedinIcon } from "lucide-react";
import LinkedInSignupForm from "./LinkedInSignupForm";
import { getToastOptions } from "@Utils/Toast.utils";
import { CompanyShortDto } from "@Interfaces/JobsAndCompany.dto";
import { NormalizedUser, normalizeUserData } from "@Utils/NormalizeUser";
import { UserRole } from "@Interfaces/RoleBasedAccessControl";

const LinkedInSignup = () => {
  const location = useLocation();
  const navigateTo = useNavigate();

  const { setUserDetails, setUpdateCheck } = useAppContext();
  const [activeFrame, setActiveFrame] = useState<SignupMode>("CAND");
  const [cv, setCv] = useState<File>();
  const [resumeUserFileName, setResumeUserFileName] = useState<string>("");
  const [resumeUserFileMimeType, setResumeUserFileMimeType] = useState<string>("");
  const [companySk, setCompanySk] = useState<string>("");
  const [CompanyDetails, setCompanyDetails] = useState<CompanyShortDto>();

  // State variables for form data
  const [formData, setFormData] = useState<AuthSignupBaseDto>({
    name: "",
    emailId: "",
    password: "",
    candidateOtp: "",
    phoneNumber: "",
    companyEmailId: "",
    department: "",
    confirmPassword: "",
    checkboxChecked: false,
    acceptedTermsAndConditions: false,
  /*   ctc: 0,
    ectc: 0, */
  });

  /**
   * fetchLinkedinSessionData - a callback function to fetch the linkedin session data
   */
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const [userName, setUserName] = useState<string | undefined>();
  const [groupType, setGroupType] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | undefined>();

  const fetchLinkedinSessionData = useCallback(async (): Promise<AuthSessionDto> => {
    try {
      const { tokens } = await fetchAuthSession();
      const email = tokens?.idToken?.payload["email"]?.toString().toLowerCase();
      const name = tokens?.idToken?.payload["name"]?.toString();
      const groups = tokens?.idToken?.payload["cognito:groups"];

      if (Array.isArray(groups) && groups.includes("admin")) {
        secureStorage.setItem(SecureStorageKeyEnum.USERTYPE, [UserRole.ADMIN]);
      }

      const { userId: id } = await getCurrentUser();

      // Update state
      setUserEmail(email);
      setUserName(name);
      setGroupType(
        Array.isArray(groups)
          ? groups.filter((group): group is string => typeof group === "string")
          : []
      );
      setUserId(id);

      return {
        name: name!,
        email: email!,
        cognitoId: id,
      };
    } catch (error: any) {
      throw new Error("Error fetching LinkedIn session data: " + error.message);
    }
  }, []);

  /**
   * check if the user is already logged in
   */
  useLayoutEffect(
    () => {
      // debugger;
      // console.log('Linkedin location State is >>', location.state);
      if (!location.state) {
        navigateTo("/");
      }
      if (location.state.formType === "CAND") {
        setActiveFrame("CAND");
      }
      if (location.state.formType === "EMP") {
        setActiveFrame("EMP");
      }
    },
    [
      /* isLoggedIn, location.state */
    ]
  );

  /**
   * metaDataFilter
   *
   * @description This function is used to filter the meta data according to the frame we are in
   *
   * @param data
   */
  const metaDataFilter = (data: AuthFormDto) => {
    // Update form data using state setter to ensure reactivity
    setFormData((prev) => ({
      ...prev,
      name: data.name,
      emailId: data.email,
      password: data.password,
      phoneNumber: data.phone,
      department: data.department,
      acceptedTermsAndConditions: data.termsAndConditions,
    }));

    // Handle different cases for candidates and companies
    if (activeFrame === "CAND") {
      // For candidates, set the CTC and ECTC values
      setFormData((prev) => ({
        ...prev,
/*         ctc: data.ctc || 0,
        ectc: data.ectc || 0, */
      }));
      let resumeFile: File | null = null;
      if (data.cv && data.cv.length > 0) {
        resumeFile = data.cv[0] as File;
      }
      if (resumeFile) {
        setResumeUserFileName(resumeFile?.name ?? "");
        setResumeUserFileMimeType(resumeFile?.type ?? "application/pdf");
      }
      setCv(data.cv[0] || null);
    } else {
      setCompanySk(data.company);
      setFormData((prev) => ({
        ...prev,
        companyEmailId: data.companyEmailId,
      }));
    }
  };
  const cvS3Mutation = useMutation({
    mutationFn: async (cvS3metaData: any) => {
      const { response, error } = await httpServiceObj.post<AwsS3FileUploadResponse>(
        "/file/gsu2u/USER_RESUME",
        cvS3metaData,
        true
      );
      if (error) {
        throw new Error("Failed to allocate S3 memory");
      }
      return response;
    },
    retry: 3,
  });
  /**
   * CvS3MemAllocation
   *
   * @description This function is used to allocate the memory to the CV from dev server and return the URL to upload the CV
   */
  const CvS3MemAllocation = useCallback(async () => {
    const cvS3metaData = {
      userId: userId || "", // Ensure `CognitoResponse` is valid
      resumeUserFileName: resumeUserFileName,
      resumeFileMimeType: resumeUserFileMimeType,
    };

    // const { response, error } = await httpServiceObj.post<AwsS3FileUploadResponse>('/file/gsu2u/USER_RESUME', cvS3metaData, true);
    const response = await cvS3Mutation.mutateAsync(cvS3metaData);

    // Upload to S3
    const metaData: FileUpload = {
      file: cv,
      awsS3Tag: response?.awsS3Tag,
    };

    const signedUrl: string = response?.awsS3SignedUrl || "";
    const fileUploadHandler = await httpServiceObj.put<null>(
      signedUrl,
      metaData.file,
      false,
      { awsS3Tag: metaData.awsS3Tag, fileType: resumeUserFileMimeType },
      true
    );

    if (fileUploadHandler.error) {
      throw fileUploadHandler.error;
    } else {
      // Patch the data to the backend
      // debugger;
      const CvNamePatchRequest = await httpServiceObj.patch<null>(
        `/user/${formData.emailId}/cv`,
        {
          isCvExtracted: false,
          resume: response?.cloudFileName,
          userCvFileName: (`${formData.name}_resume.pdf`).toLowerCase(),
        },
        true
      );

      if (CvNamePatchRequest.status !== 200) {
        throw CvNamePatchRequest.error;
      } else {
        toast.success("CV uploaded successfully", getToastOptions());
      }
    }
  }, [cv, resumeUserFileName, resumeUserFileMimeType]);

  /**
   * mutateDatatoBackend
   *
   * @description This function is used to add the data to the backend
   */
  const mutateDatatoBackend =
    /* useCallback( */
    async (ClientId: string) => {
      // Check the mode and add the data accordingly
      // debugger;
      // console.log('mutateDatatoBackend', activeFrame);
      if (activeFrame === "CAND") {
        // Add the data to the backend
        let candidateData: DevCandidateDto = {
          name: formData.name,
          email: formData.emailId,
          number: "+91" + formData.phoneNumber,
          userId: ClientId,
          acceptedTermsAndConditions: formData.acceptedTermsAndConditions, // Include the acceptedTermsAndConditions field
        /*   CTC: formData.ctc,
          ECTC: formData.ectc, */
        };
        // Add the data to the backend
        const { response, error } = await httpServiceObj.post(
          "/user/register/candidate",
          candidateData,
          true
        );
        if (error) {
          throw error;
        } else {
          await httpServiceObj.patch(
            `/user/${candidateData.email}/details`,
            { isAlreadyVerifiedInCognito: true, isEmailVerified: true },
            true,
            {},
            false
          );
          await CvS3MemAllocation();
        }
      } else {
        // Add the data to the backend
        let employeeData: DevEmployeeDto = {
          name: formData.name,
          email: formData.emailId,
          number: "+91" + formData.phoneNumber,
          YOE: 0,
          department: formData.department,
          companyEmailId: formData.companyEmailId,
          companyName: CompanyDetails?.name || "", // Use the company name from the state
          companySK: companySk,
          userId: ClientId,
          acceptedTermsAndConditions: formData.acceptedTermsAndConditions, // Include the acceptedTermsAndConditions field
        };

        // Add the data to the backend
        const { status, error } = await httpServiceObj.post(
          "/user/register/employee",
          employeeData,
          true
        );
        await httpServiceObj.patch(
          `/user/${employeeData.email}/details`,
          { isAlreadyVerifiedInCognito: true, isEmailVerified: true },
          true,
          {},
          false
        );
        if (error) {
          throw error;
        }
        if (status === 200) {
          const { response: userResponse, error: userError } = await httpServiceObj.get<[{}]>(
            `/user/${formData.emailId}/details`,
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
            // Refresh session
            setUpdateCheck((prev) => !prev);
          }
        }
      }
    };
  // [activeFrame, formData, companySk, CompanyName]
  // );

  /**
   * runCognitoBasicSignup
   *
   * @description This function is used to run the cognito basic signup to register user at Cognito and pass the data to the next step
   * @param data
   */
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (clientId: string) => {
      return await toast.promise(
        mutateDatatoBackend(clientId),
        {
          pending: "Registering user...",
        },
        getToastOptions()
      );
    },
    onError: (error) => {
      console.error("Submission failed:", error);
      toast.error("Error registering user", getToastOptions());
    },
  });
  /**
   * handleVerifyOtp
   */

  const handleDataMutationtoDb = async (data: any) => {
    try {
      metaDataFilter(data); // Process the data first
      await mutateAsync(userId!); // Wait for the mutation to complete
      return true; // Return true only after successful mutation
    } catch (error: any) {
      toast.error(error.message, getToastOptions());
      return false; // Return false if an error occurs
    }
  };

  useEffect(() => {
    // console.log('active frame changed', activeFrame);
  }, [activeFrame]);

  return (
    <>
      <img src={auth_bg} alt="auth_bg" className="absolute -left-20 top-10 z-10 " />
      <img src={auth_bg2} alt="auth_bg2" className="absolute z-10  bottom-10 right-0" />
      <div className=" flex justify-center relative mt-10 w-full  sm:max-w-[80vw] md:w-[80vw]  md:max-w-[900px] overflow-hidden rounded-md mx-2 sm:rounded-3xl bg-white shadow z-20 ">
        <div className=" flex justify-center relative w-full min-h-[250px] md:min-w-[50%]  max-w-[1120px] overflow-hidden rounded-lg bg-white shadow z-20 ">
          <div className="px-2 gap-2 py-5 sm:py-6  w-full flex flex-col ">
            {/* Header and toggle button */}
            <div className="  relative header flex justify-between px-[5%]  flex-wrap w-full  items-center ">
              <p className="font-semibold text-sm md:text-xl text-gray-900 self-center my-2 ">
                {" "}
                Create your account as {activeFrame === "EMP" ? "employee" : "candidate"}{" "}
              </p>
              <LinkedinIcon className="  bg-blue-500 text-white p-2 rounded-lg box-content " />
            </div>
            {/* Signup form */}
            <div className="scale-90 sm:scale-100  flex flex-1 sm:mx-auto sm:w-[90%] ">
              <LinkedInSignupForm
                activeFrame={activeFrame}
                handleDataMutationtoDb={handleDataMutationtoDb}
                setCompanyName={setCompanyDetails}
                fetchLinkedinSessionData={fetchLinkedinSessionData}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkedInSignup;
