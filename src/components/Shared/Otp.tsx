import React, { useState, useEffect, useRef } from 'react';

interface OTPInputProps {
	length?: number;
	onChange?: (otp: string) => void;
	className?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onChange, className }) => {

	const [otp, setOtp] = useState('- '.repeat(length).trim());
	const inputRef = useRef<HTMLInputElement>(null);

	const formatOtp = (value: string) => {
		const numbers = value.replace(/[^0-9]/g, '').slice(0, length);
		const newOtp = numbers.padEnd(length, '-');
		return newOtp.split('').join(' ');
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formattedOtp = formatOtp(e.target.value);
		setOtp(formattedOtp);
		onChange?.(formattedOtp.replace(/ /g, ''));
		if (inputRef.current) {
			inputRef.current.value = e.target.value.replace(/[^0-9]/g, '').slice(0, length);
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedText = e.clipboardData.getData('text');
		const numbers = pastedText.replace(/[^0-9]/g, '').slice(0, length);
		setOtp(formatOtp(numbers));
		onChange?.(numbers);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && inputRef.current) {
			const newValue = inputRef.current.value.slice(0, -1);
			setOtp(formatOtp(newValue));
			onChange?.(newValue);
		}
	};

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	return (
		<div className={`relative ${className}`}>
			<input 
            ref={inputRef}
            type="text"
            maxLength={length} 
            className="opacity-0 absolute inset-0 w-full h-full z-10" 
            onChange={handleInputChange} 
            onKeyDown={handleKeyDown} 
            onPaste={handlePaste} 
            autoFocus />
			<div className="relative  w-[200px]  h-14 border-2 border-gray-300 rounded-lg flex items-center justify-center font-bold bg-gray-50">
				<span className=" absolute left-6 mx-auto  tracking-[8px] cursor-pointer text-gray-500 font-bold ">{otp}</span>
			</div>
		</div>
	);
};

export default OTPInput;
