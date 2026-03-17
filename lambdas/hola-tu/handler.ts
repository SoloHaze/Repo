import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  const tableName = process.env.TABLE_NAME!;

  const result = await client.send(new ScanCommand({ TableName: tableName }));
  const items = result.Items ? result.Items.map(item => unmarshall(item)) : [];

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hola Mundo! 🚀',
      items,
    }),
  };
};