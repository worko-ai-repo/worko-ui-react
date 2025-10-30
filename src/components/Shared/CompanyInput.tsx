import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search, Building2, X, Linkedin } from 'lucide-react';
import { CompanyShortDto } from '@Interfaces/JobsAndCompany.dto';
import httpServiceObj from '@Services/ApiHandler.service';
import { toast } from 'react-toastify';
import { FieldErrors, useForm } from 'react-hook-form';
import { validationRules } from '@Utils/FormValidator.utils';
import RequestCompany from './RequestCompany';
import { useAppContext } from '@Context/App.context';
import secureStorage from '@Utils/SecureStorage.utils';
import { SecureStorageKeyEnum } from '@Enums/SecureStorage.enum';

export default function CompanyInput({ errors, setValue, clearErrors, setCompanyName, isOtpSent }: { errors: FieldErrors<any>; setValue: any; clearErrors: any; setCompanyName: any; isOtpSent?: boolean }) {
	const [searhText, setSearchText] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCompany, setSelectedCompany] = useState<CompanyShortDto | null>(null);
	const [showModal, setShowModal] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { isLoggedIn } = useAppContext();

	const findCompanies = useCallback<() => Promise<CompanyShortDto[]>>(async () => {
		if (!searhText || searhText.length < 2) return [];
		const { response, error } = await httpServiceObj.get<any>('/company', true, { searchText: searhText });
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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchText(e.target.value);
		setIsOpen(true);
	};

	const handleCompanySelect = (company: CompanyShortDto) => {
		if (company) {
			setSelectedCompany(company);
			setSearchText(company.name);
			setCompanyName(company);
			setValue('company', company.SK);
			clearErrors('company');
		} else {
			setSelectedCompany(null);
			setSearchText('');
			setCompanyName('');
			setValue('company', '');
            // console.log("null is set as company") 
		}
		setIsOpen(false);
	};

	function CompanyAvatar({
		company,
		className,
		nameFallbackClassName,
	}: {
		company: CompanyShortDto;
		className?: string;
		nameFallbackClassName?: string;
	}) {
		const [imgError, setImgError] = React.useState(false);
		const finalLogoUrl = company?.logo
			? `${import.meta.env.APP_WORKO_BASE_URL}/images/${company.logo}`
			: company?.logoUrl;

		if (finalLogoUrl && !imgError) {
			return (
				<img
					src={finalLogoUrl as string}
					alt={company.name}
					className={className}
					loading="lazy"
					onError={() => setImgError(true)}
				/>
			);
		}

		return (
			<Building2 className={nameFallbackClassName || "w-8 h-8 text-gray-400"} />
		);
	}

	return (
		<div className="w-full max-w-auto mx-auto">
			<div className="relative" ref={dropdownRef}>
				<div className="relative">
					<input disabled={isOtpSent} type="text" value={searhText} onChange={handleInputChange} onFocus={() => setIsOpen(true)} readOnly={selectedCompany ? true : false} placeholder="Search for a company..." className={`input_primary auth_input w-full px-4 py-3 pl-14 text-sm border  ${errors.companyName && 'error'}`} />
					{selectedCompany ? (
						<div className="">
							<CompanyAvatar
								company={selectedCompany}
								className="bg-white object-contain absolute left-3 top-1.5 h-8 w-8 rounded"
								nameFallbackClassName="absolute left-3 top-3.5 h-4 w-4 text-gray-400"
							/>
							<X
								onClick={() => {
									setSelectedCompany(null);
									setValue('company', null, { shouldValidate: true });
									setSearchText('');
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
									<CompanyAvatar
										company={company}
										className="bg-white object-contain w-8 h-8 rounded"
										nameFallbackClassName="w-8 h-8 text-gray-400"
									/>
									<div>
										<div className="font-semibold group-hover:text-white  text-gray-600">{company.name}</div>
									</div>
								</button>
							))
						) : searhText.length >= 2 ? (
							<div className="p-4">
								<div className="text-sm text-gray-500 mb-3">No companies found</div>
								{/* {isLoggedIn && ( */}
									<button
										onClick={() => {
											setShowModal(true);
											setIsOpen(false);
										}}
										className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
										Request to add company
									</button>
							
							</div>
						) : (
							<div className="px-4 py-3 text-sm text-gray-500">Type at least 2 characters to searhText</div>
						)}
					</div>
				)}
			</div>
			{showModal && <RequestCompany setShowModal={setShowModal} />}
		</div>
	);
}
