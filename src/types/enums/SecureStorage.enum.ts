/**
 * enum for SecureStorageKeyDto
 *
 * @description This is an enum for Secure Storage. All the properties of SecureStorageKeyDto are optional. And should
 *  be used to define the structure of SecureStorageKeyDto. This will store all the Key related to SecureStorage.
 * @enum SecureStorageKeyEnum
 */
export enum SecureStorageKeyEnum {
	USERTOKEN = 'USERTOKEN',
	SIGNINDETAILS = 'SIGNINDETAILS',
	REDACTED_SECRET = 'REDACTED_SECRET',
	USEREMAIL = 'USEREMAIL',
	COGNITOUSERID = 'cognitoUserId',
	USERTYPE = 'userType',
	ACCESSTOKEN = 'ACCESSTOKEN',
	LASTACCESSEDDASH = 'lastAccessedDash',
	USERNAME = 'userName',
}