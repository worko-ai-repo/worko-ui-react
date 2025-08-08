import httpServiceObj from '@Services/ApiHandler.service';

const JOB_BASE_URL = import.meta.env.APP_JOBS_API_URI || '';
const EVALUATOR_DETAIL_URL = `${JOB_BASE_URL}/evaluator-detail/`;

export interface RegisterEvaluatorPayload {
  name: string;
  email: string;
  cognitoUserId: string;
}

export interface EvaluatorResponse {
  PK: string; // "EVAL#{evaluatorEmail}"
  SK: string; // "ID#{id}"
  GSI1PK: string; // "EVAL#"
  GSI1SK: string; // "ID#{id}"
  name: string;
  email: string;
  cognitoUserId: string;
  createdAt: number | string;
  updatedAt: number | string;
}

export interface JobApplicationsResponse {
  applications: any[];
  totalCount: number;
  hasMore: boolean;
}

export interface EvaluationRequest {
  id: string;
  jobId: string;
  companyId: string;
  jobApplicationId: string;
  applicantUserId: string;
  applicantUserEmail: string;
  hrName: string;
  hrCurrentCompanyName: string;
  jobTitle: string;
  hrDetailedFeedback: string;
  createdAt: string;
  evaluatorDetails: {
    name: string;
    email: string;
  };
  applicantName:string;
  createdByUserId?:string;
  createdByCorporateUserId?:string;
  evaluationResponseId?:string;
}

export interface EvaluationDetails extends EvaluationRequest {
  hrHtmlDetailedFeedback: string;
}

export const fetchEvaluationDetails = async (
  jobApplicationId: string,
  evaluationRequestId: string
): Promise<EvaluationDetails> => {
  const url = `${JOB_BASE_URL}/request-evaluation/${jobApplicationId}/${evaluationRequestId}`;
  const { response, error } = await httpServiceObj.get<EvaluationDetails>(url, true, {}, true);

  if (error) throw error;
  return response!;
};

// Core API functions
export const registerEvaluator = async (
  payload: RegisterEvaluatorPayload
): Promise<EvaluatorResponse> => {
  const { response, error } = await httpServiceObj.post<EvaluatorResponse>(
    EVALUATOR_DETAIL_URL, 
    payload, 
    true, 
    {}, 
    true
  );
  
  if (error) {
    console.error('Error registering evaluator:', error);
    throw error;
  }
  
  return response!;
};

export const getEvaluatorById = async (
  id: string
): Promise<EvaluatorResponse> => {
  const url = `${EVALUATOR_DETAIL_URL}${id}`;
  const { response, error } = await httpServiceObj.get<EvaluatorResponse>(
    url, 
    true, 
    {}, 
    true
  );
  
  if (error) {
    console.error('Error fetching evaluator by ID:', error);
    throw error;
  }
  
  return response!;
};

export const getEvaluatorByEmail = async (
  email: string
): Promise<EvaluatorResponse> => {
  const url = `${EVALUATOR_DETAIL_URL}${encodeURIComponent(email)}/email`;
  const { response, error } = await httpServiceObj.get<EvaluatorResponse>(
    url, 
    true, 
    {}, 
    true
  );
  
  if (error) {
    console.error('Error fetching evaluator by email:', error);
    throw error;
  }
  
  return response!;
};

export const getJobApplicationsForEvaluator = async (
  evaluatorEmail: string,
  pageSize: number = 25,
  sortOrder: 'ascending' | 'descending' = 'descending'
): Promise<JobApplicationsResponse> => {
  const url = `${JOB_BASE_URL}/request-evaluation/?evaluatorEmail=${encodeURIComponent(evaluatorEmail)}&pageSize=${pageSize}&sortOrder=${sortOrder}`;
  const { response, error } = await httpServiceObj.get<JobApplicationsResponse>(
    url, 
    true, 
    {}, 
    true
  );
  
  if (error) {
    console.error('Error fetching job applications:', error);
    throw error;
  }
  
  return response!;
};

// Legacy service class for backward compatibility
export class EvaluatorService {
  /**
   * Register evaluator in DynamoDB
   * @param data - Evaluator registration data
   * @returns Promise with success status and optional error
   */
  static async registerEvaluator(data: RegisterEvaluatorPayload): Promise<{ success: boolean; error?: string; data?: EvaluatorResponse }> {
    try {
      const result = await registerEvaluator(data);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Register evaluator error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if evaluator exists in DynamoDB
   * @param email - Evaluator email
   * @returns Promise with inGroup status and optional error
   */
  static async checkEvaluatorGroup(email: string): Promise<{ inGroup: boolean; error?: string; data?: EvaluatorResponse }> {
    try {
      const result = await getEvaluatorByEmail(email);
      return { inGroup: true, data: result };
    } catch (error: any) {
      if (error.status === 404) {
        return { inGroup: false };
      }
      console.error('Check evaluator group error:', error);
      return { inGroup: false, error: error.message };
    }
  }

  /**
   * Get job applications for evaluator
   * @param evaluatorEmail - Evaluator email
   * @param pageSize - Number of applications per page
   * @param sortOrder - Sort order for applications
   * @returns Promise with success status and optional error
   */
  static async getJobApplications(
    evaluatorEmail: string,
    pageSize: number = 25,
    sortOrder: 'ascending' | 'descending' = 'descending'
  ): Promise<{ success: boolean; error?: string; data?: JobApplicationsResponse }> {
    try {
      const result = await getJobApplicationsForEvaluator(evaluatorEmail, pageSize, sortOrder);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Get job applications error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export individual functions for modern usage
export {
  registerEvaluator as registerEvaluatorAPI,
  getEvaluatorById as getEvaluatorByIdAPI,
  getEvaluatorByEmail as getEvaluatorByEmailAPI,
  getJobApplicationsForEvaluator as getJobApplicationsForEvaluatorAPI
};