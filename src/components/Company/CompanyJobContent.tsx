import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import styles from './company.module.scss';
import { useCompanyContext } from '../../context/Company.context';
import { formatRange } from '@Utils/RangeFormater.utils';
import { X } from 'lucide-react';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { useInView } from 'react-intersection-observer';

// Lazy load components
import CompanyCard from './CompanyCard';
import MessageModal from '@Components/Modals/MessageModal';
import { useAppContext } from '@Context/App.context';
import { AuthLoginForGeneralUserDto } from '@Interfaces/Auth.dto';
import CompanyPageFallback from '@Components/Fallback/CompanyPage.fallback';
import { CompanyCardListSkeleton, CompanyCardSkeleton, JobCardListSkeleton, JobCardSkeleton, JobPageFilterSkeleton } from '@Components/Loader/Skeleton/SkeletonLoader';

const JobCard = lazy(() => import('@Components/Company/JobCard'));
const JobFilterPanel = lazy(() => import('./JobFilterPanel'));


const CompanyJobContent = () => {
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);
	const { userDetails }: { userDetails: Partial<AuthLoginForGeneralUserDto> } = useAppContext();
	const { setJobFilters, companyJobData, setSearchText, handleSearch, searchText, resetSearch, companyPageMode, isLoading, companyRefData, isError, hasNextPage, isFetchingNextPage, fetchNextPage, isProfileInclomplete } = useCompanyContext();

	const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);
	const searchInputRef = useRef<HTMLInputElement | null>(null);


	// Debounced fetch function to prevent multiple rapid calls
	// Intersection Observer for Infinite Scroll
	const { ref: inViewRef } = useInView({
		triggerOnce: false,
		onChange: inView => {
			if (inView && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		},
	});

	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.value = '';
		}
		resetSearch();
	}, [companyPageMode]);

	// Set searchText from query param on mount
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const query = params.get('searchText') || '';
		setSearchText(query);
		setJobFilters(prev => ({ ...prev, searchText: query }));
		if (searchInputRef.current) {
			searchInputRef.current.value = query;
		}
	}, []);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		if (searchText) {
			params.set('searchText', searchText);
		} else {
			params.delete('searchText');
		}
		const newUrl = `${window.location.pathname}?${params.toString()}`;
		window.history.replaceState({}, '', newUrl);
	}, [searchText]);

	
	return (
		<div className={`min-h-[100vh] mb-[50px] grid rounded-lg gap-5 sm:max-w-[1380px] mx-auto ${styles.Company_Content}`}>
			{/* Search Bar */}
			<div className={`min-h-[50px] px-3 sm-px-0 p-1 flex justify-center gap-2 mb-5 sm:max-w-full`}>
				<div className="flex-1 md:max-w-[1000px] relative Search_content flex flex-row flex-nowrap">
					<div className="w-full relative display flex">
						<i className="fa-solid fa-magnifying-glass absolute z-10 top-3 left-3 text-gray-300"></i>
						<input
							type="text"
							onKeyDown={e => {
								if (e.key === 'Enter') {
									e.preventDefault();
									handleSearch();
								}
							}}
							ref={searchInputRef}
							onChange={e => setSearchText(e.target.value)}
							className="text-gray-500 relative outline-none w-full text-xs border rounded-s-lg px-3 pl-10 py-2 bg-[#FAFAFA]"
							placeholder={companyPageMode === CompanyPageModeEnum.JOB ? 'Search for Job' : 'Search for Company'}
						/>
						{searchText && (
							<button
								onClick={() => {
									resetSearch();
									if (searchInputRef.current) {
										searchInputRef.current.value = '';
									}
								}}
								className="scale-50 active:scale-[45%] absolute right-[5%] h-full w-fit rounded-full">
								<X className="p-1 text-white bg-blue-600 rounded-full w-full h-full relative" />
							</button>
						)}
					</div>
					<button onClick={handleSearch} className="w-[80px] sm:min-w-max text-xs sm:text-base md:text-lg bg-gradient-to-b from-sky-400 to-blue-600 rounded-e-lg px-3 py-2 text-white flex justify-center items-center">
						<i className="fa-solid fa-magnifying-glass sm:hidden"></i>
						<span className="hidden sm:inline text-sm">{companyPageMode === CompanyPageModeEnum.JOB ? 'Search Job' : 'Search Company'}</span>
					</button>
				</div>

				{/* Filters Button (Mobile) */}
				<button onClick={toggleFilters} className="outline-none text-xs sm:text-base min-w-24 sm:scale-100 border-[1px] border-gray-400 px-3 py-2 rounded-lg md:hidden font-semibold text-gray-600">
					Filters <i className="fa-solid fa-filter"></i>
				</button>
			</div>

			{/* Jobs Section */}
			<div className={`w-[90vw] min-h-[100vh] grid grid-cols-1 md:grid-cols-[minmax(200px,300px)_1fr] gap-5 ${styles.Company_Content_Jobs}`}>
				{/* Filters Section */}
				<div
					className={`absolute w-full top-0 bottom-0 max-w-[300px] md:relative md:w-auto px-5 transition-all duration-500 ease-in-out bg-white z-50 
          ${isFiltersOpen ? 'left-0' : '-left-full'} md:left-0 ${styles.Company_Content_Filters}`}>
					
						
						<Suspense fallback={<JobPageFilterSkeleton />}>
							<JobFilterPanel toggleFilters={toggleFilters} companyPageMode={companyPageMode} />
						
					</Suspense>
				</div>

				{/* Jobs/Referral Section */}
				{companyPageMode === CompanyPageModeEnum.JOB ? (
					<div className="w-full px-2 pt-4 sm:px-4 bg-[#F2F4F5] sm:min-w-[525px] rounded-2xl flex flex-col items-center justify-start sm:pb-6 flex-wrap gap-2 mx-auto min-h-[350px]">
						{isLoading ? (
					<JobCardListSkeleton count={5} />
						) : companyJobData && companyJobData.length > 0 ? (
							<>
								{companyJobData.map((job, index) => {
									const finalCompanyName = job?.externalJobId ? job.companyName : job.companyDetails?.name;
									const Finallocations = !job?.location?.fullLocation?.length ? 'Not Disclosed' : job?.location?.fullLocation.join(', ');
									const finalLogoUrl = job?.companyDetails?.logo ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${job?.companyDetails?.logo}` : job?.companyDetails?.logoUrl;

									const companyLogoUrl = job?.externalJobId ? job?.companyLogoUrl : finalLogoUrl;

									const isLogoAvailable = companyLogoUrl && companyLogoUrl.trim() !== '';
									// const finalLogoUrl =  job.companyDetails?.logo ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${job.companyDetails.logo}` : job.companyDetails?.logoUrl
									return (
										<JobCard
											key={job.id || index}
											job={{
												isLogoAvailable: isLogoAvailable,
												companyLogo: companyLogoUrl,
												title: job.jobTitle,
												department: job.department,
												salary: formatRange(job.salaryRange?.min, job.salaryRange?.max, 'salary'),
												location: Finallocations || 'Not Disclosed',
												employmentType: job.typeofEmployment || 'Not Disclosed',
												createdAt: job.externalJobId ? job.jobPostedDate : job.createdAt,
												matchPercentage: job.matchingScore || -1,
												status: job.applyStatus || 'NOT_APPLIED',
												jobId: job.id,
												isExternalJob: job.externalJobId,
												companyName: finalCompanyName,
												jobdescription: job.jobDescription,
												aboutcompany: job.companyDetails,
												jobStatus: job.status,
												badJob: job.badJob,
												FullJob: job,
												companyId:job.companyId,
												jobUrl: job.jobUrl
											}}
										/>
									);
								})}
								{/* Loading indicator and intersection observer */}
						<div ref={inViewRef} className="w-full min-h-20 flex items-center justify-center">
						{isFetchingNextPage ? <JobCardSkeleton /> : companyJobData.length > 0 && <p className="text-lg font-medium text-gray-500">You've reached the end. No more jobs available for now. Check back later!</p>}
								</div>
							</>
						) : isError ? (
							<p className="text-2xl relative font-medium text-gray-500 top-[43%]">"Something went wrong."</p>
						) : (
							<CompanyPageFallback mode="JOB" />
						)}
					</div>
				) : (
					<div className={`relative grid grid-rows-[min-content] grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[350px] pt-4 bg-[#F2F4F5] ${styles.Company_Content_Companies}`}>
						{isLoading ? (
					<CompanyCardListSkeleton count={12} />
						) : companyRefData && companyRefData.length > 0 ? (
							<>
								{companyRefData.map((company, index) => (
									<div key={company.SK || index} className="min-w-[310px] flex justify-center">
										<CompanyCard companyData={company} />
									</div>
								))}
								{/* Loading indicator and intersection observer */}
						<div ref={inViewRef} className=" min-w-[310px] flex items-center justify-center">
						{isFetchingNextPage && <CompanyCardSkeleton />}
								</div>
							</>
						) : isError ? (
							<p className="text-2xl font-medium text-gray-500 w-full absolute h-full flex items-center justify-center mx-auto">"Something went wrong."</p>
						) : (
							<CompanyPageFallback mode="REFERRAL" />
						)}
					</div>
				)}
			</div>

			{isProfileInclomplete && (
				<MessageModal
					type="warning"
					size="lg"
					heading={{ type: 'warning', message: 'Complete Your Profile' }}
					message="Please complete your profile before searching for jobs or companies."
					onClose={() => {}}
					showCloseButton={false}
					buttons={[
						{
							label: 'Complete Profile',
							action: () => {
								handleEditProfileRedirection((userDetails?.lastAccessedDash as 'CAND' | 'EMP') || 'CAND');
							},
							type: 'primary',
						},
					]}
				/>
			)}
		</div>
	);
};

export default CompanyJobContent;

export function handleEditProfileRedirection(userDetails: 'CAND' | 'EMP') {
	const params = encodeURIComponent(window.location.href);
	window.location.href = `/v1/candidate/edit-profile?returnUrl=${params}`;
}
