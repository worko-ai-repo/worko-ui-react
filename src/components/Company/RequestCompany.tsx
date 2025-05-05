import { useForm } from 'react-hook-form';
import { emailDomainDenyListValidator } from '@Utils/CorporateMailValidator.utils';
import httpServiceObj from '@Services/ApiHandler.service';
import { validationRules } from '@Utils/FormValidator.utils';
import { toast } from 'react-toastify';
import { AuthLoginForGeneralUserDto } from '@Interfaces/Auth.dto';
import secureStorage from '@Utils/SecureStorage.utils';
import { getToastOptions } from '@Utils/Toast.utils';


export interface RequestCompanyFormData {
  userType: string;
  userEmail: string;
  userContactNumber: string;
  userName: string;
  referral_role?: string;
  companyDetail: {
    name: string;
    industry: string;
    carrierPage: string;
    linkedIn: string;
  };
}

const RequestCompany = ({userType}: {userType: Partial<AuthLoginForGeneralUserDto>} ) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    reset,
  } = useForm<RequestCompanyFormData>();
  // console.log(userType)

  const onSubmit = async (data: RequestCompanyFormData) => {
    if (!emailDomainDenyListValidator(data.userEmail)) {
      setError('userEmail', {
        type: 'manual',
        message: 'Please enter a work email (not a personal email).',
      });
      return;
    }

	const requestData = { ...data, userType: userType || '' };

	try {
		const response = await httpServiceObj.post('/company/request', requestData, true);
		
		if (response?.status === 409) {
		  toast.error('Request has already been submitted.',getToastOptions());
		} else {
		  toast.success('Request submitted successfully!',getToastOptions());
		}
	  } catch (error: any) {
		toast.error('Failed to submit request. Please try again.',getToastOptions());
	  } finally {
      reset();
    }
	};

  return (
    <div className="mt-10 border-[1px] border-gray-100 rounded-2xl p-5 bg-[#FAFAFA]">
      <p className="font-semibold text-left">
        Can’t find your desired company? Submit your details for a personalized referral!
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2 mt-2">
        <input type="text" {...register('companyDetail.name', validationRules.default)} placeholder="Company Name" className="text-sm input_primary my-1" />
        {errors.companyDetail?.name && <p className="text-red-500 text-sm">{errors.companyDetail.name.message}</p>}

        <input type="text" {...register('companyDetail.industry', validationRules.default)} placeholder="Industry" className="text-sm input_primary my-1" />
        {errors.companyDetail?.industry && <p className="text-red-500 text-sm">{errors.companyDetail.industry.message}</p>}

        <input type="email" {...register('userEmail', validationRules.email)} placeholder="Work Email" className="text-sm input_primary my-1" />
        {errors.userEmail && <p className="text-red-500 text-sm">{errors.userEmail.message}</p>}

        <input type="text" {...register('userContactNumber', validationRules.phone)} placeholder="Contact Number" className="text-sm input_primary my-1" />
        {errors.userContactNumber && <p className="text-red-500 text-sm">{errors.userContactNumber.message}</p>}

        <input type="url" {...register('companyDetail.carrierPage', validationRules.url)} placeholder="Company Website" className="text-sm input_primary my-1" />
        {errors.companyDetail?.carrierPage && <p className="text-red-500 text-sm">{errors.companyDetail.carrierPage.message}</p>}

        <input type="url" {...register('companyDetail.linkedIn', validationRules.url)} placeholder="LinkedIn Page" className="text-sm input_primary my-1" />
        {errors.companyDetail?.linkedIn && <p className="text-red-500 text-sm">{errors.companyDetail.linkedIn.message}</p>}

        <div className="flex justify-center mt-2">
          <button type="submit" className="btn_secondary text-sm hover:bg-blue-600">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default RequestCompany;
