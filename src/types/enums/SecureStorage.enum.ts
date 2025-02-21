/**
 * enum for SecureStorageKeyDto
 *
 * @description This is an enum for Secure Storage. All the properties of SecureStorageKeyDto are optional. And should
 *  be used to define the structure of SecureStorageKeyDto. This will store all the Key related to SecureStorage.
 * @enum SecureStorageKeyEnum
 */
export enum SecureStorageKeyEnum {
	COGNITOUSERDETAILS = 'cognitoUserDetails',
	USERTOKEN = 'USERTOKEN',
	SIGNINDETAILS = 'SIGNINDETAILS',
	LOGINDETAILS = 'loginDetails',
	REDACTED_SECRET = 'REDACTED_SECRET',
	USEREMAIL = 'USEREMAIL',
	COGNITOUSERID = 'cognitoUserId',
	USERTYPE = 'userType',
	ACCESSTOKEN = 'ACCESSTOKEN',
	LASTACCESSEDDASH = 'lastAccessedDash',
	USERNAME = 'userName',
	LINKEDINUSERTYPE = 'REDACTED_SECRET',
	IS_LINKEDIN_USER = 'REDACTED_SECRET',
	LASTACCESSED_DASH = 'lastAccessedDash',
	IS_COMPANY_LISTING_ROUTE = 'isCompanyListingRoute',
	DYNAMIC_ROUTE = 'dynamicRoute',
}