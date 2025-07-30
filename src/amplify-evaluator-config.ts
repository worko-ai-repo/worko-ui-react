/**
 * Amplify Configuration for Evaluator Authentication
 * 
 * This configuration is specifically for evaluator passwordless login
 * using AWS Cognito with custom auth flow (OTP-based authentication)
 * 
 * Uses Amplify v6 configuration format
 */

const evaluatorAmplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.APP_COGNITO_USER_POOL_ID || "ap-south-1_xGreJKkNc",
      userPoolClientId: import.meta.env.EVALUATOR_USER_POOL_CLIENT_ID || "4g99pq8fgr9bm7ucgkao1h9jmb",
    }
  }
};

export default evaluatorAmplifyConfig;