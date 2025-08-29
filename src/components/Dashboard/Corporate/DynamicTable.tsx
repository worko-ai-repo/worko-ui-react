
import React from "react";
import { ChevronDownIcon, ChevronUp } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DynamicTableProps<T> {
  activeTab: string;
  columns: Column<T>[];
  rows: T[];
  selectedRows: string[];
  expandedRows: string[];
  toggleSelectAll: () => void;
  toggleRow: (id: string) => void;
  toggleExpand: (id: string) => void;
  allSelected: boolean;
  renderActions?: (row: T) => React.ReactNode;
  renderExpandedDetails?: (row: T) => React.ReactNode;
}

export function DynamicTable<T extends { id: string }>(
  props: DynamicTableProps<T>
) {
  const {
    activeTab,
    columns,
    rows,
    selectedRows,
    expandedRows,
    toggleSelectAll,
    toggleRow,
    toggleExpand,
    allSelected,
    renderActions,
    renderExpandedDetails,
  } = props;

  const totalCols = columns.length + 2;

  return (
    <div className="bg-white rounded-lg p-2 md:p-4 overflow-x-auto w-full">
      <table className="min-w-full table-auto">
        {/* Table Head */}
        <thead className="bg-[#EFFFFF] text-[#94A3B8] ">
          <tr>
            <th className="p-3 text-center rounded-l-xl">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key as string}
                className="px-4 py-2 whitespace-nowrap text-center font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {rows.map((row) => {
            const isSelected = selectedRows.includes(row.id);
            const isExpanded = expandedRows.includes(row.id);

            return (
              <React.Fragment key={row.id}>
                {/* Main row */}
                <tr>
                  {/* Checkbox */}
                  <td
                    className={`p-3 text-center border-b-2  ${isSelected ? "bg-[#F5F7F7]" : "bg-[#FCFCFC]"} rounded-l-xl`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      className="w-4 h-4"
                    />
                  </td>

                  {/* Dynamic columns */}
                  {columns.map((col, index) => (
                    <td
                      key={col.key as string}
                      className={`px-4 border-b-2 py-2 text-sm whitespace-nowrap capitalize ${isSelected ? "bg-[#F5F7F7]" : "bg-[#FCFCFC]"
                        } ${index === columns.length - 1 ? "rounded-r-xl" : ""}`}
                    >
                      {col.label === "Actions" ? (
                        renderActions?.(row)
                      ) : (
                        col.render
                          ? col.render(row)
                          : (row[col.key as keyof T] as React.ReactNode)
                      )}
                    </td>
                  ))}
                </tr>

                {/* Modified expand button row */}
                {!isExpanded && (
                  <tr className="relative h-0">
                    <td colSpan={totalCols} className="p-0 border-t-0">
                      <div
                        onClick={() => toggleExpand(row.id)}
                        className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-blue-600 border rounded-full bg-white shadow-md cursor-pointer"
                      >
                        <ChevronDownIcon />
                      </div>
                    </td>
                  </tr>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <tr>
                    <td colSpan={totalCols} className="relative bg-white p-0 text-sm text-gray-600 border rounded-b-xl">
                      {/* Expanded Content */}
                      <div className="p-4">
                        {renderExpandedDetails?.(row)}
                      </div>

                      {/* Floating Chevron Button */}
                      <div
                        onClick={() => toggleExpand(row.id)}
                        className="absolute left-1/2 transform -translate-x-1/2 translate-y-1/2 bottom-0 z-10 w-8 h-8 text-blue-600 flex items-center justify-center bg-white border shadow-md rounded-full cursor-pointer"
                      >
                        <ChevronUp />
                      </div>
                    </td>
                  </tr>
                )}

              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}