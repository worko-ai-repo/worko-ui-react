import React, { useState } from 'react';
import DropdownCalendar from '@Components/Shared/DropdownCalender';
import './t.css';
import ReferralLoader from '@Components/ReferralRequest/ReferralLoader';
const Test = () => {
	const [date, setDate] = useState<Date | null>(null);

	const handleDateSelect = (selectedDate: any) => {
		setDate(selectedDate);
		alert(`Selected date in parent component: ${selectedDate.toDateString()}`);
	};

	return (
<div >
   <ReferralLoader />
</div>

	);
};

export default Test;
