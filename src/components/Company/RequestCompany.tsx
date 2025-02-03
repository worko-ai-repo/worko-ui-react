import { useForm } from 'react-hook-form';
import { emailDomainDenyListValidator } from '@Utils/Validator.utils';

const RequestCompany = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm();

	const onSubmit = (data: any) => {
		if (!emailDomainDenyListValidator(data.email)) {
			setError('email', {
				type: 'manual',
				message: 'Please enter a work email (not a personal email).',
			});
			return;
		}
		console.log('Form Submitted:', data);
	};

	return (
		<div className="sticky top-[250px] mt-10 border-[1px] border-gray-300 rounded-lg p-2">
			<p className="font-semibold text-left ">Can’t find your desired company? Submit your details for a personalized referral!</p>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input type="text" {...register('name', { required: 'Name is required' })} placeholder="Name" className="text-sm input_primary my-1" />
				{errors.name?.message && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}

				<input type="email" {...register('email', { required: 'Email is required' })} placeholder="Work Email" className="text-sm input_primary my-1" />
				{errors.email?.message && <p className="text-red-500 text-sm">{String(errors.email.message)}</p>}

				<input type="text" {...register('contact', { required: 'Contact Number is required' })} placeholder="Contact Number" className="text-sm input_primary my-1" />
				{errors.contact?.message && <p className="text-red-500 text-sm">{String(errors.contact.message)}</p>}

				<input type="text" {...register('company', { required: 'Company Name is required' })} placeholder="Company Name" className="text-sm input_primary my-1" />
				{errors.company?.message && <p className="text-red-500 text-sm">{String(errors.company.message)}</p>}

				<input type="url" {...register('website', { required: 'Website is required' })} placeholder="Company Website" className="text-sm input_primary my-1" />
				{errors.website?.message && <p className="text-red-500 text-sm">{String(errors.website.message)}</p>}

				{/* Button wrapper to align it to the right */}
				<div className="flex justify-end mt-2 ">
					<button className="btn_secondary text-sm hover:bg-blue-600">Submit</button>
				</div>
			</form>
		</div>
	);
};

export default RequestCompany;
