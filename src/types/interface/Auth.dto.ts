import { File } from 'buffer';
import { Upload } from 'lucide-react';

export interface AuthSignupBaseDto {
	name: string;
	emailId: string;
	password: string;
	candidateOtp: string;
	phoneNumber: string;
    companyEmailId?: string;   
    department?: string;
	confirmPassword: string;
	checkboxChecked: boolean;
	acceptedTermsAndConditions: boolean;
    companySk?: string;
}

export interface AuthSignupCandDto extends AuthSignupBaseDto {
	cv: File;
}
export interface AuthSignupEmpDto extends AuthSignupBaseDto {
	companyName: string;
}

/**
 * AuthFormDto
 *
 * @description This interface is used to define the structure of the form data
 */
export interface AuthFormDto {
	name: string;
	phone: string;
	whatsappActive: boolean;
	company: string;
	cv: FileList;
	email: string;
    companyEmailId?: string;
    department?: string;
	password: string;
	confirmPassword: string;
	termsAndConditions: boolean;
}

/**
 * Api Dev User DTO
 */

/**
 * DevEmployeeDto
 *
 * @description This interface is used to define the structure of the employee data for the dev and Api Mutations
 */
export interface DevEmployeeDto {
	name: string;
	email: string;
	number: string;
	YOE: number;
    companyEmailId?: string;
    department?: string;
	companyName: string;
	companySK: string;
	userId: string;
	acceptedTermsAndConditions: boolean;
}

/**
 * DevCandidateDto
 *
 * @description This interface is used to define the structure of the candidate data for the dev and Api Mutations
 */
export interface DevCandidateDto {
	name: string;
	email: string;
	number: string;
	userId: string;
	acceptedTermsAndConditions: boolean;
}
/**
 * Cognito Signup Response Dto
 * 
 * @description This interface is used to define the structure of the response from the cognito signup
 */
export interface CognitoSignupResponse {
    Username: string;
    UserAttributes: UserAttribute[];
    ClientId: string;
	userId: string;
}

/**
 * UserAttribute
 * 
 * @description This interface is used to define the structure of the user attributes
 */

interface UserAttribute {
	Name: string;
	Value: string;
}

/**
 * AwsS3FileUploadResponse
 * 
 * @description This interface is used to define the structure of the response from the AwsS3FileUpload
 */
export interface AwsS3FileUploadResponse {
	awsS3SignedUrl: string;
	cloudFileName: string;
	fileExtension: string;
	fileMimeType: string;
	userFileName: string;
	awsS3Tag:any;
}

/**
 * FileUpload
 * 
 * @description This interface is used to define the structure of the file upload
 */
export interface FileUpload {
    file: any;
    awsS3Tag: string | undefined;
  }

/**
 * AuthLoginForGeneralUserDto
 * 
 */
export interface AuthLoginForGeneralUserDto {
    referralCount: number;
    userType: string[];
    coverLetter: string;
    GSI1SK: string;
    email: string;
    country: string;
    name: string;
    YOE: number;
    cvExtractDate: string;
    profileImage: string;
    CTC: number;
    candidateExperience: CandidateExperience;
    isWhatsappNotificationEnabled: boolean;
    emailList: EmailList;
    about: string;
    id: string;
    isSubscribed: boolean;
    isNumberVerified: boolean;
    isEmailVerified: boolean;
    ECTC: number;
    location: string;
    createdAt: string;
    GSI1PK: string;
    CV: string;
    expiryDate: string;
    lastAccessedDash: string;
    number: string;
    noticePeriod: number;
    updatedAt: string;
    PK: string;
    cvAwsS3SignedUrl: string;
    profileImageAwsS3SignedUrl: string;
}
export interface CandidateExperience {
    department: string;
    companyName: string;
    designation: string;
}
export interface EmailList {
    primary: string;
}