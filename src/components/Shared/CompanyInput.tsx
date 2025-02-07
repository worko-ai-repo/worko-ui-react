import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, Building2, X, Linkedin } from 'lucide-react';
import { CompanyShortDto } from '@Interfaces/JobsAndCompany.dto';
import httpServiceObj from '@Services/ApiHandler.service';
import { toast } from 'react-toastify';
import { FieldErrors, } from 'react-hook-form';
import RequestCompany from './RequestCompany';
import { useAppContext } from '@Context/Main.context';

export default function CompanyInput({
	 errors,
    setValue,
    setError,
    clearErrors,
	hasLabel,
	formKey,
	
}: {
	hasLabel: boolean;
	formKey: string
    errors?: FieldErrors<any>;
    setValue: any;
    setError?: any;
    clearErrors?:any;

}) {
	const [searhText, setSearchText] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<CompanyShortDto | null>(null);
	const [showModal, setShowModal] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
    const { isLoggedIn } = useAppContext();

	


	const findCompanies = useCallback<() => Promise<CompanyShortDto[]>>(async () => {
		if (!searhText || searhText.length < 2) return [];
		const { response, error } = await httpServiceObj.get('/company', true, { searchText: searhText });
		if (error) throw error;
		return response.data as CompanyShortDto[];
	}, [searhText]);

	/**
	 * Queries for fetching companies and posting company request
	 */
	const { data: companies, isLoading } = useQuery({
		queryKey: ['companies', searhText],
		queryFn: findCompanies,
		enabled: searhText.length >= 2,
		staleTime: 200, // 2 sec
	});



	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// if the dropdown is open and the click is outside the dropdown, close it
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		// add event listener when the component is mounted
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

    const handleCompanySelect = (company: CompanyShortDto | null) => {
        if (company) {
            const value = company.SK;
            setValue(formKey, value, { shouldValidate: true });
            setSelectedCompany(company);
            setSearchText(company.name);
        } else {
            setValue(formKey, undefined, { shouldValidate: true }); // Set to undefined when no company
            setSelectedCompany(null);
            setSearchText('');
        }
        setIsOpen(false);
        if (clearErrors) { clearErrors(formKey); }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
        setIsOpen(true);
        if (!e.target.value) {  // Clear if input is empty
            handleCompanySelect(null); // or setValue(formKey, undefined, { shouldValidate: true });
        }
    };

	const handleBlurValidation = () => {
		if (!selectedCompany) {
			setValue(formKey, '', { shouldValidate: true });
			setError(formKey, {
				type: 'manual',
				message: 'Please select a company from the dropdown',
			});
			setSearchText('');
		}
	};
	return (
		<div className="w-full max-w-md mx-auto">
			<div className="relative" ref={dropdownRef}>
				<div className="relative">
					<input type="text" value={searhText} onBlur={()=>handleBlurValidation()} onChange={handleInputChange} onFocus={() => setIsOpen(true)} readOnly={selectedCompany ? true : false} placeholder="Search for a company..." className={`w-full px-4 py-2.5 pl-14 text-sm border bg-white border-gray-300 rounded-lg ${errors?.formKey && 'error'}`} />
					{selectedCompany ? (
						<div className="">
							{selectedCompany.logo ? <img src={selectedCompany.logoUrl} alt={selectedCompany.name} className="bg-white object-contain absolute left-3 top-1.5 h-8 w-8 rounded" /> : <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />}
							<X
								onClick={() => {
									setSelectedCompany(null);
									setSearchText('');
									setValue(formKey, '', { shouldValidate: true });
								}}
								className=" active:scale-90 cursor-pointer p-1 text-white bg-blue-600 rounded-full absolute right-3 top-3.5 h-4 w-4 "
							/>
						</div>
					) : (
						<Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
					)}
				</div>

				{isOpen && (
					<div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
						{isLoading ? (
							<div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
						) : companies && companies.length > 0 ? (
							companies.map(company => (
								<button key={company.SK} onClick={() => handleCompanySelect(company)} className="group  w-full px-4 py-2 text-left hover:bg-blue-400 hover:text-white  flex items-center gap-3 border-b border-gray-100 last:border-0">
									{company.logo ? <img src={company.logoUrl} alt={company.name} className="bg-white object-contain w-8 h-8 rounded" /> : <Building2 className="w-8 h-8 text-gray-400" />}
									<div>
										<div className="font-semibold group-hover:text-white  text-gray-600">{company.name}</div>
									</div>
								</button>
							))
						) : searhText.length >= 2 ? (
							<div className="p-4">
								<div className="text-sm text-gray-500 mb-3">No companies found</div>
								{isLoggedIn && <button
									onClick={() => {
										setShowModal(true);
										setIsOpen(false);
									}}
									className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
									Request to add company
								</button>}
							</div>
						) : (
							<div className="px-4 py-3 text-sm text-gray-500">Type at least 2 characters to searhText</div>
						)}
					</div>
				)}
			</div>
			{showModal && (
				<RequestCompany  setShowModal={setShowModal} />
			)}
		</div>
	);
}
