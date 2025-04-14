import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import CompanyBanner from '@Components/Company/CompanyBanner';
import { CompanyProvider } from '../../context/Company.context';
import JobRefButton from '@Components/Company/JobRefButton';

const CompanyJobContent = lazy(() => import('@Components/Company/CompanyJobContent'));

const Company = () => {
	return (
		<div className="h-full w-full bg-transparent">
			<CompanyProvider>
				<CompanyBanner />

				{/* Absolutely positioned toggle container */}
				<div className="relative left-1/2 -translate-x-1/2 scale-90 sm:scale-100 -top-[20px] w-full max-w-[200px] z-10">
					<JobRefButton />
				</div>

				{/* Lazy Loading with Suspense */}
				<Suspense>
					<CompanyJobContent />
				</Suspense>
			</CompanyProvider>
		</div>
	);
};

export default Company;
