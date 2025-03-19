import { HttpHeaderOptionDto, HttpParamsOptions } from '@Interfaces/HttpOption.dto';
import CognitoServiceObj from './Cognito.utils';

export const getHttpOptions = (authorization = true, params: HttpParamsOptions = {}) => {
	let headers: HttpHeaderOptionDto 
	if(params.fileType){
		headers={'Content-Type': params.fileType}
	}
	else{
		headers={'Content-Type': 'application/json'}
	}
		if (authorization) {
			// Fetch the token from the local storage	
			const token =CognitoServiceObj.getAccessToken();
			if (!token) {
				// console.log('Token not present ,Using Empty Token');
				headers['Authorization'] = `Bearer Passing DummyToken`;
			}
			else{
			headers['Authorization'] = `Bearer ${token}`;
		}
		}

	if (params?.xTenantId) headers['X-TenantID'] = `${params.xTenantId}`;
	if (params?.stateId) headers['stateId'] = `${params.stateId}`;
	if (params?.schoolId) headers['schoolId'] = `${params.schoolId}`;
	if (params?.awsS3Tag && params.fileType) {
		headers = { 'Content-Type': params.fileType };
		headers['x-amz-tagging'] = `${params.awsS3Tag}`;
	}
	  
	return {
		headers,
	};
};
