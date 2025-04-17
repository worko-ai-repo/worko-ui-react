import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { SendIcon, X } from 'lucide-react';

const reasons = [
  'Hired from Worko',
  'Hired from Other Platform',
  'Hired Internally',
  'Position Went on Hold/Dismissed',
];

export default function CloseJob({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { reason: string; note: string }) => void;
}) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReason) {
      onSubmit({ reason: selectedReason, note });
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-black">Reason for closing</h2>

      {reasons.map((reason) => (
        <label key={reason} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="reason"
            value={reason}
            checked={selectedReason === reason}
            onChange={() => setSelectedReason(reason)}
            className="w-5 h-5 accent-blue-500"
          />
          <span className="text-sm text-gray-900">{reason}</span>
        </label>
      ))}

      <textarea
        placeholder="Anything you want to say"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full h-24 p-3 rounded-xl bg-[#EBEFF3] resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <button
        type="submit"
        disabled={!selectedReason}
        className="flex items-center gap-2 self-start bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
      >
        <SendIcon className="w-4 h-4" />
        Submit
      </button>
    </form>
  );
}
