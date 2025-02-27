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
const About = lazy(() => import('@Pages/About/About'));
const Company = lazy(() => import('@Pages/company/Company'));
const Employee = lazy(() => import('@Pages/employee/Employee'));
const Guidance = lazy(() => import('@Pages/guidance/Guidance'));
const AuthRouter = lazy(() => import('@Pages/Auth/Auth.router'));
const MockInterview = lazy(() => import('@Pages/mock-interview/MockInterview'));
const CorporateConnect  = lazy(() => import('@Pages/corporate-v1/CorporateConnect'));
const UnderConstruction = lazy(() => import('@Pages/errors/under-constuction/UnderConstruction'));

const underConstructionPaths = [
    'faqs',
    'blogs',
    'privacy',
    'contact',
    'pricing',
    'terms',
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
				path: 'test',
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
				path: 'faq',
				element: (
					<Suspense fallback={<MainLoader />}>
						<FAQ />
					</Suspense>
				),
			},{
				path: 'about',
				element: (
					<Suspense fallback={<MainLoader />}>
						<About  />
					</Suspense>
				),
			},
			{
				path: 'for-corporate',
				children: [
					{
						index: true,
						element: (
							<Suspense fallback={<MainLoader />}>
								<Company />
							</Suspense>
						),
					},
					{
						path: 'connect-with-us',
						element: (
							<Suspense fallback={<MainLoader />}>
								<CorporateConnect />
							</Suspense>
						),
					}
				]
			},

			{
				path: 'guidance',
				element: (
					<Suspense fallback={<MainLoader />}>
						<Guidance />
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
