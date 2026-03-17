import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tabla DynamoDB
    const tabla = new dynamodb.Table(this, 'MiTabla', {
      tableName: 'mi-tabla',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda
    const holaFn = new lambda.Function(this, 'HolaMundoFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../lambdas/hola-tu/dist')
      ),
      environment: {
        TABLE_NAME: tabla.tableName,
      },
    });

    // Permisos
    tabla.grantReadData(holaFn);

    // API Gateway
    const api = new apigateway.RestApi(this, 'HolaMundoApi', {
      restApiName: 'hola-tu-api',
      description: 'API para Hola Mundo',
    });

    const holaResource = api.root.addResource('hola');
    holaResource.addMethod('GET', new apigateway.LambdaIntegration(holaFn));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: `${api.url}hola`,
      description: 'URL del endpoint',
    });

    new cdk.CfnOutput(this, 'LambdaArn', {
      value: holaFn.functionArn,
    });
  }
}