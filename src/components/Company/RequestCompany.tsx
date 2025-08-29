import { useForm } from "react-hook-form";
import { emailDomainDenyListValidator } from "@Utils/CorporateMailValidator.utils";
import httpServiceObj from "@Services/ApiHandler.service";
import { validationRules } from "@Utils/FormValidator.utils";
import { toast } from "react-toastify";
import { AuthLoginForGeneralUserDto } from "@Interfaces/Auth.dto";
import { getToastOptions } from "@Utils/Toast.utils";
import { useAppContext } from "@Context/App.context";
import secureStorage from "@Utils/SecureStorage.utils";
import { useEffect } from "react";
import { continueReferralRequestDataDto } from "@Pages/request-referral/RequestReferral";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { useNavigate } from "react-router-dom";
import { NormalizedUser } from "@Utils/NormalizeUser";

export interface RequestCompanyFormData {
  userType: string;
  userEmail: string;
  userContactNumber: string;
  userName: string;
  jobUrl?: string;
  companyDetail: {
    name: string;
    industry: string;
    carrierPage: string;
    linkedIn: string;
  };
}

interface RequestCompanyDto {
  userDetails: NormalizedUser | null;
  isLoggedIn: boolean;
  PendingApply: continueReferralRequestDataDto<any> | null;
  setPendingApply: React.Dispatch<React.SetStateAction<continueReferralRequestDataDto<any> | null>>;
}

const RequestCompany = ({ userType }: { userType: Partial<AuthLoginForGeneralUserDto>  }) => {
  const navigateTo = useNavigate();
  const { userDetails, isLoggedIn, PendingApply, setPendingApply }: RequestCompanyDto = useAppContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<RequestCompanyFormData>({ mode: "onChange" });
  // console.log(userType)

  useEffect(() => {
    const pendingReferral = PendingApply || secureStorage.getItem<continueReferralRequestDataDto<RequestCompanyFormData>>(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS);

    if (pendingReferral && isLoggedIn && pendingReferral.data) {
      // Patch the form data safely

      reset(pendingReferral.data);

      // Remove from storage *after* submitting
      setPendingApply(null);
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, null);

      handleSubmit(onSubmit)(); // Call submit function
    }
  }, [isLoggedIn, PendingApply]);

  const onSubmit = async (data: RequestCompanyFormData) => {
    if (!isLoggedIn) {
      const continueReferralRequestData: continueReferralRequestDataDto<RequestCompanyFormData> = {
        type: "filter",
        url: window.location.href,
        data,
      };
      setPendingApply(continueReferralRequestData);
      secureStorage.setItem(SecureStorageKeyEnum.CONTINUEPENDINGPRESIGNEDPROCESS, continueReferralRequestData);
      localStorage.setItem("continueReferralRequestData", JSON.stringify(continueReferralRequestData));
      navigateTo("/auth/login");
      return;
    }

    const requestData = { ...data, userType: userType || "" };

    try {
      // Populate additional user details from context
      requestData.companyDetail.industry = "Industry";
      if (userDetails) {
        const { fullName: userName = "", email: userEmail = "", lastAccessedDash: userType = "" } = userDetails;
        Object.assign(requestData, { userName, userEmail, userType });
      }
      const response = await httpServiceObj.post("/company/request", requestData, true);
      if (response?.status === 409) {
        toast.error("Company request has already been submitted.", getToastOptions());
      } else {
        toast.success("Company request submitted successfully!", getToastOptions());
      }
    } catch (error: any) {
      toast.error("Failed to submit request. Please try again.", getToastOptions());
    } finally {
      reset({
        userType: "",
        userEmail: "",
        userContactNumber: "",
        userName: "",
        jobUrl: "",
        companyDetail: {
          name: "",
          industry: "",
          carrierPage: "",
          linkedIn: "",
        },
      });
    }
  };

  return (
    <div className="mt-10 border-[1px] border-gray-100 rounded-2xl p-5 bg-[#FAFAFA]">
      <p className="font-semibold text-left">Can't find your desired company? Submit your details for a personalized referral!</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 mt-2">
        {/* Name (Only visible if not logged in) */}
        {!isLoggedIn && (
          <>
            <label htmlFor="name" className="font-medium text-sm text-gray-700">
              Name:
            </label>
            <input type="text" id="userName" {...register("userName", validationRules.default)} placeholder="Your Name" className="text-sm input_primary my-0 mb-1" />
            {errors.userName && <p className="text-red-500 text-left   text-xs">{errors.userName.message}</p>}
          </>
        )}

        {/* Email (Only visible if not logged in) */}
        {!isLoggedIn && (
          <>
            <label htmlFor="userEmail" className="font-medium text-sm text-gray-700">
              E-mail ID:
            </label>
            <input type="email" id="userEmail" {...register("userEmail", validationRules.email)} placeholder="Your Email" className="text-sm input_primary my-0 mb-1" />
            {errors.userEmail && <p className="text-red-500 text-left   text-xs">{errors.userEmail.message}</p>}

            <label htmlFor="userContactNumber" className="font-medium text-sm text-gray-700">
              Contact:
            </label>
            <input type="text" id="userContactNumber" {...register("userContactNumber", validationRules.phone)} placeholder="Contact Number" className="text-sm input_primary my-0 mb-1" />
            {errors.userContactNumber && <p className="text-red-500 text-left   text-xs">{errors.userContactNumber.message}</p>}
          </>
        )}

        <>
          <label htmlFor="CompanyName" className="font-medium text-sm text-gray-700">
            Company where you need a referral:
          </label>
          <input type="text" id="CompanyName" {...register("companyDetail.name", validationRules.default)} placeholder="Company Name" className="text-sm input_primary my-0 mb-1" />
          {errors.companyDetail?.name && <p className="text-red-500 text-left   text-xs">{errors.companyDetail.name.message}</p>}
        </>

        {/* Company Website */}
        <label htmlFor="carrierPage" className="font-medium text-sm text-gray-700">
          Career Page Url:
        </label>
        <input type="url" id="carrierPage" {...register("companyDetail.carrierPage", validationRules.url)} placeholder="Company Website" className="text-sm input_primary my-0 mb-1" />
        {errors.companyDetail?.carrierPage && <p className="text-red-500 text-left   text-xs">{errors.companyDetail.carrierPage.message}</p>}

        {/* Company LinkedIn */}
        <label htmlFor="linkedIn" className="font-medium text-sm text-gray-700">
          Company LinkedIn page:
        </label>
        <input type="url" id="linkedIn" {...register("companyDetail.linkedIn", validationRules.linkedInPage)} placeholder="Company LinkedIn Page" className="text-sm input_primary my-0 mb-1" />
        {errors.companyDetail?.linkedIn && <p className="text-red-500 text-left   text-xs">{errors.companyDetail.linkedIn.message}</p>}

        {/* Referral URL */}
        <label htmlFor="jobUrl" className="font-medium text-sm text-gray-700">
          Referral role URL:
        </label>
        <input type="url" id="jobUrl" {...register("jobUrl")} placeholder="Job URL for referral (if any)" className="text-sm input_primary my-0 mb-1" />

        {/* Submit */}
        <div className="flex justify-center mt-2">
          <button type="submit" className="btn_secondary text-sm hover:bg-blue-600">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestCompany;
