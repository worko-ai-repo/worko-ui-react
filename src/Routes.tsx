import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@Layouts/Main-Layout/MainLayout';
import PageNotFound from '@Pages/errors/404/PageNotFound';
import MainLoader from '@Components/Loader/Loader';
import TestPage from '@Pages/JobDescriptionPage';
import ErrorFallback from '@Pages/errors/base-error/ErrorFallback';
import FAQ from '@Pages/faq/Faq';
import JobDescription from '@Pages/JobDescriptionPage';
import CorporateDashboard from '@Components/Dashboard/Corporate/Job/Jobs';

// Lazy Load Components
const Hero = lazy(() => import('@Pages/hero/Hero'));
const About = lazy(() => import('@Pages/About/About'));
const Company = lazy(() => import('@Pages/company/Company'));
const Employee = lazy(() => import('@Pages/employee/Employee'));
const Guidance = lazy(() => import('@Pages/guidance/Guidance'));
const AuthRouter = lazy(() => import('@Pages/Auth/Auth.router'));
const Corporate = lazy(() => import('@Pages/corporate/Corporate'));
const DashboardRouter = lazy(() => import('@Pages/Dashboard/Dashboard.router'));
const RequestReferral = lazy(() => import('@Pages/request-referral/RequestReferral'));
const CorporateConnect = lazy(() => import('@Pages/corporate/corporateConnect/CorporateConnect'));
const TermsOfUse = lazy(() => import('@Pages/terms/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('@Pages/privacy-policy/PrivacyPolicy'));
const ContactUs = lazy(() => import('@Pages/contact-us/ContactUs'));
const UnderConstruction = lazy(() => import('@Pages/errors/under-constuction/UnderConstruction'));

const underConstructionPaths = ['faqs', 'blogs', 'privacy', 'contact', 'pricing', 'terms', 'employee/*', 'candidate/*', 'profile/*', 'support'];

// Create routes for under construction pages
const underConstructionRoutes = underConstructionPaths.map(path => ({
	path,
	element: (
		<Suspense fallback={<MainLoader />}>
			<UnderConstruction />
		</Suspense>
	),
}));

// Route Configuration
const AppRoutes = createBrowserRouter([
	{
		path: '/',
		errorElement: <ErrorFallback />,
		element: <MainLayout />,
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
				path: 'jobs/',
				children: [
					{
						index: true,
						element: (
							<Suspense>
								<Company />
							</Suspense>
						),
					},
					{
						path: ':companyName/:jobid',
						element: (
							<Suspense fallback={<MainLoader />}>
								<JobDescription />
							</Suspense>
						),
					},
				],
			},
			{
				path: 'referrals/',
				children: [
					{
						index: true,
						element: (
							<Suspense>
								<Company />
							</Suspense>
						),
					},

					{
						path: ':compId/:id',
						element: (
							<Suspense fallback={<MainLoader />}>
								<RequestReferral />
							</Suspense>
						),
					}
				],
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
			},
			{
				path: 'terms',
				element: (
					<Suspense fallback={<MainLoader />}>
						<TermsOfUse />
					</Suspense>
				),
			},
			{
				path: 'privacy-policy',
				element: (
					<Suspense fallback={<MainLoader />}>
						<PrivacyPolicy />
					</Suspense>
				),
			},
			{
				path: 'contact-us',
				element: (
					<Suspense fallback={<MainLoader />}>
						<ContactUs />
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
			{
				path: 'corporate',
				children: [
					{
						index: true,
						element: (
							<Suspense fallback={<MainLoader />}>
								<Corporate />
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
					},
				],
			},

			{
				path: 'guidance*',
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
	{
		path: 'dashboards/*',
		element: (
			<Suspense fallback={<MainLoader />}>
				<DashboardRouter />
			</Suspense>
		),
	},
	{ path: '*', element: <PageNotFound /> },
]);

export default AppRoutes;
