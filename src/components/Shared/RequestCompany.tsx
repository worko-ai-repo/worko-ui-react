import { RequestCompanyFormData } from "@Components/Company/RequestCompany";
import CustomModal from "@Components/Modals/FormModal";
import httpServiceObj from "@Services/ApiHandler.service";
import { useMutation } from "@tanstack/react-query";
import { validationRules } from "@Utils/FormValidator.utils";
import { getToastOptions } from "@Utils/Toast.utils";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const RequestCompany: React.FC<{ setShowModal: React.Dispatch<React.SetStateAction<boolean>> }> = ({ setShowModal }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RequestCompanyFormData>({
    defaultValues: {
      companyDetail: {
        industry: "Industry",
        linkedIn: "",
        carrierPage: "",
        name: "",
      },
      userName: "",
      userEmail: "",
      userType: "EMP",
      userContactNumber: "",
      jobUrl: "",
    },
    mode: "onChange",
  });

  const postCompReq = useCallback(async (data: any) => {
    const { response, error, status } = await httpServiceObj.post("/company/request", data, true);

    if (status === 409) {
      toast.error("Request already submitted", getToastOptions());
      setShowModal(false);
      return null;
    } else if (error) {
      toast.error("Error submitting", getToastOptions());
      setShowModal(false);
      return null;
    } else {
      toast.success("Submitted successfully", getToastOptions());
      setShowModal(false);
      return response;
    }
  }, []);

  const mutation = useMutation({
    mutationFn: postCompReq,
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <CustomModal type="share" title="Request to add company" onSubmit={handleSubmit(onSubmit)} isdisabled={!isValid} onClose={() => setShowModal(false)}>
      <form className="space-y-4">
        <div>
          <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Name :</label>
          <input type="text" className="input_primary text-semibold text-gray-500" placeholder="Enter Your Name" {...register("userName", validationRules.name)} />
          {errors.userName && <p className="text-red-500 text-xs italic">{errors.userName?.message}</p>}
        </div>

        <div>
          <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Contact Number :</label>
          <input type="text" className="input_primary text-semibold text-gray-500" placeholder="Enter Your Contact Number" {...register("userContactNumber", validationRules.phone)} />
          {errors.userContactNumber && <p className="text-red-500 text-xs italic">{errors.userContactNumber?.message}</p>}
        </div>

        <div>
          <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Email :</label>
          <input type="text" className="input_primary text-semibold text-gray-500" placeholder="Enter Your Email" {...register("userEmail", validationRules.email)} />
          {errors.userEmail && <p className="text-red-500 text-xs italic">{errors.userEmail?.message}</p>}
        </div>

        <div>
          <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Company :</label>
          <input type="text" className="input_primary text-semibold text-gray-500" placeholder="Enter Company Name" {...register("companyDetail.name", validationRules.companyName)} />
          {errors.companyDetail?.name && <p className="text-red-500 text-xs italic">{errors.companyDetail?.name?.message}</p>}
        </div>
        <div>
          <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">LinkedIn :</label>
          <input type="text" className="input_primary text-semibold text-gray-500" placeholder="Enter Linkedin Page" {...register("companyDetail.linkedIn", validationRules.linkedInPage)} />
          {errors.companyDetail?.linkedIn && <p className="text-red-500 text-xs italic">{errors.companyDetail?.linkedIn?.message}</p>}
        </div>
        <div>
          <label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Career :</label>
          <input type="text" className="input_primary text-semibold text-gray-500" placeholder="Enter Career Page" {...register("companyDetail.carrierPage", validationRules.url)} />
          {errors.companyDetail?.carrierPage && <p className="text-red-500 text-xs italic">{errors.companyDetail?.carrierPage?.message}</p>}
        </div>
      </form>
    </CustomModal>
  );
};

export default RequestCompany;
