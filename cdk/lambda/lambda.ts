import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();

new LambdaStack(app, 'MiProyectoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
});