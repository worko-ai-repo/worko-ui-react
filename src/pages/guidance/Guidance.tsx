import React from 'react';
import { useForm } from 'react-hook-form';
import { validationRules } from '@Utils/FormValidator.utils';
import DropdownCalendar from '@Components/Shared/DropdownCalender';
import CompanyBanner from '@Components/Company/CompanyBanner';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';

const Guidance = () => {
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm({ mode: 'onChange' });

	const onSubmit = (data: any) => {
		// console.log(data);
	};

	return (
        <div className="w-full ">
            <CompanyBanner BannerMode={CompanyPageModeEnum.GUIDANCE} />
                    <div className="section-wrapper !max-w-5xl  ">
                        <form onSubmit={handleSubmit(onSubmit)} className=" mx-auto bg-[#F2F4F5]  pb-10   rounded-2xl">
                            <h2 className="text-lg text-left  py-2 px-4 sm:px-10 font-semibold mb-4 border-b border-black ">Get Guidance for any job listed on Worko</h2>
            
                            {/* second section */}
                            <div className="grid sm:grid-cols-2 gap-4 mb-10 pb-7 border-b border-gray-400 px-4 sm:px-10">
                                
                                    <div className="flex flex-col items-start justify-start ">
                                        <label className=" my-3 block text-sm font-semibold !ml-0 text-black ">Guidance Type</label>
                                        <select {...register('serviceCategory', validationRules.name)} className="select_primary max-sm:min-w-[70vw] sm:max-w-[300px] w-full p-3 bg-[#FAFAFA]  rounded-xl text-gray-500 text-sm ">
                                            <option value="">What you need guidance for</option>
                                            <option value="category1">Interview hand holding</option>
                                            <option value="category2">Mock Interview / Preparation</option>
                                            <option value="category2">Help with assignment</option>
                                            <option value="category2">Career Guidance</option>
                                            <option value="category2">Resume Review</option>
                                            <option value="category2">Other</option>

                                        </select>
                                        {errors.serviceCategory && <p className="text-red-500 text-xs">{/* {errors.serviceCategory.message} */}</p>}
                                    </div>
                                    {/* Date  */}
                                    <div className="flex flex-col items-start justify-start ">
                                        <label className=" my-3 block text-sm font-semibold text-black ">Date</label>
                                        <div className="flex justify-start  w-full sm:max-w-[300px]  text-left ">
                                            <DropdownCalendar onSelectDate={(date: any) => setValue('date', date)} Cname="select_primary   sm:max-w-[300px]  w-full  p-3 bg-[#FAFAFA]  rounded-xl text-gray-500 text-sm text-left " />
                                        </div>{' '}
                                        {errors.date &&
                                            // <p className="text-red-500 text-xs">{errors.date.message}</p>
                                            ''}
                                    </div>
                                    <div className='flex flex-col items-start justify-start '>
                                    <label className="my-3 block text-sm font-semibold text-black">Company Name</label>
                                    <input {...register('description', validationRules.name)} className="w-full max-sm:min-w-[70vw] sm:max-w-[300px] p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm" placeholder='Enter the company name'></input>
                                    {errors.description &&
                                        // <p className="text-red-500 text-xs">{errors.description.message}</p>
                                        ''}
                                </div>

                                    {/* Profile interviewing for  */}
                                    <div className="flex flex-col items-start justify-start ">
                                        <label className=" my-3 block text-sm font-semibold text-black ">Profile you are interviewing for</label>
                                        <input {...register('profile', validationRules.name)} className=" w-full max-sm:min-w-[70vw] sm:max-w-[300px] p-3 bg-[#FAFAFA] rounded-xl text-gray-500 text-sm " placeholder="Enter the job URL" />
                                        {errors.profile &&
                                            // <p className="text-red-500 text-xs">{errors.profile.message}</p>
                                            ''}
                                    </div>
                            </div>
            
                            {/* third sections  */}
                            <div className="px-4 sm:px-10">
                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-black ">Provide the detailed description of the required guidance</label>
                                    <textarea {...register('serviceDescription', validationRules.name)} className="w-full p-2 border rounded-md bg-white" rows={10}></textarea>
                                    {errors.serviceDescription &&
                                        //   <p className="text-red-500 text-xs">{errors.serviceDescription.message}</p>
                                        ''}
                                </div>
                            </div>
                            <button type="submit" className="btn_primary mt-6 px-6 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Submit
                            </button>
                        </form>
                    </div>
        </div>
	);
};

export default Guidance;
