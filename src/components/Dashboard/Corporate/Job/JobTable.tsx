import React, { useState } from "react";
import { Eye, Pencil, FileText, X, Save } from 'lucide-react';
import { DynamicTable } from "../DynamicTable";
import { JobApiResponse, JobData } from "@Components/Dashboard/types";
import Modal from "../../Modal";
import CloseJob from "./CloseJob";

interface JobsTableProps {
    activeTab: 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
    setActiveTab: (tab: 'PUBLISHED' | 'CLOSED' | 'ARCHIVED') => void;
    data: JobApiResponse
}

const JobTableWrapper: React.FC<JobsTableProps> = ({
    activeTab,
    setActiveTab,
    data,
}) => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [isCloseJobModalOpen, setIsCloseJobModalOpen] = useState(false);

    const columns = [
        {
            key: "jobTitle",
            label: "Job Title",
            hideOnMobile: true,
            render: (row: JobData) => <span className="font-bold w-full capitalize">{row.jobTitle}</span>,
        },
        { key: "department", label: "Department", hideOnMobile: true },
        { key: "totalApplications", label: "Total Applications", hideOnMobile: true },
        ...(activeTab === "PUBLISHED"
            ? [{ key: "pending", label: "Pending", hideOnMobile: true }]
            : [{ key: "archivedBy", label: "Archived By", hideOnMobile: true }]),
        ...(activeTab === "CLOSED" ? [{ key: "status", label: "Status", hideOnMobile: true }] : []),
        { key: "actions", label: "Actions", hideOnMobile: true },
    ];

    const toggleRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleExpand = (id: string) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (!data?.data) return;

        if (selectedRows.length === data.data.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(data.data.map((job) => job.id));
        }
    };

    return (
        <div>
            <button
                className={`text-sm text-blue-600 flex items-center gap-1 mb-2 ${selectedRows.length === 0 ? "hidden" : ""
                    }`}
                onClick={() => setSelectedRows([])}
            >
                <span className="w-4 h-4 flex items-center justify-center bg-blue-600 rounded-full text-white text-base">
                    &minus;
                </span>
                <span>deselect {selectedRows.length} rows</span>
            </button>
            <DynamicTable<JobData>
                columns={columns}
                rows={data?.data ?? []}
                activeTab={activeTab}
                selectedRows={selectedRows}
                expandedRows={expandedRows}
                toggleRow={toggleRow}
                toggleExpand={toggleExpand}
                toggleSelectAll={toggleSelectAll}
                allSelected={selectedRows.length === data?.data.length && data.data.length > 0}
                renderActions={(row) => {
                    if (activeTab === "PUBLISHED") {
                        return (
                            <div className="flex gap-2 items-center justify-center">
                                <button className="btn-view">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button className="btn-edit">
                                    <Pencil className='w-4 h-4' />
                                </button>
                                <button className="btn-copy">
                                    <FileText className='w-4 h-4' />
                                </button>
                                <button
                                    onClick={() => setIsCloseJobModalOpen(true)}
                                    className="btn-close"
                                >
                                    <X className='w-4 h-4' />
                                </button>
                                <button className="btn-save-open">
                                    <Save className='w-4 h-4' />
                                </button>
                            </div>
                        );
                    }

                    if (activeTab === "ARCHIVED") {
                        return (
                            <div className="flex gap-2 items-center justify-center">

                                <button className="btn-close">
                                    <X className='w-4 h-4' />
                                </button>
                                <button className="btn-repost">
                                    <Pencil className='w-4 h-4' />
                                </button>
                                <button className="btn-copy">
                                    <FileText className='w-4 h-4' />
                                </button>
                            </div>
                        );
                    }

                    if (activeTab === "CLOSED") {
                        return (
                            <div className="flex gap-2 items-center justify-center">
                                <button className="btn-copy">
                                    <FileText className='w-4 h-4' />
                                </button>;
                            </div>
                        );
                    }

                    return null; // fallback
                }}
                renderExpandedDetails={(row) => (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                        <div className="col-span-2">
                            <div className="text-gray-400">Experience</div>
                            {`${row.experienceRange.min} - ${row.experienceRange.max}`}
                        </div>
                        <div>
                            <div className="text-gray-400">Salary bucket</div>
                            {`${row.salaryRange.min} - ${row.salaryRange.max}`}
                        </div>
                        <div>
                            <div className="text-gray-400">Created at</div>
                            {new Date(row.createdAt).toLocaleDateString('en-GB')}
                        </div>
                        <div>
                            <div className="text-gray-400">Created by</div>
                            {row.createdByCorporateUserId}
                        </div>
                    </div>
                )}
            />
            <Modal
                isOpen={isCloseJobModalOpen}
                onClose={() => setIsCloseJobModalOpen(false)}
            >
                <CloseJob
                    onClose={() => setIsCloseJobModalOpen(false)}
                    onSubmit={() => { }}
                />
            </Modal>
        </div>
    );
};

export default JobTableWrapper;
