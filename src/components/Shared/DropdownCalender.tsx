import React, { useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Still need this for base styles

const DropdownCalendar:React.FC<any> = ({ onSelectDate , Cname }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const CnameFinal = Cname/*  || "px-4 py-2 text-white bg-blue-600 rounded-md focus:outline-none hover:bg-blue-700 transition duration-150 ease-in-out" */;
  const handleDateChange = (date:any) => {
    setSelectedDate(date);
    onSelectDate(date); // Pass the selected date to the parent component
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block w-full">
      <button
        onClick={toggleDropdown}
        className={CnameFinal}
      >
        {selectedDate.toDateString()}
      </button>

      {isOpen && (
        <div
          className="absolute max-sm:scale-75 max-sm:top-0  z-10  bg-opacity-20 backdrop-blur-lg border border-gray-200 rounded-md shadow-lg mt-2 p-4"
          ref={calendarRef}
        >
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="!w-max !max-w-[280px] mx-auto !bg-transparent !border-none rounded-lg"
            tileClassName={({ date, view }) => {
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = selectedDate.toDateString() === date.toDateString();
              return `p-1 flex items-center justify-center rounded-full ${
                view === 'month' && (
                  isToday ? '!bg-gray-200 text-black' : 'hover:bg-blue-200 text-black'
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
