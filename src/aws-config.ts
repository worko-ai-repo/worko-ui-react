export interface AwsconfigDto {
   aws_project_region: string;
   aws_cognito_region: string;
   aws_user_pools_id: string;
   aws_user_pools_web_client_id: string;
   aws_user_pools_web_client_secret?: string;
   oauth: {
      domain: string;
      redirectSignIn: string;
      redirectSignOut: string;
      responseType: string;
      scope: string[];
   };
}

/**
 * Awsconfig
 * 
 * This file contains the configuration for the AWS Amplify library.
 * 
 */
const Awsconfig = {

   'aws_project_region': 'ap-south-1',
   'aws_cognito_region': 'ap-south-1',
   'aws_user_pools_id': import.meta.env.APP_COGNITO_USER_POOL_ID,
   'aws_user_pools_web_client_id': import.meta.env.APP_COGNITO_CLIENT_ID,
   "oauth": {
      "domain":  import.meta.env.APP_COGNITO_DOMAIN,
      "redirectSignIn": import.meta.env.APP_LINKEDIN_REDIRECTION,
      "redirectSignOut":import.meta.env.LINKEDIN_LOGOUT,
      "responseType": 'code',
      "scope": [
         "email",
         "openid",
         "profile",
         "phone"
      ]
   },
};
export default Awsconfig;