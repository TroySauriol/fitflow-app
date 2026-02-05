import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class FitFlowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // DynamoDB Tables
    // ========================================

    // User Profiles Table
    const userProfilesTable = new dynamodb.Table(this, 'UserProfiles', {
      tableName: 'FitFlow-UserProfiles',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Workout Templates Table
    const workoutTemplatesTable = new dynamodb.Table(this, 'WorkoutTemplates', {
      tableName: 'FitFlow-WorkoutTemplates',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'templateId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Calendar Workouts Table
    const calendarWorkoutsTable = new dynamodb.Table(this, 'CalendarWorkouts', {
      tableName: 'FitFlow-CalendarWorkouts',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'workoutId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for date-based queries
    calendarWorkoutsTable.addGlobalSecondaryIndex({
      indexName: 'DateIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'workoutDate', type: dynamodb.AttributeType.STRING },
    });

    // Personal Records Table
    const personalRecordsTable = new dynamodb.Table(this, 'PersonalRecords', {
      tableName: 'FitFlow-PersonalRecords',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'recordId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ========================================
    // Cognito User Pool
    // ========================================

    const userPool = new cognito.UserPool(this, 'FitFlowUserPool', {
      userPoolName: 'FitFlow-Users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: false,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = userPool.addClient('FitFlowWebClient', {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE],
      },
    });

    // ========================================
    // Lambda Functions
    // ========================================

    // Bedrock IAM Policy
    const bedrockPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: [
        `arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`,
      ],
    });

    // Workout Generator Lambda (with Bedrock)
    const workoutGeneratorLambda = new lambda.Function(this, 'WorkoutGenerator', {
      functionName: 'FitFlow-WorkoutGenerator',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/workout-generator'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        BEDROCK_MODEL_ID: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        REGION: 'us-east-1',
      },
    });

    workoutGeneratorLambda.addToRolePolicy(bedrockPolicy);

    // User Data Lambda (DynamoDB operations)
    const userDataLambda = new lambda.Function(this, 'UserData', {
      functionName: 'FitFlow-UserData',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../lambda/user-data'),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      environment: {
        USER_PROFILES_TABLE: userProfilesTable.tableName,
        WORKOUT_TEMPLATES_TABLE: workoutTemplatesTable.tableName,
        CALENDAR_WORKOUTS_TABLE: calendarWorkoutsTable.tableName,
        PERSONAL_RECORDS_TABLE: personalRecordsTable.tableName,
      },
    });

    // Grant DynamoDB permissions
    userProfilesTable.grantReadWriteData(userDataLambda);
    workoutTemplatesTable.grantReadWriteData(userDataLambda);
    calendarWorkoutsTable.grantReadWriteData(userDataLambda);
    personalRecordsTable.grantReadWriteData(userDataLambda);

    // ========================================
    // API Gateway
    // ========================================

    const api = new apigateway.RestApi(this, 'FitFlowApi', {
      restApiName: 'FitFlow API',
      description: 'FitFlow Workout Generator API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // API Routes
    const workoutResource = api.root.addResource('workout');
    workoutResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(workoutGeneratorLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    const userDataResource = api.root.addResource('user-data');
    userDataResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(userDataLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    userDataResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(userDataLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    userDataResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(userDataLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );
    userDataResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(userDataLambda),
      {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // ========================================
    // Outputs
    // ========================================

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: 'FitFlow-UserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: 'FitFlow-UserPoolClientId',
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Gateway Endpoint',
      exportName: 'FitFlow-ApiEndpoint',
    });

    new cdk.CfnOutput(this, 'Region', {
      value: this.region,
      description: 'AWS Region',
      exportName: 'FitFlow-Region',
    });
  }
}