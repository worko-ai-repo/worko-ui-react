import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@Layouts/Main-Layout/MainLayout';
import PageNotFound from '@Pages/errors/404/PageNotFound';
import MainLoader from '@Components/Loader/Loader'; 
import TestPage from '@Pages/Test';
import ErrorFallback from '@Pages/errors/base-error/ErrorFallback';



// Lazy Load Components
const Hero = lazy(() => import('@Pages/hero/Hero'));
const MockInterview = lazy(() => import('@Pages/mock-interview/MockInterview'));
const Company = lazy(() => import('@Pages/company/Company'));
const AuthRouter = lazy(() => import('@Pages/Auth/Auth.router'));
const UnderConstruction = lazy(() => import('@Pages/errors/under-constuction/UnderConstruction'));
const Employee = lazy(() => import('@Pages/employee/Employee'));
const About = lazy(() => import('@Pages/About/About'));

const underConstructionPaths = [
    'faqs',
    'blogs',
    'privacy',
    'contact',
    'pricing',
    'terms',
	'guidance',
	'employee/*',
	'candidate/*',
	'dashboard/*',
	'profile/*',
	'support',
];

// Create routes for under construction pages
const underConstructionRoutes = underConstructionPaths.map(path => ({
    path,
    element: (
        <Suspense fallback={<MainLoader />}>
            <UnderConstruction />
        </Suspense>
    )
}));

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
				path: 'job*',
				element: (
					<Suspense fallback={<MainLoader />}>
						<Company />
					</Suspense>
				),
			},
			{
				path: 'referral*',
				element: (
					<Suspense fallback={<MainLoader />}>
						<Company />
					</Suspense>
				),
			},
			{
				path: 'for-employee',
				element: (
					<Suspense fallback={<MainLoader />}>
						<Employee />
					</Suspense>
				),
			},
			{
				path: 'about',
				element: (
					<Suspense fallback={<MainLoader />}>
						<About />
					</Suspense>
				),
			},
			...underConstructionRoutes,
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
