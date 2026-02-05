# FitFlow AWS Production Deployment Guide

## 🎯 Architecture Overview

**Frontend:** AWS Amplify (React PWA)  
**Backend:** AWS Lambda + API Gateway (Serverless)  
**AI:** AWS Bedrock (Claude Sonnet 4.5)  
**Database:** DynamoDB (User data, workouts, templates)  
**Auth:** AWS Cognito (User authentication)  
**Region:** us-east-1 (Virginia)

## 💰 Estimated Costs

**Monthly (1000 active users, 10k workouts/month):**
- Amplify Hosting: ~$20
- Lambda + API Gateway: ~$15
- AWS Bedrock (Claude Sonnet 4.5): ~$30
- DynamoDB: ~$10
- Cognito: Free (up to 50k users)
- **Total: ~$75/month**

**Per Workout Generation:**
- Claude Sonnet 4.5: ~$0.003 per workout
- Very cost-effective for quality AI responses

## 📋 Prerequisites

1. AWS Account with admin access
2. AWS CLI installed and configured
3. Node.js 18+ installed
4. Git installed

## 🚀 Deployment Steps

### Step 1: Configure AWS Credentials

```bash
# Option A: Configure AWS CLI
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Region: us-east-1
# Output format: json

# Option B: Set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1
```

### Step 2: Enable AWS Bedrock Access

1. Go to AWS Console → Bedrock
2. Navigate to "Model access"
3. Click "Manage model access"
4. Enable "Claude 3.5 Sonnet"
5. Submit request (usually instant approval)

### Step 3: Install Dependencies

```bash
# Install AWS CDK (Infrastructure as Code)
npm install -g aws-cdk

# Install Amplify CLI
npm install -g @aws-amplify/cli

# Install project dependencies
npm install
cd server && npm install && cd ..
```

### Step 4: Deploy Infrastructure

```bash
# Navigate to deployment folder
cd aws-deployment

# Install CDK dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap aws://ACCOUNT-ID/us-east-1

# Deploy all infrastructure
cdk deploy --all

# This creates:
# - DynamoDB tables
# - Lambda functions
# - API Gateway
# - Cognito user pool
# - IAM roles
```

### Step 5: Deploy Frontend

```bash
# Build production frontend
npm run build

# Initialize Amplify
amplify init

# Deploy to Amplify
amplify publish

# Your app will be live at:
# https://main.d1234567890.amplifyapp.com
```

### Step 6: Configure Environment Variables

The deployment will output important values. Save these:

```
CognitoUserPoolId: us-east-1_XXXXXXXXX
CognitoClientId: 1234567890abcdefghij
ApiEndpoint: https://api123456.execute-api.us-east-1.amazonaws.com
DynamoDBTableName: FitFlow-Production
```

### Step 7: Update Frontend Configuration

Edit `src/aws-config.js` with the output values from Step 6.

### Step 8: Redeploy Frontend

```bash
npm run build
amplify publish
```

## ✅ Verification

### Test Authentication
1. Go to your Amplify URL
2. Click "Create Account"
3. Enter email and password
4. Verify email (check inbox)
5. Sign in

### Test Workout Generation
1. Go to Chat tab
2. Type: "Create a chest and back workout"
3. Should generate workout using Claude Sonnet 4.5
4. Check browser console for logs

### Test Multi-Device Sync
1. Save a workout template
2. Sign out and sign in on different device
3. Template should appear on new device

## 🔧 Configuration Files

- `cdk/lib/fitflow-stack.ts` - Infrastructure definition
- `src/aws-config.js` - Frontend AWS configuration
- `lambda/workout-generator.js` - Bedrock integration
- `lambda/user-data.js` - DynamoDB operations

## 📊 Monitoring

### CloudWatch Dashboards
- Lambda function metrics
- API Gateway requests
- Bedrock API calls
- DynamoDB operations

### Cost Monitoring
```bash
# View current month costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

## 🔒 Security

- ✅ HTTPS enforced (SSL certificate auto-generated)
- ✅ User authentication required
- ✅ API Gateway with Cognito authorizer
- ✅ DynamoDB encryption at rest
- ✅ IAM least-privilege policies
- ✅ CORS properly configured

## 🐛 Troubleshooting

### Issue: Bedrock Access Denied
**Solution:** Enable Claude 3.5 Sonnet in Bedrock console

### Issue: Cognito User Not Confirmed
**Solution:** Check email for verification link

### Issue: API Gateway 403 Error
**Solution:** Ensure Cognito token is included in requests

### Issue: DynamoDB Access Denied
**Solution:** Check Lambda IAM role has DynamoDB permissions

## 📝 Post-Deployment Tasks

1. ✅ Set up custom domain (optional)
2. ✅ Configure email templates (Cognito)
3. ✅ Set up CloudWatch alarms
4. ✅ Enable AWS WAF (firewall)
5. ✅ Set up backup policies
6. ✅ Configure auto-scaling

## 🔄 CI/CD Pipeline

The deployment includes automatic CI/CD:
- Push to `main` branch → Auto-deploy to production
- Push to `dev` branch → Auto-deploy to staging
- Pull requests → Preview deployments

## 📱 iPhone PWA Testing

1. Deploy to production
2. Open URL in Safari on iPhone
3. Tap Share → Add to Home Screen
4. App installs as native-like PWA
5. Test offline functionality

## 🎯 Next Steps

1. Wait for AWS credentials
2. Run deployment scripts
3. Test all functionality
4. Configure custom domain (optional)
5. Set up monitoring alerts
6. Train client on admin features

---

**Support:** If you encounter issues, check CloudWatch logs or contact AWS support.