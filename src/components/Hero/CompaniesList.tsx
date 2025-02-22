import { logo_text } from '@Assets';
import { CompanyDto } from '@Interfaces/JobsAndCompany.dto';
import httpServiceObj from '@Services/ApiHandler.service';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CompaniesList = () => {
   const navigateTo = useNavigate();
  // Fetch data function
  const fetchData = async () => {
    const { response, error, status } = await httpServiceObj.get<{ data: CompanyDto[] }>(
      `/company`, 
      true,
	  {
		pageSize:25,
		sortOrder:'ascending'
	  }
    );

    if (status === 404) return { errorType: "invalid" };
    if (error) throw new Error("Error fetching data: " + error);

    return response?.data || [];
  };

  // Fetch data using react-query
  const { isLoading, error, data } = useQuery({
    queryKey: ["companiesList"],
    queryFn: fetchData,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 2, // Retry twice before failing
  });

  // Fallback companies
  const fallbackCompanies = [
    { logoUrl: logo_text, id: "fallback-1", name: "worko" },
    { logoUrl: logo_text, id: "fallback-2", name: "worko" },
    { logoUrl: logo_text, id: "fallback-3", name: "worko" },
    { logoUrl: logo_text, id: "fallback-4", name: "worko" },
    { logoUrl: logo_text, id: "fallback-5", name: "worko" },
    { logoUrl: logo_text, id: "fallback-6", name: "worko" },
  ];

  // Use fetched data or fallback
  const companies = Array.isArray(data) ? data.map(({ id, logoUrl , name }: { id: string; logoUrl: string , name:string }) => ({ id, logoUrl , name })) : fallbackCompanies;

  // Handle button click
  const handleButtonClick = (id: string, type: "referral" | "job") => {
    navigateTo(`/${type}?compid=${id}`, { replace: true });
  };

  const CompanyCard = ({ company }: { company: typeof companies[0] }) => (
    <div className="w-[250px] mx-4 relative group h-full border-1 border-white cursor-pointer ">
      <div className="w-[200px] h-[100px] overflow-hidden flex items-center justify-center">
        <img src={company.logoUrl} alt={company.name} loading='lazy' className=" h-[50%] w-[50%] object-contain  " />
        
		<div className="absolute opacity-0 inset-0 gap-2 flex flex-col items-center justify-center bg-black/75 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out">
          <button onClick={() => handleButtonClick(company.id, "referral")} className="btn_primary">
            Get Referral
          </button>
          <button onClick={() => handleButtonClick(company.id, "job")} className="btn_primary hover:bg-green-700 transition-colors">
            Apply Job
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <section className="lg:max-w-[1120px] mx-auto w-full overflow-hidden py-8 bg-transparent flex items-center my-5">
      <div className="marquee-container w-full flex flex-col gap-4">
        <div className="flex marquee-content">
          {companies.map((company, index) => (
            <CompanyCard key={`first-${index}`} company={company} />
          ))}
          {companies.map((company, index) => (
            <CompanyCard key={`second-${index}`} company={company} />
          ))}
        </div>

        <div className="h-0 marquee-content reverse sm:flex sm:h-auto">
          {companies.map((company, index) => (
            <CompanyCard key={`first-sm-${index}`} company={company} />
          ))}
          {companies.map((company, index) => (
            <CompanyCard key={`second-sm-${index}`} company={company} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompaniesList;
