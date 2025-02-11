import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Loader } from 'lucide-react';

import PageNotFound from '@Pages/errors/404/PageNotFound';
import Signup from '@Components/Auth/Signup/Signup';
import AuthLayout from '@Layouts/Auth/AuthLayout';
import { auth_bg, auth_bg2 } from '@Assets';
import ForgotPassword from '@Components/Auth/Reset-Password/ForgotPassword';

const Login = lazy(() => import('@Components/Auth/Login/Login'));

const Auth = () => {
	return (
		<Suspense fallback={<Loader />}>
			<Routes>
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/resetpassword" element={<ForgotPassword />} />
				</Route>
				<Route path="/*" element={<PageNotFound />} />
			</Routes>
		</Suspense>
	);
};

export default Auth;
