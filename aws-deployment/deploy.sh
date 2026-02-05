#!/bin/bash

# FitFlow AWS Deployment Script
# This script automates the deployment of FitFlow to AWS

set -e

echo "🚀 FitFlow AWS Deployment Script"
echo "=================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK is not installed. Installing now..."
    npm install -g aws-cdk
fi

# Check AWS credentials
echo "🔐 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ AWS Account: $ACCOUNT_ID"
echo ""

# Check Bedrock access
echo "🤖 Checking AWS Bedrock access..."
if aws bedrock list-foundation-models --region us-east-1 &> /dev/null; then
    echo "✅ Bedrock access confirmed"
else
    echo "⚠️  Warning: Bedrock access not confirmed. You may need to enable it in the AWS Console."
    echo "   Go to: AWS Console → Bedrock → Model access → Enable Claude 3.5 Sonnet"
fi
echo ""

# Install Lambda dependencies
echo "📦 Installing Lambda function dependencies..."
cd ../lambda/workout-generator && npm install && cd ../../aws-deployment
cd ../lambda/user-data && npm install && cd ../../aws-deployment
echo "✅ Lambda dependencies installed"
echo ""

# Install CDK dependencies
echo "📦 Installing CDK dependencies..."
npm install
echo "✅ CDK dependencies installed"
echo ""

# Bootstrap CDK (if needed)
echo "🏗️  Bootstrapping CDK..."
cdk bootstrap aws://$ACCOUNT_ID/us-east-1
echo "✅ CDK bootstrapped"
echo ""

# Deploy infrastructure
echo "🚀 Deploying infrastructure..."
cdk deploy --all --require-approval never

# Get outputs
echo ""
echo "📋 Deployment Complete! Here are your configuration values:"
echo "============================================================"
aws cloudformation describe-stacks \
    --stack-name FitFlowProductionStack \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "✅ Infrastructure deployed successfully!"
echo ""
echo "📝 Next Steps:"
echo "1. Copy the output values above"
echo "2. Update src/aws-config.js with these values"
echo "3. Run 'npm run build' to build the frontend"
echo "4. Deploy frontend with Amplify or S3"
echo ""
echo "🎉 Deployment complete!"