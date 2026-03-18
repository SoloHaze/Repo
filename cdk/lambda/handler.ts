import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';


const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  const tableName = process.env.TABLE_NAME!;

  const result = await client.send(new ScanCommand({ TableName: tableName }));

  // Aquí es donde agregamos el ": any" para resolver el error TS7006
  const items = result.Items 
    ? result.Items.map((item: any) => unmarshall(item)) 
    : [];

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: 'Hola Mundo! 🚀',
      items,
    }),
  };
};