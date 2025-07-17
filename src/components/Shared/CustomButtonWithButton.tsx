import { SignupMode } from '@Components/Auth/Signup/Signup';
import { useAuthContext } from '@Context/Auth.context';
import React, { useLayoutEffect } from 'react';

interface ToggleOption {
	label: string;
	value: SignupMode;
}

interface ToggleProps {
	options: ToggleOption[];
	activeFrame: string;
	setActiveFrame: (frame: any) => void;
}
/**
 * ToggleComponent is a React functional component that renders a toggle switch with sliding background animation.
 * It allows users to switch between different options.
 *
 * @component
 * @param {ToggleOption[]} options - An array of toggle options, each containing a label and a value.
 * @param {string} activeFrame - The currently active frame value.
 * @param {function} setActiveFrame - A function to set the active frame value.
 *
 * @example
 * // Example usage of ToggleComponent
 * import React, { useState } from 'react';
 * import ToggleComponent from './ToggleComponent';
 *
 * const options = [
 *   { label: 'Option 1', value: 'option1' },
 *   { label: 'Option 2', value: 'option2' }
 * ];
 *
 * const App = () => {
 *   const [activeFrame, setActiveFrame] = useState(options[0].value);
 *
 *   return (
 *     <ToggleComponent
 *       options={options}
 *       activeFrame={activeFrame}
 *       setActiveFrame={setActiveFrame}
 *     />
 *   );
 * };
 *
 * export default App;
 */
const CustomButtonWithButton: React.FC<ToggleProps> = ({ options, activeFrame, setActiveFrame }) => {
	//ref to track the select frame
	const selectedFrame = React.useRef<HTMLInputElement>(null);

	//Update The url params to the active frame
	useLayoutEffect(() => {
		const url = new URL(window.location.href);
		url.searchParams.set('mode', activeFrame);
		window.history.replaceState({}, '', url.toString());
	}, [activeFrame]);

	const handleActiveFrame = (frame: SignupMode) => {
		setActiveFrame(frame);
	};
	return (
		<div className="group relative flex w-full rounded-lg border-4 border-white bg-[#F6F6F6]  shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,_rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-1 ">
			{/* Sliding background */}
			<div
				className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-md bg-blue-500 transition-all duration-300 ease-in-out ${
					activeFrame === options[1].value ? 'translate-x-[100%]' : 'translate-x-0'
				}`}
			/>

			{options.map((option, index) => (
				<div key={index} className="relative flex-1 " >
					<input
						ref={selectedFrame}
						type="radio"
						id={option.value}
						name="toggle"
						value={option.value}
						checked={activeFrame === option.value}
						onChange={() => handleActiveFrame(option.value as SignupMode)}
						className="peer absolute opacity-0 w-full h-auto cursor-pointer font-bold "
					/>
					<label
						htmlFor={option.value}
						className="relative block w-full text-center px-1  sm:px-3 sm:py-1 text-sm font-medium cursor-pointer transition-colors duration-200"
					>
						<span className={activeFrame === option.value ? 'text-[10px] sm:text-sm text-white font-bold' : ' text-[10px] sm:text-sm font-bold text-[#7C8FBF] hover:text-gray-400'}>
							{option.label}
						</span>
					</label>
				</div>
			))}
		</div>
	);
};

export default CustomButtonWithButton;
