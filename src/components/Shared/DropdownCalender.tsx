import React, { useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface DropdownCalendarProps {
  onSelectDate: (date: Date) => void;
  Cname?: string;
  allowPastDates?: boolean; // New prop to control past date selection
  placeholder?: string; // New prop to show initial placeholder
}

const DropdownCalendar: React.FC<DropdownCalendarProps> = ({ 
  onSelectDate, 
  Cname, 
  allowPastDates = false, // Default: allow past dates
  placeholder = "Select a date" // Default placeholder text
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const calendarRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleDateChange = (date: Date) => {
    // Create a date at the start of the day in UTC to prevent timezone shifts
    const selectedDateAtStartOfDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

    // Get tomorrow's date (00:00:00 UTC)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Allow selection only from tomorrow onwards
    if (selectedDateAtStartOfDay.getTime() < tomorrow.getTime()) return;

    setSelectedDate(selectedDateAtStartOfDay);
    onSelectDate(selectedDateAtStartOfDay);
    setIsOpen(false);
};
  

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={toggleDropdown}
        className={Cname || "px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none hover:bg-blue-700 transition"}
      >
        {selectedDate ? selectedDate.toDateString() : placeholder}
      </button>

      {isOpen && (
        <div
          className="absolute z-10 bg-opacity-20 backdrop-blur-3xl border border-gray-200 rounded-md shadow-lg mt-2 p-4"
          ref={calendarRef}
        >
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) handleDateChange(value);
            }}
            value={selectedDate || new Date()}
            className="!w-max !max-w-[280px] mx-auto !bg-transparent !border-none rounded-lg"
            tileDisabled={({ date }) => !allowPastDates && date.getTime() < new Date().setHours(0, 0, 0, 0)} // Disable past dates
            tileClassName={({ date, view }) => {
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return `p-1 flex items-center justify-center rounded-full ${
                view === 'month' && (
                  isToday ? '!bg-gray-300 text-black' : 'hover:bg-blue-200 text-black'
                ) + (
                  isSelected ? ' bg-blue-600 text-white hover:bg-blue-800' : ''
                )
              }`;
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DropdownCalendar;
