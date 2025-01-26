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