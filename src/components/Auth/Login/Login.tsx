import { Login_Boy } from '@Assets';
import LoginForm from './LoginForm';
import { useEffect, useState } from 'react';
import MessageModal from '@Components/Modals/MessageModal';
import { AppContext, useAppContext } from '@Context/Main.context';
import { useNavigate } from 'react-router-dom';
import CognitoServiceObj from '@Utils/Cognito.utils';

const Login = () => {
	const navigateTo = useNavigate();
	const [modalData, setModalData] = useState<{
		type: 'none' | 'error' | 'warning' | 'success' | 'info';
		heading?: { message: string; type: 'error' | 'warning' | 'success' | 'info' };
		message: string;
		buttons?: { label: string; action: () => void; type?: 'primary' | 'danger' | 'warning' | 'success' }[];
	} | null>(null);

	const { isLoggedIn, setUpdateCheck } = useAppContext();

	// Function to close the modal
	const handleForceLogin = () => {
		CognitoServiceObj.handleSignOut();
		setModalData(null);
		setUpdateCheck(prev => !prev);
	};

	useEffect(() => {
		if (isLoggedIn) {
			setModalData({
				type: 'warning',
				heading: { message: 'Already Logged In!', type: 'warning' },
				message: 'You Are Already Logged In. Do you wish to logout and continue?',
				buttons: [
					{ label: 'Continue', action: handleForceLogin, type: 'danger' },
					{ label: 'Back to Home', action: () => navigateTo('/') },
				],
			});
		}
	}, []);

	return (
		<div className=" scale-90 flex justify-center relative w-full min-h-[500px] max-w-[1120px] overflow-hidden rounded-xl sm:rounded-3xl bg-white shadow z-20 ">
			<div className=" px-3 sm:px-8 pt-8 pb-16  sm:px:14 flex justify-between w-full items-center ">
				{/* Form and Image */}
				<div className=" img hidden sm:block h-full max-w-[50%]">
					<img src={Login_Boy} alt="login_img" className="w-full h-full object-contain  " />
				</div>
				<div className=" img h-full w-full sm:w-[50%] ">
					<LoginForm />
				</div>
			</div>
			{/* Show modal only when modalData is set */}
			{modalData && (
				<MessageModal
					{...modalData}
					onClose={() => {
						setModalData(null);
					}}
					showCloseButton={false}
				/>
			)}
		</div>
	);
};
export default Login;
