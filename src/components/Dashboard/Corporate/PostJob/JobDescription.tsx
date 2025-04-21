import React, { useState } from 'react';
import { Upload, SendIcon } from 'lucide-react';
import httpServiceObj from '@Services/ApiHandler.service';
import { JobDetails } from '@Components/Dashboard/types';

export default function JobDescription({
  onClose,
  setIsJobFormModalOpen,
  setJobDetails,
}: {
  onClose: () => void;
  setIsJobFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setJobDetails: React.Dispatch<React.SetStateAction<JobDetails | null>>;
}) {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');

  const parseJD = async () => {
    const { response, error } = await httpServiceObj.post(`https://jobs.dev.worko.work/job/parsejd`, { "jobDescription": `${description}` }, true, {}, true);
    setJobDetails(response as JobDetails);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setFormError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!description.trim() && !file) {
      setFormError('Please either write/paste a description or upload a job description file.');
      return;
    }

    // Clear error and continue
    setFormError('');
    await parseJD();
    setIsJobFormModalOpen(true);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 w-[80dvw] sm:w-[60dvw] flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Text Area */}
        <div className="flex-1 w-full">
          <h2 className="mb-2 text-sm font-semibold text-black">Write or Paste description here</h2>
          <textarea
            className="w-full h-48 p-4 rounded-xl bg-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            placeholder="Write or paste here"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setFormError('');
            }}
          />
        </div>

        {/* Middle: OR */}
        <div className="self-center text-sm font-medium text-gray-600">Or</div>

        {/* Right Side: Upload */}
        <div className="mx-auto flex flex-col items-center w-60">
          <h2 className="mb-2 text-sm font-semibold text-black">Upload job description</h2>
          <div className="flex flex-col items-center justify-center w-full h-48 border border-gray-300 rounded-xl">
            <label className="cursor-pointer p-3 text-white rounded-[10px] bg-[#57E1E1] bg-[linear-gradient(0deg,_rgba(49,_107,_255,_0.3)_0%,_rgba(56,_161,_214,_0.3)_100%)] border-gray-300 flex flex-col items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-700 text-center truncate max-w-[200px]">
                {file.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {formError && (
        <p className="text-red-500 text-sm font-medium mt-2">{formError}</p>
      )}

      {/* Submit Button */}
      <div className="mt-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <SendIcon className="w-4 h-4" />
          Submit
        </button>
      </div>
    </form>
  );
}
