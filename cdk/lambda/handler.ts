import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  const items: any[] = []; // Simulado o real dependiendo de si activas Dynamo

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: 'Hola Mundo! 🚀',
      items,
    }),
  };
};