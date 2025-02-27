import React, { useState } from 'react';
import DropdownCalendar from '@Components/Shared/DropdownCalender';

const Test = () => {
  const [date, setDate] = useState<Date | null>(null);

  const handleDateSelect = (selectedDate:any) => {
    setDate(selectedDate);
    alert(`Selected date in parent component: ${selectedDate.toDateString()}`);
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Date Selector</h1>
      <DropdownCalendar onSelectDate={handleDateSelect} />
      {date && <p className="mt-4">Selected Date: {date.toDateString()}</p>}
    </div>
  );
};

export default Test;
