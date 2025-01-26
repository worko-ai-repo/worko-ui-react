import { HttpHeaderOptionDto, HttpParamsOptions } from '@Interfaces/HttpOption.dto';

export const getHttpOptions = (authorization = true, params: HttpParamsOptions = {}) => {
	let headers: HttpHeaderOptionDto = {
		'Content-Type': 'application/json',
	};

	if (authorization) {
		// Fetch the token from the local storage
		const token = localStorage.getItem('accessToken');
		if (!token) {
			console.log('Token not present , Aborting request');
			return;
		}
		headers['Authorization'] = `Bearer ${token}`;
	}

	if (params?.xTenantId) headers['X-TenantID'] = `${params.xTenantId}`;
	if (params?.stateId) headers['stateId'] = `${params.stateId}`;
	if (params?.schoolId) headers['schoolId'] = `${params.schoolId}`;
	return {
		headers,
	};
};
