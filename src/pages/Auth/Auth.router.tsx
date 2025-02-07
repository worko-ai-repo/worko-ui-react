import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { Loader } from 'lucide-react';

import PageNotFound from '@Pages/errors/404/PageNotFound';
import Signup from '@Components/Auth/Signup/Signup';
import AuthLayout from '@Layouts/Auth/AuthLayout';
import { auth_bg, auth_bg2 } from '@Assets';

const Login = lazy(() => import('@Components/Auth/Login/Login'));

const Auth = () => {
	let isLoginPage = false;
	useEffect(() => {
		if(window.location.href === '/login')
		isLoginPage = true;
	}, [window.location.href]);
	return (
		<Suspense fallback={<Loader />}>
			{true && (
				<>
					<img src={auth_bg} alt="auth_bg"  className='absolute -left-20 top-10 z-10 '/>
					<img src={auth_bg2} alt="auth_bg2" className='absolute z-10  bottom-10 right-0' />
				</ >
			)}
			<Routes>
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
				</Route>
				<Route path="/*" element={<PageNotFound />} />
			</Routes>
		</Suspense>
	);
};

export default Auth;
