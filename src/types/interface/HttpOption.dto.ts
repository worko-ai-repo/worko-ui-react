/**
 * HttpOption Interface
 * 
 * @description The interface for the HttpOption object like headers, body, etc.
 * 
 * @export HttpOption
 */
export interface HttpHeaderOptionDto {
    [key: string]: string;
}

/**
 * HttpParamsOptions Interface
 * 
 * @description The interface for the HttpParamsOptions object like xTenantId, stateId, etc.
 * 
 * @export HttpParamsOptions
 */
export interface HttpParamsOptions {
    xTenantId?: string;
    stateId?: string;
    schoolId?: string;
    awsS3Tag?: string;
    fileType?: string;
    [key : string]: string | undefined;
}

/**
 * HttpMethodResponseDto Interface
 * 
 * @description The interface for the HttpMethodResponseDto object like response and error
 * @generic ResponseDataDto - The type of the response data
 * @export HttpMethodResponseDto
 */
export interface HttpMethodResponseDto<ResponseDataDto>{
    response:ResponseDataDto | null;
    error:Error | null;
    status?:number;
}

/**
 * HttpOption Interface for toast
 */
export interface ApiCallResponse{
    response?: any;
    error?: any;
    status?: number;
}