import { lazy, Suspense, useRef, useState } from 'react';
import styles from './company.module.scss';
import { useCompanyContext } from '../../context/Company.context';
import { formatRange } from '@Utils/RangeFormater.utils';
import { Loader, X } from 'lucide-react';
import MainLoader from '@Components/Loader/Loader';
import CompanyCard from './CompanyCard';
import { CompanyPageModeEnum } from '@Interfaces/CompanyContext.dto';
import { useInView } from 'react-intersection-observer';

// Lazy load components
const JobCard = lazy(() => import('@Components/Company/JobCard'));
const JobFilterPanel = lazy(() => import('./JobFilterPanel'));
const RequestCompany = lazy(() => import('./RequestCompany'));

const CompanyJobContent = () => {
	const [isFiltersOpen, setIsFiltersOpen] = useState(false);

	const { companyJobData, setSearchText, handleSearch, searchText, resetSearch, companyPageMode, isLoading, companyRefData, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useCompanyContext();

	const toggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

	const searchInputRef = useRef<HTMLInputElement | null>(null);

	// Intersection Observer for Infinite Scroll
	const { ref: inViewRef } = useInView({
		triggerOnce: false,
		onChange: inView => {
			if (inView && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		},
	});

	return (
		<div className={`min-h-[100vh] mb-[50px]  grid rounded-lg  gap-5 sm:max-w-[1280px] mx-auto ${styles.Company_Content}`}>
			{/* Search Bar */}
			<div className={` min-h-[50px] px-3 sm-px-0 p-1 flex justify-center md:justify-end  gap-2 sm:max-w-full `}>
				<div className=" flex-1  md:max-w-[700px] relative  Search_content flex  flex-row flex-nowrap">
					<div className="w-full relative display flex ">
						<input type="text" ref={searchInputRef} onChange={e => setSearchText(e.target.value)} className="font-semibold text-gray-500 relative outline-none w-full text-xs sm:text-base bg-transparent border-[1px] border-gray-400 rounded-s-xl px-3 py-2 " placeholder="Search for jobs" />
						{searchText && (
							<button
								onClick={() => {
									resetSearch();
									if (searchInputRef.current) {
										searchInputRef.current.value = '';
									}
								}}
								className=" scale-50 active:scale-[45%] absolute right-[5%]   h-full w-fit rounded-full ">
								<X className=" p-1 text-white bg-blue-600 rounded-full w-full h-full relative " />
							</button>
						)}
					</div>
					<button onClick={handleSearch} className=" w-[80px] sm:min-w-[150px] text-xs sm:text-base md:text-lg bg-blue-600 rounded-e-xl px-3 py-2 border-[1px] border-blue-600 text-white">
						<i className="fa-solid fa-magnifying-glass sm:hidden"></i> <span className="hidden sm:inline">Search Job</span>
					</button>
				</div>

				{/* Filters Button (Mobile) */}
				<button onClick={toggleFilters} className="outline-none text-xs sm:text-base min-w-24 sm:scale-100 border-[1px] border-gray-400 px-3 py-2 rounded-2xl md:hidden font-semibold text-gray-600">
					Filters <i className="fa-solid fa-filter"></i>
				</button>
			</div>

			{/* Jobs Section 
			 jobs w-[80%] rounded-lg   
			 */}
			<div className={`w-[90vw] min-h-[100vh] grid grid-cols-1 md:grid-cols-[minmax(200px,300px)_1fr] gap-5 ${styles.Company_Content_Jobs}`}>
				{/* Filters Section */}
				<div
					className={`absolute w-full top-0 bottom-0 max-w-[300px] shadow-2xl md:relative md:w-auto filters rounded-lg p-5 transition-all duration-500 ease-in-out bg-white z-50 
        ${isFiltersOpen ? 'left-0' : '-left-full'} md:left-0 ${styles.Company_Content_Filters}`}>
					<Suspense
						fallback={
							<div className="h-16 flex justify-center items-center">
								<Loader />
							</div>
						}>
						{isLoading ? <Loader className="relative left-[45%]  " /> : <JobFilterPanel toggleFilters={toggleFilters} />}
					</Suspense>
					{companyPageMode === CompanyPageModeEnum.REFERRAL ? <RequestCompany /> : null}
				</div>

				{/* Jobs/Referral Section sm:shadow-[inset_0px_0px_16px_22px_rgba(0,_0,_0,_0.1)]*/}
				{companyPageMode === CompanyPageModeEnum.JOB ? (
					<div className="w-full px-2 sm:px-0 sm:min-w-[525px] rounded-2xl flex flex-col items-center justify-start sm:py-5 flex-wrap gap-2 mx-auto min-h-[350px] sm:shadow-[0px_0px_16px_12px_rgba(0,_0,_0,_0.1)]">
						{/* Show loader only if there’s no initial data */}
						{isLoading ? (
							<MainLoader />
						) : companyJobData && companyJobData.length > 0 ? (
							companyJobData.map((job, index) => (
								<JobCard
									key={job.id || index}
									job={{
										companyLogo: job.companyDetails?.logoUrl,
										title: job.jobTitle,
										department: job.department,
										salary: formatRange(job.salaryRange?.min, job.salaryRange?.max, 'salary'),
										location: job.location,
										employmentType: job.typeofEmployment,
										workMode: job.workMode,
										skills: [...(job.technicalSkills || []), ...(job.coreSkills || [])].slice(0, 4),
										createdAt: job.createdAt,
										matchPercentage: 75,
									}}
								/>
							))
						) : (
							<p className="text-2xl relative font-medium text-gray-500 top-[43%]">{isError ? 'Something went wrong.' : "Sorry, we couldn't find anything here."}</p>
						)}

						{/* Show bottom loading indicator when fetching more */}
						{isFetchingNextPage && <Loader />}

						{/* Intersection Observer for infinite scroll */}
						<div ref={inViewRef} />
					</div>
				) : (
					<div className={`relative grid grid-rows-[min-content] grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-4 w-full px-2 sm:px-3 md:py-6 rounded-2xl mx-auto sm:py-2 min-h-[350px] sm:shadow-[0px_0px_16px_12px_rgba(0,_0,_0,_0.1)] ` + styles.Company_Content_Companies}>
						{isLoading ? (
							<div className="absolute left-[40%] ">
								<MainLoader />
							</div>
						) : companyRefData && companyRefData.length > 0 ? (
							companyRefData.map((company, index) => (
								<div key={company.SK || index} className="min-w-[300px] flex justify-center">
									<CompanyCard companyData={company} />
								</div>
							))
						) : (
							<p className="text-2xl relative font-medium text-gray-500 top-[43%]">{isError ? 'Something went wrong.' : "Sorry, we couldn't find anything here."}</p>
						)}

						{/* Show bottom loading indicator when fetching more */}
						{isFetchingNextPage && <Loader className="absolute bottom-1 left-[50%] " />}

						{/* Intersection Observer for infinite scroll */}
						<div ref={inViewRef} />
					</div>
				)}
			</div>
		</div>
	);
};

export default CompanyJobContent;
