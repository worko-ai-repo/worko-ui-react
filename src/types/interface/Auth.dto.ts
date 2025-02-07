import { File } from 'buffer';

interface AuthSignupBaseDto {
	name: string;
	emailId: string;
	password: string;
	candidateOtp: string;
	phoneNumber: string;
	confirmPassword: string;
	checkboxChecked: boolean;
	acceptedTermsAndConditions: boolean;
}

export interface AuthSignupCandDto extends AuthSignupBaseDto {
	cv: File;
}
export interface AuthSignupEmpDto extends AuthSignupBaseDto {
	companyName: string;
}
