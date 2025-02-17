import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@Layouts/Main-Layout/MainLayout';
import PageNotFound from '@Pages/errors/404/PageNotFound';
import Loader from '@Components/Loader/Loader';
import CompanyInput from '@Components/Shared/CompanyInput';
import TestPage from '@Pages/Test';

// Lazy Load Components
const Hero = lazy(() => import('@Pages/hero/Hero'));
const MockInterview = lazy(() => import('@Pages/mock-interview/MockInterview'));
const Company = lazy(() => import('@Pages/company/Company'));
const AuthRouter = lazy(() => import('@Pages/Auth/Auth.router'));

// Route Configuration
const AppRoutes = createBrowserRouter([
	{
		path: '/',
		element: (
				<MainLayout />
		),
		children: [
			{
				index: true,
				element: (
					<Suspense fallback={<Loader />}>
						<Hero />
					</Suspense>
				),
			},
			{
				path: 'mock-interview',
				element: (
					<Suspense fallback={<Loader />}>
						<TestPage />
					</Suspense>
				),
			},
			{
				path: 'job/*',
				element: (
					<Suspense fallback={<Loader />}>
						<Company />
					</Suspense>
				),
			},
			{
				path: 'referral/*',
				element: (
					<Suspense fallback={<Loader />}>
						<Company />
					</Suspense>
				),
			},
		],
	},
	{
		path: 'auth/*',
		element: (
			<Suspense fallback={<Loader />}>
				<AuthRouter />
			</Suspense>
		),
	},
	{ path: '*', element: <PageNotFound /> },
]);

export default AppRoutes;
