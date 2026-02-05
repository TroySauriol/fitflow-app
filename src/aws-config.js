// AWS Configuration for FitFlow
// Update these values after deploying the CDK stack

export const awsConfig = {
  // AWS Region
  region: 'us-east-1',
  
  // Cognito User Pool Configuration
  // Get these from CDK output after deployment
  userPoolId: 'us-east-1_XXXXXXXXX', // Replace with actual User Pool ID
  userPoolClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Replace with actual Client ID
  
  // API Gateway Endpoint
  // Get this from CDK output after deployment
  apiEndpoint: 'https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prod', // Replace with actual API endpoint
  
  // Bedrock Configuration
  bedrockModelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  
  // DynamoDB Table Names
  tables: {
    userProfiles: 'FitFlow-UserProfiles',
    workoutTemplates: 'FitFlow-WorkoutTemplates',
    calendarWorkouts: 'FitFlow-CalendarWorkouts',
    personalRecords: 'FitFlow-PersonalRecords'
  }
};

// Amplify Configuration
export const amplifyConfig = {
  Auth: {
    region: awsConfig.region,
    userPoolId: awsConfig.userPoolId,
    userPoolWebClientId: awsConfig.userPoolClientId,
    mandatorySignIn: false,
    authenticationFlowType: 'USER_SRP_AUTH'
  },
  API: {
    endpoints: [
      {
        name: 'FitFlowAPI',
        endpoint: awsConfig.apiEndpoint,
        region: awsConfig.region
      }
    ]
  }
};