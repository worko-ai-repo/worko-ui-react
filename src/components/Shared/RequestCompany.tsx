import CustomModal from '@Components/Modals/FormModal';
import { useMutation } from '@tanstack/react-query';
import { validationRules } from '@Utils/FormValidator.utils';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

const RequestCompany:React.FC<{
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}> = ( {setShowModal}) => {

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: {
            companyDetail: {
                industry: '',
                linkedIn: '',
                careerPage: '',
            },
            userType: 'EMP',
        },
        mode: 'onChange', // Enables real-time validation
    });

	const postCompReq = useCallback<() => Promise<void>>(async () => {
		// const { response, error } = await httpServiceObj.post('/company', formData);
		const x = await fetch('https://dummyjson.com/posts/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: 'I am in love with someone.',
				userId: 5,
				/* other post data */
			}),
		})
			.then(res => res.json())
			.then(console.log);
		return x;
		// if (error) throw error;
		// return response.data;
	}, []);

	const mutation = useMutation({
        mutationFn: async () => {
          return toast.promise(postCompReq(), {
            pending: 'Submitting...',
            success: 'Submitted successfully',
            error: 'Error submitting',
          });
        },
        onSuccess: () => {
          setShowModal(false);
          console.log('Company request submitted successfully!');
          // Handle success-specific logic here
        },
        onError: (error) => {
          console.error('Submission failed:', error);
          // Handle error-specific logic here
        },
      });
      
	const onSubmit = () => {
		console.log('Form submitted');
		mutation.mutate(); // This triggers the API call
	};
    console.log('Form State', isValid , errors);
	return (
		<CustomModal
			type="share"
			title="Request to add company"
			onSubmit={handleSubmit(onSubmit)}
			isdisabled={!isValid}
			onClose={() => {
				setShowModal(false);
				/* setSelectedCompany(null);
				setSearchText(''); */
			}}>
			<form className="space-y-4 ">
				<div>
					<label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Company :</label>
					<input type="text" className="input_primary text-semibold text-gray-500 " placeholder="Enter Company Name" {...register('companyDetail.industry', validationRules.name)} />
					{errors.companyDetail?.industry && <p className="text-red-500 text-xs italic">{errors.companyDetail?.industry?.message}</p>}
				</div>
				<div>
					<label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">LinkedIn :</label>
					<input type="text" className="input_primary text-semibold text-gray-500" placeholder="Enter Linkedin Page" {...register('companyDetail.linkedIn', validationRules.linkedInPage)} />
					{errors.companyDetail?.linkedIn && <p className="text-red-500 text-xs italic">{errors.companyDetail?.linkedIn?.message}</p>}
				</div>
				<div>
					<label className="pl-1 mb-1 block text-gray-500 font-semibold text-left">Career :</label>
					<input type="text" className="input_primary text-semibold text-gray-500 " placeholder="Enter Career Page" {...register('companyDetail.careerPage', validationRules.url)} />
					{errors.companyDetail?.careerPage && <p className="text-red-500 text-xs italic">{errors.companyDetail?.careerPage?.message}</p>}
				</div>
			</form>
		</CustomModal>
	);
};

export default RequestCompany;
