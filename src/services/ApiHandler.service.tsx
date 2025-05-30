import { HttpMethodResponseDto } from '@Interfaces/HttpOption.dto';
import { getHttpOptions } from '@Utils/HttpOptions.utils';

/**
 * @description The HttpService object that contains the methods to make HTTP requests
 *
 * @param {string} path The path of the API endpoint
 * @param {object} data The data to be sent to the API as payload
 * @param {boolean} authorization The flag to check if the request needs authorization
 * @param {HttpParamsOptions} params The additional parameters to be sent to the API
 *
 * @example
 *         > HttpService.post('/path', { data: 'data' }, true, { xTenantId: 'tenantId' });
 *         > HttpService.post('/api/resource', { name: 'Test' }, false, { page: 1, limit: 10 });
 */
export class HttpService {
	// Declare the API_URI variable
	private API_URI: string;

	constructor() {
		this.API_URI = import.meta.env.APP_API_URI || 'https://api.dev.worko.work';
	}

	/**
	 * @method post
	 *
	 * @description This method is used to make a POST request to the API
	 *
	 * @param {string} path The path of the API endpoint
	 * @param {object} data The data to be sent to the API as payload
	 * @param {boolean} authorization The flag to check if the request needs authorization
	 * @param params The additional parameters to be sent to the API
	 *
	 * @example
	 *         > HttpServiceObj.post('/path', { data: 'data' }, true, { xTenantId: 'tenantId' });
	 *         > HttpServiceObj.post('/api/resource', { name: 'Test' }, false, { page: 1, limit: 10 });
	 */
	async post<ResponseDataDto>(path: string, data: object, authorization: boolean = true, params = {}, fullUri: boolean = false): Promise<HttpMethodResponseDto<ResponseDataDto>> {
		try {
			// Build query string and append it to the path
			const queryString = new URLSearchParams(params as Record<string, string>).toString();
			const fullPath = queryString ? `${path}?${queryString}` : path;
			let FetchApiPath;
			// Prepare the options for the POST
			const options = {
				method: 'POST',
				...getHttpOptions(authorization, params),
				body: JSON.stringify(data),
			};

			// Check if the fullUri is true, then use the path as is
			if (fullUri) {
				FetchApiPath = path;
			} else {
				FetchApiPath = `${this.API_URI}${fullPath}`;
			}
			// Make the POST request to the API
			const response = await fetch(FetchApiPath, options);

			// Check if the response is not OK
			if (!response.ok) {
				let responseData = await response.json()
				const errorMessage = responseData?.errorMsg || 'Something went wrong';
				console.error(`HTTP error on POST ${path}:`, errorMessage);
				return { response: null, error: new Error(errorMessage) ,status: response.status };
			}
			// Parse and return the JSON response
			const jsonResponse = (await response.json()) as ResponseDataDto;

			// Return the response and error as null
			return { response: jsonResponse, error: null ,status: response.status};
		} catch (error) {
			// Log the error for debugging
			console.error(`Error in POST request to ${path}:`, error);
			return { response: null, error: error as Error };
		}
	}

	/**
	 * @method get
	 *
	 * @description This method is used to make a GET request to the API
	 *
	 * @param {string} path The path of the API endpoint
	 * @param {boolean} authorization The flag to check if the request needs authorization
	 * @param params The additional parameters to be sent to the API
	 *
	 * @example
	 *         > HttpServiceObj.get('/path', true, { xTenantId: 'tenantId' });
	 */
	 async get<ResponseDataDto>(path: string, authorization: boolean = true, params = {}, fullUri: boolean = false): Promise<HttpMethodResponseDto<ResponseDataDto>> {
		try {
			// Build query string and append it to the path
			const queryString = new URLSearchParams(params as Record<string, string>).toString();
			const fullPath = queryString ? `${path}?${queryString}` : path;
			let response;
			const options = {
				method: 'GET',
				...getHttpOptions(authorization, params),
			};
			if (fullUri) {
				// Make the GET request to the API
			 response = await fetch(fullPath, options);
			} else {
				response = await fetch(`${this.API_URI}${fullPath}`, options);
			}
			

			// Check if the response is not OK
			if (!response.ok) {
				const errorMessage = `HTTP error! status: ${response.status}, message: ${response.statusText}`;
				console.error(`HTTP error on GET ${path}:`, errorMessage);
				return { response: null, error: new Error(errorMessage),status: response.status };
			}
			// Parse and return the JSON response
			const jsonResponse = await response.json() as ResponseDataDto;

			// Return the response and error as null
			return { response: jsonResponse, error: null ,status: response.status};
		} catch (error) {
			// Log the error for debugging
			console.error(`Error in GET request to ${path}:`, error);
			return { response: null, error: error as Error };
		}
	};

	/**
	 * @method put
	 *
	 * @description This method is used to make a PUT request to the API
	 *
	 * @param {string} path The path of the API endpoint
	 * @param {object} data The data to be sent to the API as payload
	 * @param {boolean} authorization The flag to check if the request needs authorization
	 * @param params The additional parameters to be sent to the API
	 */
	async put<ResponseDataDto>(path: string, data: object, authorization: boolean = true, params = {}, fullUri: boolean = false): Promise<HttpMethodResponseDto<ResponseDataDto>> {
		try {
			// Build query string and append it to the path
			const queryString = new URLSearchParams(params as Record<string, string>).toString();
			const fullPath = queryString ? `${path}?${queryString}` : path;
			let FetchApiPath;

			const options = {
				method: 'PUT',
				...getHttpOptions(authorization, params),
				body: data instanceof File ? data : JSON.stringify(data),
				//mode: 'no-cors' as RequestMode //test
			};

			// Determine the final URL
			FetchApiPath = fullUri ? path : `${this.API_URI}${fullPath}`;

			// Make the PUT request to the API
			const response = await fetch(FetchApiPath, options);

			// Check if the response is not OK
			if (!response.ok) {
				const errorMessage = `HTTP error! status: ${response.status}, message: ${response.statusText}`;
				console.error(`HTTP error on PUT ${path}:`, errorMessage);
				return { response: null, error: new Error(errorMessage) };
			}

			// Handle empty responses (204 No Content or other cases)
			let jsonResponse: ResponseDataDto | null = null;
			const contentType = response.headers.get('content-type');

			if (contentType && contentType.includes('application/json')) {
				jsonResponse = await response.json() as ResponseDataDto;
			}

			return { response: jsonResponse, error: null };
		} catch (error) {
			console.error(`Error in PUT request to ${path}:`, error);
			return { response: null, error: error as Error };
		}
	}

	/**
	 * @method patch
	 *
	 * @description This method is used to make a PATCH request to the API
	 *
	 * @param {string} path The path of the API endpoint
	 * @param {object} data The data to be sent to the API as payload
	 * @param {boolean} authorization The flag to check if the request needs authorization
	 * @param params The additional parameters to be sent to the API
	 */
	async patch<ResponseDataDto>(
		path: string,
		data: object,
		authorization: boolean = true,
		params = {},
		fullUri: boolean = false
	  ): Promise<HttpMethodResponseDto<ResponseDataDto>> {
		try {
		  const queryString = new URLSearchParams(params as Record<string, string>).toString();
		  const fullPath = queryString ? `${path}?${queryString}` : path;
		  const FetchApiPath = fullUri ? path : `${this.API_URI}${fullPath}`;
	  
		  const options = {
			method: 'PATCH',
			...getHttpOptions(authorization, params),
			body: JSON.stringify(data),
		  };
	  
		//   console.log('PATCH request:', FetchApiPath, options); // Debugging
	  
		  const response = await fetch(FetchApiPath, options);
	  
		  // If the response status is 204 No Content, return immediately
		  if (response.status === 204) {
			return { response: null, error: null, status: 204 };
		  }
	  
		  if (!response.ok) {
			const errorText = await response.text(); // Read response as text
			const errorMessage = `HTTP error! status: ${response.status}, message: ${errorText || "No response body"}`;
			console.error(`HTTP error on PATCH ${path}:`, errorMessage);
			return { response: null, error: new Error(errorMessage), status: response.status };
		  }
	  
		  const contentType = response.headers.get('content-type');
	  
		  let jsonResponse: ResponseDataDto | null = null;
		  if (contentType && contentType.includes('application/json')) {
			const responseText = await response.text();
			jsonResponse = responseText ? JSON.parse(responseText) : null;
		  }
	  
		  return { response: jsonResponse, error: null, status: response.status };
		} catch (error) {
		  console.error(`Error in PATCH request to ${path}:`, error);
		  return { response: null, error: error as Error, status: 500 };
		}
	  }
	  
	  
	/**
	 * @method delete
	 *
	 * @description This method is used to make a DELETE request to the API
	 *
	 * @param {string} path The path of the API endpoint
	 * @param {boolean} authorization The flag to check if the request needs authorization
	 * @param params The additional parameters to be sent to the API
	 */
	delete = async (path: string, authorization: boolean = true, params = {}) => {
		try {
			// Build query string and append it to the path
			const queryString = new URLSearchParams(params as Record<string, string>).toString();
			const fullPath = queryString ? `${path}?${queryString}` : path;
			const options = {
				method: 'DELETE',
				...getHttpOptions(authorization, params),
			};

			// Make the DELETE request to the API
			const response = await fetch(`${this.API_URI}${fullPath}`, options);

			// Check if the response is not OK
			if (!response.ok) {
				const errorMessage = `HTTP error! status: ${response.status}, message: ${response.statusText}`;
				console.error(`HTTP error on DELETE ${path}:`, errorMessage);
				return { response: null, error: new Error(errorMessage) };
			}
			// Delete most likely won't return anything
			return { response: null, error: null };
		} catch (error) {
			// Log the error for debugging
			console.error(`Error in DELETE request to ${path}:`, error);
			return { response: null, error };
		}
	};
	// Add OPTIONS ,HEAD, etc., if needed
}

// Create an instance of the HttpService object
const httpServiceObj = new HttpService();

// Export the HttpService object
export default httpServiceObj;
