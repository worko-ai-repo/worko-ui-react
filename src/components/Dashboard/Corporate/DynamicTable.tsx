import React from "react";
import { ChevronDownIcon, ChevronUp } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface DynamicTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  activeTab?: string;
  selectedRows: string[];
  expandedRows: string[];
  toggleSelectAll: () => void;
  toggleRow: (id: string) => void;
  toggleExpand: (id: string) => void;
  allSelected: boolean;
  renderActions?: (row: T) => React.ReactNode;
  renderExpandedDetails?: (row: T) => React.ReactNode;
}

export function DynamicTable<T extends { id: string; jobTitle: string }>(
  props: DynamicTableProps<T>
) {
  const {
    columns,
    rows,
    activeTab,
    selectedRows,
    expandedRows,
    toggleSelectAll,
    toggleRow,
    toggleExpand,
    allSelected,
    renderActions,
  } = props;

  const dynamicGridTemplate = `2fr repeat(${columns.length}, 1fr) ${activeTab !== 'Open' ? '1fr' : '2fr'}`;

  return (
    <div className="bg-white rounded-lg p-2 md:p-4">
      <div
        className="hidden md:grid relative items-center p-4 mb-2 rounded-lg bg-[#EFFFFF] text-[#94A3B8] font-medium"
        style={{ gridTemplateColumns: dynamicGridTemplate }}
      >
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          className="w-4 h-4 absolute left-4"
        />
        <div>Job title</div>
        {columns.map((col) => (
          <div key={col.key as string} className={col.hideOnMobile ? "hidden md:block" : ""}>
            {col.label}
          </div>
        ))}
        <div>Actions</div>
      </div>

      {rows.map((row) => {
        const isSelected = selectedRows.includes(row.id);
        const isExpanded = expandedRows.includes(row.id);

        return (
          <div key={row.id} className={`relative my-2 md:my-1 ${isExpanded ? "md:my-6" : ""}`}>
            <div
              className={`rounded-md overflow-hidden ${isSelected ? "bg-gray-100 border-l-2 border-blue-600" : "bg-gray-50"
                } ${isExpanded || isSelected ? "border-b-none" : "border-b"}`}
            >
              <div className="p-4 grid gap-2 text-sm" style={{ gridTemplateColumns: dynamicGridTemplate }}>
                <div className="flex flex-col md:flex-row md:items-center md:gap-20 gap-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRow(row.id)}
                    className="w-4 h-4"
                  />
                  <span className="font-bold capitalize">{row.jobTitle}</span>
                </div>
                {columns.map((col) => (
                  <div key={col.key as string} className="flex items-center justify-center capitalize">
                    {col.hideOnMobile && (
                      <span className="md:hidden text-gray-400 block">{col.label}</span>
                    )}
                    {col.render
                      ? col.render(row)
                      : (row[col.key as keyof T] as React.ReactNode)}
                  </div>
                ))}
                <div className="flex items-center justify-center gap-2">
                  {renderActions?.(row)}
                </div>
              </div>
            </div>

            <div
              onClick={() => toggleExpand(row.id)}
              className="absolute hover:cursor-pointer left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center text-blue-600 rounded-full border bg-white shadow-md z-10 bottom-[-1rem]"
            >
              {isExpanded ? <ChevronUp /> : <ChevronDownIcon />}
            </div>

            {isExpanded && (
              <div className="bg-white p-4 border text-sm text-gray-600 rounded-b-md">
                {props.renderExpandedDetails?.(row)}
              </div>
            )}

          </div>
        );
      })}
    </div>
  );
}
