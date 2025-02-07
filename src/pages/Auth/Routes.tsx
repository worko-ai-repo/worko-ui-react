import Login from '@Components/Auth/Login/Login';
import Signup from '@Components/Auth/Signup/Signup';
import AuthLayout from '@Layouts/Auth/AuthLayout';
import { Loader } from 'lucide-react';
import { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

const AuthRouter = createBrowserRouter([
	{
		path: '/',
		element: <AuthLayout />,
		children: [
			{
				index: true,
				element: (
					<Suspense fallback={<Loader />}>
						<Login />
					</Suspense>
				),
			},
			{
				path: 'signup',
				element: (
					<Suspense fallback={<Loader />}>
						<Signup />
					</Suspense>
				),
			},
		],
	},
]);

export default AuthRouter;
