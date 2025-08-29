import { Filter } from "@Assets";
import React, { useState } from "react";
import FilterToggle from "../Filters";
import BulkOption from "@Components/Dashboard/Bulk";
import Modal from "../../Modal";
import EvaluatorForm from "./EvaluatorForm";
import RejectionForm from "./RejectForm";

const stats = [
  { label: "Total Applicants", value: 106 },
  { label: "Rejected", value: 90 },
  { label: "Reviewed", value: 20 },
  { label: "New Applicants", value: 10 },
  { label: "Hired", value: 90 },
];

const tabs = ["All", "Hired", "Joined"] as const;

const Applicants = () => {
  const [openEvaluationModal, setOpenEvaluationModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);

  return (
    <div>
      <div className="flex flex-col sm:flex-col gap-4 sm:gap-24 justify-between">
        <div className="flex flex-col gap-[35px]">
          <div className="grid grid-cols-[auto_auto_auto_auto_auto_2fr_2fr] gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white shadow-md rounded-xl px-7 py-4 text-center min-w-[130px]">
                <p className="text-sm text-[#64748B]">{stat.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              </div>
            ))}
            <div
              onClick={() => setOpenRejectModal(true)}
              className="bg-white shadow-md rounded-xl px-7 text-xs gap-2 py-4 text-center flex flex-col">
              <span className="text-sm text-[#64748B]">Job Url</span>
              <input
                type="text"
                placeholder="Job url"
                className="px-3 py-1 rounded-lg text-[#C0B7B7] border"
              />
            </div>
            <div
              onClick={() => setOpenEvaluationModal(true)}
              className="flex cursor-pointer flex-col gap-2 bg-white rounded-xl px-7 py-4 shadow-md">
              <span className="text-sm text-[#64748B]">Job Status</span>
              <span className="text-2xl text-blue-500 font-semibold">Hiring</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Search Bar */}
            <div className="flex flex-row w-full sm:w-[80%] h-fit bg-white shadow-md rounded-[15px] overflow-hidden">
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-3 w-full outline-none bg-[#FAFAFA] text-sm"
              />
              <button className="bg-gradient-to-t from-[#316BFF] to-[#5FC9FF] text-white px-6 py-0 rounded-[15px] rounded-l-none">
                Search
              </button>
            </div>

            <div className="flex gap-3 font-semibold w-full sm:w-auto justify-end">
              <FilterToggle />
              <BulkOption />
            </div>
          </div>
        </div>
      </div>
      <Modal
        onClose={() => setOpenEvaluationModal(false)}
        isOpen={openEvaluationModal}
        title="Send for Evaluation">
        <EvaluatorForm />
      </Modal>
      <Modal onClose={() => setOpenRejectModal(false)} isOpen={openRejectModal}>
        <RejectionForm />
      </Modal>
    </div>
  );
};

export default Applicants;
