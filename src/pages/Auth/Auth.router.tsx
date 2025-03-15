import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CorporateLogin from '@Components/Auth/Corporate/Login/CorporateLogin';
import CheckRedirection from '@Components/Auth/CheckRedirection';
import MainLoader from '@Components/Loader/Loader';
import { AuthProvider } from '@Context/Auth.context';

const Login = lazy(() => import('@Components/Auth/Login/Login'));
const AuthLayout = lazy(() => import('@Layouts/Auth/AuthLayout'));
const Signup = lazy(() => import('@Components/Auth/Signup/Signup'));
const PageNotFound = lazy(() => import('@Pages/errors/404/PageNotFound'));
const LinkedInSignup = lazy(() => import('@Components/Auth/Linkedin/LinkedInSignup'));
const ForgotPassword = lazy(() => import('@Components/Auth/Reset-Password/ForgotPassword'));
const CorporateSignup = lazy(() => import('@Components/Auth/Corporate/Signup/CorporateSignup'));

const Auth = () => {
	return (<AuthProvider>
		<Suspense fallback={<MainLoader />}>
			<Routes>
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/resetpassword" element={<ForgotPassword />} />
					<Route path="/checkRedirection*" element={<CheckRedirection />} />
					<Route path = "/linkedinSignup" element = {<LinkedInSignup />} />
				</Route>
				{/* <Route path="/corporate/signup/:id" element={<CorporateSignup />} />
				<Route path="/corporate/login" element={<CorporateLogin />} /> */}
				<Route path="/*" element={<PageNotFound />} />
			</Routes>
		</Suspense>
	</AuthProvider>
	);
};

export default Auth;
