#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FitFlowStack } from '../lib/fitflow-stack';

const app = new cdk.App();

new FitFlowStack(app, 'FitFlowProductionStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1'
  },
  description: 'FitFlow Production Infrastructure - AI Workout Generator',
  tags: {
    Application: 'FitFlow',
    Environment: 'Production',
    ManagedBy: 'CDK'
  }
});