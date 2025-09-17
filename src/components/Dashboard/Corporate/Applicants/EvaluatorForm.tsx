import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Send } from 'lucide-react';

type Evaluator = {
  name: string;
  email: string;
  message: string;
};

type FormValues = {
  evaluators: Evaluator[];
};

const EvaluatorForm: React.FC = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      evaluators: [{ name: '', email: '', message: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'evaluators',
  });

  const [activeTab, setActiveTab] = useState(0);

  const onSubmit = (data: FormValues) => {
    // console.log('Submitted Evaluator Data:', data.evaluators[activeTab]);
  };

  const handleRemoveTab = (index: number) => {
    remove(index);
    // Adjust active tab if needed
    if (activeTab === index) {
      setActiveTab((prev) => (index > 0 ? prev - 1 : 0));
    } else if (index < activeTab) {
      setActiveTab((prev) => prev - 1);
    }
  };

  return (
    <div className="w-[80dvw] sm:w-[25dvw] mt-4">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2 overflow-x-auto">
          {fields.map((_, index) => (
            <div
              key={index}
              className={`flex items-center border-b-2 ${
                activeTab === index ? 'border-black' : 'border-transparent'
              }`}
            >
              <button
                onClick={() => setActiveTab(index)}
                className={`text-sm font-semibold pr-1 text-nowrap ${
                  activeTab === index ? 'text-black' : 'text-gray-400'
                }`}
              >
                Evaluator {index + 1}
              </button>
              {fields.length > 1 && (
                <button
                  onClick={() => handleRemoveTab(index)}
                  className="text-gray-400 text-xs hover:text-red-500 ml-1"
                  title="Remove Evaluator"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            append({ name: '', email: '', message: '' });
            setActiveTab(fields.length); // jump to new tab
          }}
          className="text-blue-500 text-lg font-bold"
          title="Add Evaluator"
        >
          +
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            {...register(`evaluators.${activeTab}.name`, { required: 'Name is required' })}
            placeholder="Write name"
            className="w-full rounded-xl bg-gray-100 p-3 text-sm focus:outline-none"
          />
          {errors.evaluators?.[activeTab]?.name && (
            <p className="text-red-500 text-xs mt-1">{errors.evaluators[activeTab].name?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register(`evaluators.${activeTab}.email`, {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email format',
              },
            })}
            placeholder="Write email address"
            className="w-full rounded-xl bg-gray-100 p-3 text-sm focus:outline-none"
          />
          {errors.evaluators?.[activeTab]?.email && (
            <p className="text-red-500 text-xs mt-1">{errors.evaluators[activeTab].email?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Message</label>
          <textarea
            {...register(`evaluators.${activeTab}.message`)}
            placeholder="Any message you want to write"
            className="w-full rounded-xl bg-gray-100 p-3 text-sm focus:outline-none"
            rows={3}
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

export default EvaluatorForm;
