import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface MessagePopupProps {
	type: 'none' | 'error' | 'warning' | 'success' | 'info';
	size?: 'sm' | '10' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
	heading?: { message: string; type: 'error' | 'warning' | 'success' | 'info' };
	message: string;
	buttons?: { label: string; action: () => void; type?: 'primary' | 'danger' | 'warning' | 'success' }[];
	onClose?: () => void;
	showCloseButton?: boolean;
}

// Icons based on type
const icons = {
	none: null,
	error: <XCircle className="text-red-500 w-6 h-6" />,
	warning: <AlertTriangle className="text-yellow-500 w-6 h-6" />,
	success: <CheckCircle className="text-green-500 w-6 h-6" />,
	info: <Info className="text-blue-500 w-6 h-6" />,
};

// Button colors based on type
const buttonStyles = {
	primary: 'bg-blue-500 hover:bg-blue-600 text-white',
	danger: 'bg-red-500 hover:bg-red-600 text-white',
	warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
	success: 'bg-green-500 hover:bg-green-600 text-white',
};
const HeadingStyles = {
	error: 'text-red-500',
	warning: 'text-yellow-500',
	success: 'text-green-500',
	info: 'text-blue-500',
};
const sizeClasses = {
	sm: 'max-w-sm min-w-sm w-sm',
	'10': 'max-w-10 min-w-10 w-10',
	md: 'max-w-md min-w-md w-md',
	lg: 'max-w-lg min-w-lg w-lg',
	xl: 'max-w-xl min-w-xl w-xl',
	'2xl': 'max-w-2xl min-w-2xl w-2xl',
	'3xl': 'max-w-3xl min-w-3xl w-3xl',
	'4xl': 'max-w-4xl min-w-4xl w-4xl',
};

export default function MessageModal({ type, heading, size = '2xl', message, buttons = [], onClose, showCloseButton = true }: MessagePopupProps) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter') {
				event.preventDefault();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	// Portal to body
	return createPortal(
		<div className="overflow-y-hidden fixed inset-0 flex items-center justify-center bg-black/50 w-full backdrop-blur-sm z-50  ">
			<div className={` bg-white rounded-xl shadow-xl p-5 transform transition-transform scale-95 opacity-1 animate-fadeIn ${sizeClasses[size] || sizeClasses['2xl']} `}>
				<div className="flex flex-col items-center">
					<div className="flex gap-2 items-center justify-center ">
						{icons[type]}
						{heading && <h2 className={`text-xl font-bold ${HeadingStyles[heading.type]}`}>{heading.message}</h2>}
					</div>
					<p className="mt-5 mb-2 text-gray-700 flex-1 text-justify max-h-[50vh] overflow-auto px-4" dangerouslySetInnerHTML={{ __html: message }}></p>
					<div className="relative w-full">
						{showCloseButton && onClose && (
							<button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
								✖
							</button>
						)}
					</div>
				</div>
				<div className="flex justify-end gap-2 mt-4">
					{buttons.map((btn, index) => (
						<button key={index} onClick={btn.action} className={`px-4 py-2 rounded ${buttonStyles[btn.type || 'primary']}`}>
							{btn.label}
						</button>
					))}
				</div>
			</div>
		</div>,
		document.body
	);
}
