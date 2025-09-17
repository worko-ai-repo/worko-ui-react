import { Send, ChevronDownIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

type RejectionFormData = {
  reason: string;
  feedback: string;
};

const RejectionForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectionFormData>();

  const onSubmit = (data: RejectionFormData) => {
    // console.log('Rejection submitted:', data);
  };

  return (
    <div className="w-[80dvw] sm:w-[25dvw] sm:max-w-[600px] mt-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Why are you rejecting?
          </label>
          <div className="relative">
            <select
              {...register('reason', { required: 'Please select a reason' })}
              className="w-full appearance-none rounded-xl border border-gray-300 bg-white p-3 pr-10 text-sm text-gray-700 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled hidden>
                Choose your reason for rejection
              </option>
              <option value="not-qualified">Not qualified</option>
              <option value="not-available">Not available</option>
              <option value="cultural-fit">Not a cultural fit</option>
              <option value="other">Other</option>
            </select>

            {/* Dropdown arrow icon placeholder */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDownIcon size={16} className="text-gray-500" />
            </div>
          </div>
          {errors.reason && (
            <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register('feedback')}
            placeholder="Please provide a detail feedback. It will help us to do a better matching"
            className="w-full rounded-xl bg-gray-100 p-3 text-sm focus:outline-none"
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition"
        >
          <Send size={16} />
          <span>Submit</span>
        </button>
      </form>
    </div>
  );
};

export default RejectionForm;
