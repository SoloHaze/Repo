import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --- 1. ALMACENAMIENTO: BUCKET DE S3 PARA IMÁGENES ---
    const bucketImagenes = new s3.Bucket(this, 'BucketImagenes', {
      // Configuración para que las imágenes sean accesibles desde el navegador
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      // Al borrar el proyecto, se borran las imágenes y el bucket automáticamente
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // --- 2. BASE DE DATOS: DYNAMODB (Opcional - Comentada por ahora) ---
    /*
    const tabla = new dynamodb.Table(this, 'MiTabla', {
      tableName: 'mi-tabla-datos',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    */

    // --- 3. LÓGICA: FUNCIÓN LAMBDA ---
    const holaFn = new lambda.Function(this, 'HolaMundoFunction', {
      runtime: lambda.Runtime.NODEJS_20_X, // Versión recomendada
      handler: 'handler.handler',
      // Ruta a los archivos compilados en dist/
      code: lambda.Code.fromAsset(path.join(__dirname, '../cdk/lambda/dist/cdk/lambda')),
      environment: {
        // TABLE_NAME: tabla.tableName, // Activar cuando actives la tabla
        BUCKET_URL: bucketImagenes.bucketDomainName,
      },
    });

    // Si activas la tabla, dale permiso a la Lambda para leerla
    // tabla.grantReadData(holaFn);

    // --- 4. INTERFAZ: API GATEWAY ---
    const api = new apigateway.RestApi(this, 'HolaMundoApi', {
      restApiName: 'hola-tu-api',
      description: 'API para Proyecto Delia con Swagger e Index',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Ruta raíz (/) -> Muestra Swagger UI
    api.root.addMethod('GET', new apigateway.LambdaIntegration(holaFn));

    // Ruta /hola -> Retorna JSON con datos
    const holaResource = api.root.addResource('hola');
    holaResource.addMethod('GET', new apigateway.LambdaIntegration(holaFn));

    // Ruta /index -> Muestra tu página personalizada index.html
    const indexResource = api.root.addResource('index');
    indexResource.addMethod('GET', new apigateway.LambdaIntegration(holaFn));

    // --- 5. SALIDAS (OUTPUTS) ---
    // Esto aparecerá en los logs de GitHub Actions al terminar
    new cdk.CfnOutput(this, 'UrlBaseDeImagenes', {
      value: `https://${bucketImagenes.bucketDomainName}/`,
      description: 'Usa esta URL base para tus fotos en el HTML',
    });
  }
}