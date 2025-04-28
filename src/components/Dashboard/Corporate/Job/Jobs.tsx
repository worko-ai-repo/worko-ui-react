import { Filter } from '@Assets';
import { useEffect, useState } from 'react';
import JobForm from '../PostJob/JobForm';
import JobDescription from '../PostJob/JobDescription';
import JobsTable from './JobTable';
import httpServiceObj from '@Services/ApiHandler.service';
import { JobApiResponse, JobDetails } from '@Components/Dashboard/types';
import Modal from '../../Modal';
import FilterToggle from '../Filters';
import BulkOption from '@Components/Dashboard/Bulk';

const stats = [
  { label: 'Total Applicants', value: 106 },
  { label: 'Rejected', value: 90 },
  { label: 'Reviewed', value: 20 },
  { label: 'New Applicants', value: 10 },
  { label: 'Hired', value: 90 },
];

const tabs = ["PUBLISHED", "ARCHIVED", "CLOSED"] as const;

const Jobs = () => {

  const [isJobDescriptionModalOpen, setIsJobDescriptionModalOpen] = useState(false);
  const [isJobFormModalOpen, setIsJobFormModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"PUBLISHED" | "CLOSED" | "ARCHIVED">("PUBLISHED");
  const [searchBarText, setSearchBarText] = useState<string | null>(null);
  const [data, setData] = useState<JobApiResponse | null>(null);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);

  const fetchJobs = async () => {
    const params = new URLSearchParams({
      pageSize: '25',
      companyId: '01JM1WBGBZK51B951XBRBG8NKX',
      sortOrder: 'desc',
      dashboard: 'CORPORATE',
      status: activeTab,
    });

    if (searchBarText) {
      params.append('searchText', searchBarText);
    }

    const url = `https://jobs.dev.worko.work/job/?${params.toString()}`;
    const { response, error } = await httpServiceObj.get(url, true, {}, true);
    setData(response as JobApiResponse);
  }

  useEffect(() => {
    fetchJobs();
  }, [activeTab])

  return (
    <div className="w-full space-y-[35px] px-0">
      <div className='flex flex-col sm:flex-row gap-4 sm:gap-24 justify-between'>
        <div className=" flex-1 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-start">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white shadow-md rounded-xl px-7 py-4 text-center min-w-[130px]"
              >
                <p className="text-sm text-[#64748B]">{stat.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-row w-full bg-white shadow-md rounded-[15px] overflow-hidden">
            <input
              type="text"
              placeholder="Search"
              value={searchBarText ?? ''}
              onChange={(e) => setSearchBarText(e.target.value)}
              className="px-4 py-3 w-full outline-none bg-[#FAFAFA] text-sm"
            />
            <button
              onClick={fetchJobs}
              className="bg-gradient-to-t from-[#316BFF] to-[#5FC9FF] text-white px-6 py-0 rounded-[15px] rounded-l-none">
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 justify-center sm:items-end">
          <div className="flex">
            <button
              onClick={() => setIsJobDescriptionModalOpen(true)}
              className="bg-gradient-to-b from-[#80E7E7] to-[#316BFF] text-white px-5 py-2 rounded-xl font-medium w-full"
            >
              + Post Job
            </button>
          </div>

          <div className="max-sm:flex-1 flex items-start justify-between gap-3 font-semibold">
            <FilterToggle />
            <BulkOption />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-[57px]">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`pb-2 border-b-2 text-sm ${activeTab === tab
              ? "border-blue-500 text-blue-700 font-semibold"
              : "border-transparent text-gray-500"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'PUBLISHED' ? 'Open' : tab === 'ARCHIVED' ? 'Archived' : 'Closed'}
          </button>
        ))}
      </div>

      <JobsTable
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        data={data as JobApiResponse}
      />

      <Modal
        isOpen={isJobFormModalOpen}
        onClose={() => setIsJobFormModalOpen(false)}
        title='Check the details'
      >
        <JobForm
          onClose={() => setIsJobFormModalOpen(false)}
          jobDetails={jobDetails}
        />
      </Modal>

      <Modal
        isOpen={isJobDescriptionModalOpen}
        onClose={() => setIsJobDescriptionModalOpen(false)}
      >
        <JobDescription
          onClose={() => setIsJobDescriptionModalOpen(false)}
          setIsJobFormModalOpen={setIsJobFormModalOpen}
          setJobDetails={setJobDetails}
        />
      </Modal>
    </div>
  );
};

export default Jobs;
