import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@Layouts/Main-Layout/MainLayout';
import PageNotFound from '@Pages/errors/404/PageNotFound';
import MainLoader from '@Components/Loader/Loader'; 
import TestPage from '@Pages/Test';
import ErrorFallback from '@Pages/errors/base-error/ErrorFallback';
import FAQ from '@Pages/faq/Faq';


// Lazy Load Components
const Hero = lazy(() => import('@Pages/hero/Hero'));
const MockInterview = lazy(() => import('@Pages/mock-interview/MockInterview'));
const Company = lazy(() => import('@Pages/company/Company'));
const AuthRouter = lazy(() => import('@Pages/Auth/Auth.router'));
const Employee = lazy(() => import('@Pages/employee/Employee'));

// Route Configuration
const AppRoutes = createBrowserRouter([
	{
		path: '/',
		errorElement: <ErrorFallback />,
		element: (
				<MainLayout />
		),
		children: [
			{
				index: true,
				element: (
					<Suspense fallback={<MainLoader />}>
						<Hero />
					</Suspense>
				),
			},
			{
				path: 'mock-interview',
				element: (
					<Suspense fallback={<MainLoader />}>
						<TestPage />
					</Suspense>
				),
			},
			{
				path: 'job/*',
				element: (
					<Suspense fallback={<MainLoader />}>
						<Company />
					</Suspense>
				),
			},
			{
				path: 'referral/*',
				element: (
					<Suspense fallback={<MainLoader />}>
						<Company />
					</Suspense>
				),
			},
			{
				path: 'employee',
				element: (
					<Suspense fallback={<MainLoader />}>
						<Employee />
					</Suspense>
				),
			},
			{
				path: 'faq',
				element: (
					<Suspense fallback={<MainLoader />}>
						<FAQ />
					</Suspense>
				),
			},
		],
	},
	{
		path: 'auth/*',
		element: (
			<Suspense fallback={<MainLoader />}>
				<AuthRouter />
			</Suspense>
		),
	},
	{ path: '*', element: <PageNotFound /> },
]);

export default AppRoutes;
