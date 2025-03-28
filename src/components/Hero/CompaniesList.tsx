import { logo_text } from '@Assets';
import { CompanyDto } from '@Interfaces/JobsAndCompany.dto';
import httpServiceObj from '@Services/ApiHandler.service';
import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const CompaniesList = () => {
	const navigateTo = useNavigate();
	// Fetch data function
	const fetchData = async () => {
		const { response, error, status } = await httpServiceObj.get<{ data: CompanyDto[] }>(`/company`, true, { pageSize: 25, sortOrder: 'ascending' });

		if (status === 404) return { errorType: 'invalid' };
		if (error) throw new Error('Error fetching data: ' + error);

		return response?.data || [];
	};

	// Fetch data using react-query with improved caching
	const { isLoading, error, data } = useQuery({
		queryKey: ['companiesList'],
		queryFn: fetchData,
		staleTime: 30 * 60 * 1000, // Cache for 30 minutes
		retry: 0,
		refetchOnWindowFocus: false, // Prevent refetching when window regains focus
		refetchOnMount: false, // Prevent refetching on component remount
	});

	// Fallback companies
	const fallbackCompanies = [
		{ logoUrl: logo_text, id: 'fallback-1', name: 'worko' },
		{ logoUrl: logo_text, id: 'fallback-2', name: 'worko' },
		{ logoUrl: logo_text, id: 'fallback-3', name: 'worko' },
		{ logoUrl: logo_text, id: 'fallback-4', name: 'worko' },
		{ logoUrl: logo_text, id: 'fallback-5', name: 'worko' },
		{ logoUrl: logo_text, id: 'fallback-6', name: 'worko' },
	];

	// Use fetched data or fallback and divide into chunks
	const companyData = useMemo(() => {
		const companies = Array.isArray(data) ? data.map(({ id, logo, logoUrl, name }) => ({ id, logo, logoUrl, name })) : fallbackCompanies;

		// Create chunks of 10 companies each
		const firstSet = companies.slice(0, 10);
		const secondSet = companies.slice(10, 20);

		// If secondSet is empty or incomplete, use firstSet as fallback
		const completeSecondSet = secondSet.length < 10 ? firstSet : secondSet;

		return {
			firstSet,
			secondSet: completeSecondSet,
		};
	}, [data]);

	/*   // Handle button click
  const handleButtonClick = (id:any, type:any) => {
    navigateTo(`/${type}?compid=${id}`, { replace: true });
  }; */

	const CompanyCard = ({ company }: { company: any }) => {
		const [imgError, setImgError] = React.useState(false); // State per image

		const finalLogoUrl = company?.logo ? `${import.meta.env.APP_WORKO_BASE_URL}/images/${company?.logo}` : company?.logoUrl;

		return (
			<div className="w-[250px] mx-4 relative group h-full border-1 border-white cursor-pointer" onClick={() => (window.location.href = `/jobs`)}>
				<div className="w-[200px] h-[100px] overflow-hidden flex items-center justify-center">
					{finalLogoUrl && !imgError ? (
						<img
							data-tooltip-id="my-tooltip"
							data-tooltip-content={company.name}
							src={finalLogoUrl}
							alt={company.name}
							loading="lazy"
							className="h-[85%] w-fit object-contain rounded-lg    "
							onError={() => setImgError(true)} // This only affects the current component
						/>
					) : (
						<div className="h-[85%] w-fit flex items-center justify-center text-white text-3xl animate-pulse font-medium">{company.name}</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<section className="lg:max-w-[1500px] mx-auto w-full overflow-hidden py-8 bg-transparent flex items-center my-5">
			<div className="marquee-container w-full flex flex-col gap-4">
				<h2 className="text-full text-white text-3xl font-bold md:text-4xl mb-10">Companies you can work with</h2>

				<div className="flex marquee-content">
					{companyData.firstSet.map((company, index) => (
						<CompanyCard key={`first-${index}`} company={company} />
					))}
					{companyData.firstSet.map((company, index) => (
						<CompanyCard key={`second-${index}`} company={company} />
					))}
				</div>

				<div className="h-0 marquee-content reverse sm:flex sm:h-auto">
					{companyData.secondSet.map((company, index) => (
						<CompanyCard key={`first-sm-${index}`} company={company} />
					))}
					{companyData.secondSet.map((company, index) => (
						<CompanyCard key={`second-sm-${index}`} company={company} />
					))}
				</div>
			</div>
		</section>
	);
};

export default CompaniesList;
