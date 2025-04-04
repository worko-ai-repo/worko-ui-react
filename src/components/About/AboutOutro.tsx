import { about_bg, gb_form, worko_new } from '@Assets';
import { validateCV } from '@Components/Auth/Signup/SignupForm';
import MessageModal from '@Components/Modals/MessageModal';
import { AwsS3FileUploadResponse } from '@Interfaces/Auth.dto';
import httpServiceObj from '@Services/ApiHandler.service';
import { validationRules } from '@Utils/FormValidator.utils';
import { getToastOptions } from '@Utils/Toast.utils';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AboutOutro = () => {
	const nav = useNavigate();
	const [modalData, setModalData] = useState<{
			type: 'none' | 'error' | 'warning' | 'success' | 'info';
			heading?: { message: string; type: 'error' | 'warning' | 'success' | 'info' };
			message: string;
			buttons?: { label: string; action: () => void; type?: 'primary' | 'danger' | 'warning' | 'success' }[];
		} | null>(null);
	

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm({ mode: 'onChange' ,
    defaultValues: {
      lastName: '',
      firstName: '',
      email: '',
      phone: '',
      cv: '',
      message: '',
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const careerCVFileMimeType = data.cv[0].type;
      const careerCVFileName = data.cv[0].name.replace(/\s/g, '');
  
      // Step 1: Get AWS S3 Signed URL
      const { response, status, error } = await httpServiceObj.post<AwsS3FileUploadResponse>(
        "/file/gsu2u/CAREER_RESUME",
        { careerCVFileName, careerCVFileMimeType }
      );
  
      if (response) {
        // Step 2: Upload File to S3
        const metaData = {
          file: data.cv[0], // Uploading the actual file
          awsS3Tag: response.awsS3Tag,
        };
  
        const signedUrl: string = response.awsS3SignedUrl;
  
        const fileUploadHandler = await httpServiceObj.put<null>(
          signedUrl,
          metaData.file,
          false,
          { awsS3Tag: metaData.awsS3Tag, fileType: careerCVFileMimeType },
          true
        );
  
        if (fileUploadHandler.error) {
          throw new Error(fileUploadHandler.error.message || "File upload failed.");
        }
  
  
      // Step 4: Send user details after upload
      const formData = {
        userContactNumber: data.phone,
        userCvCloudFileName: response?.cloudFileName || "",
        userCvFileName: careerCVFileName,
        userEmail: data.email,
        userFullName: `${data.firstName} ${data.lastName}`,
        userMessage: data.message,
      };
  
      const { response : userFormSubmission,status} = await httpServiceObj.post<any>("/career", formData  );
//   debugger;
	  if(status === 409 ) {
		setModalData({
			type: 'error',
			heading: { message: 'Form Already Submitted', type: 'error' },
			message: 'It seems you have already submitted the form. Our team will reach out to you shortly.',
			buttons: [{ label: 'Back to Home', action: () => nav('/') }],
		});
	  } else {
		setModalData({
			type: 'success',
			heading: { message: 'Form Submitted', type: 'success' },
			message: 'Thank you for showing interest in our platform. Your form has been submitted successfully and we will reach out to you shortly.',
			buttons: [{ label: 'Back to Home', action: () => nav('/') }],
		});
	  }
      
  };
} catch (error: any) {
  toast.error(error.message, getToastOptions());
} 
}
  
	return (
		<section className="   min-h-52 flex items-center justify-center  ">
			<div className="section-wrapper  py-10 text-sm  font-bold !pt-10  ">
				<p className="text-xl sm:text-4xl max-w-[55rem] mx-auto text-center">
					<div>
						At <img src={worko_new} className="w-[5rem] inline relative -top-1" alt="" />,{' '}
					</div>
					we’re not just building a platform—we’re creating a<span className="text-blue-500"> community </span> where
					<span className="text-blue-500"> careers thrive</span>,<span className="text-blue-500"> opportunities are endless</span>, and
					<span className="text-blue-500"> success is a shared journey</span>.
				</p>

				<div className="mt-10 aboutform flex mx-auto w-fit rounded-3xl gap-5 p-5 bg-[#CFEFFF] ">
					{/* letsConnect form  */}
					<form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto p-6 font-semibold rounded-lg ">
						<h1 className="text-2xl sm:text-4xl text-left mb-6 text-blue-600">Let's Connect</h1>

						<div className=" grid gap-1 sm:gap-2 sm:grid-cols-2   ">
							{/* Last Name */}
							<div>
								<input type="text" placeholder="Last Name" {...register('lastName', { required: 'Last name is required' })} className="p-3 border bg-white border-gray-300 rounded-md w-full" />
								{errors.lastName && <p className="text-left text-red-500 text-sm">{errors.lastName.message}</p>}
							</div>

							{/* First Name */}
							<div>
								<input type="text" placeholder="First Name" {...register('firstName', { required: 'First name is required' })} className="p-3 border bg-white border-gray-300 rounded-md w-full" />
								{errors.firstName && <p className="text-left text-red-500 text-sm">{errors.firstName.message}</p>}
							</div>

							{/* Email */}
							<div className="col-span-2">
								<input
									type="email"
									placeholder="Email"
									{...register('email', validationRules.email)}
									className="p-3 border border-gray-300 bg-white rounded-md w-full"
								/>
								{errors.email && <p className="text-left text-red-500 text-sm">{errors.email.message}</p>}
							</div>

							{/* Phone Number */}
							<div>
								<input
									type="text"
									placeholder="Phone Number"
									{...register('phone', validationRules.phone)}
									className="p-3 border border-gray-300 bg-white rounded-md w-full"
								/>
								{errors.phone && <p className="text-left text-red-500 text-sm">{errors.phone.message}</p>}
							</div>

							{/* Upload CV */}
								<div>
								<div className="relative">
									<input 
									type="file" 
									{...register('cv', { validate: validateCV })} 
									accept=".pdf" 
									className="p-3 border bg-white border-gray-300 rounded-md w-full text-transparent"
									
									style={{ 
										color: 'transparent'
									}}
									/>
									<div className="absolute inset-0 pointer-events-none flex items-center pl-3">
									<span className="text-gray-400 font-thin">Upload your CV</span>
									</div>
								</div>
								{errors.cv && <p className="text-left text-red-500 text-sm">{errors.cv.message}</p>}
								</div>

							{/* Message */}
							<div className="col-span-2">
								<textarea placeholder="What will you bring to the table?" rows={6} {...register('message', { required: 'Message is required' })} className=" outline-none p-3 border border-gray-300 rounded-md w-full" />
								{errors.message && <p className="text-left text-red-500 text-sm">{errors.message.message}</p>}
							</div>
						</div>

						{/* Submit Button */}
						<button type="submit" className={`mt-4 w-full py-3 rounded-xl text-white btn_primary`} >
							Send Message
						</button>
					</form>

					<div className="image hidden lg:block rounded-3xl  bg-gradient-to-t from-[rgba(10,13,23,0.95)] via-[rgba(0,60,255,0.8)] to-[rgba(10,13,23,0.0)]">
						<img src={gb_form} alt="" />
					</div>
				</div>
			</div>
			{/* Modal */}
						{modalData && <MessageModal {...modalData} onClose={() => setModalData(null)} showCloseButton={false} />}
		</section>
	);
};

export default AboutOutro;
