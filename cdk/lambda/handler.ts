import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import * as fs from 'fs';
import * as path from 'path';

// Inicializamos el cliente fuera del handler para reutilizar conexiones
const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  const path = event.path;
  const tableName = process.env.TABLE_NAME;

  // 1. RUTA RAÍZ: Servimos Swagger UI para que sea interactivo
  if (path === "/" || path === "/prod" || path === "/prod/") {
    const swaggerHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Swagger UI - Mi API interactiva</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              spec: {
                openapi: "3.0.0",
                info: { title: "Hola Tu API", version: "1.0.0", description: "Documentación interactiva de mi Lambda" },
                paths: {
                  "/prod/hola": {
                    get: {
                      summary: "Retorna el mensaje de bienvenida e items de DynamoDB",
                      responses: {
                        "200": { 
                          description: "Éxito", 
                          content: { "application/json": { schema: { type: "object" } } } 
                        }
                      }
                    }
                  }
                }
              },
              dom_id: '#swagger-ui',
            });
          };
        </script>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: swaggerHtml,
    };
  }

  // 2. RUTA /HOLA: Lógica de negocio (Mensaje + DynamoDB)
  if (path.includes("/hola")) {
    let items: any[] = [];

    // Solo intentamos leer de DynamoDB si la variable de entorno existe
    if (tableName) {
      try {
        const results = await client.send(new ScanCommand({ TableName: tableName }));
        items = results.Items ? results.Items.map((item) => unmarshall(item)) : [];
      } catch (error) {
        console.error("Error leyendo DynamoDB:", error);
        // No bloqueamos la respuesta, enviamos items vacíos si falla la DB
      }
    }

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Importante para que Swagger pueda llamar a esta ruta
      },
      body: JSON.stringify({
        message: 'Hola Mundo! 🚀',
        path_utilizado: path,
        items: items,
        timestamp: new Date().toISOString(),
      }),
    };
  }
  // 2.5 Ruta INDEX
  if (path.includes("/index")) {
      try {
        // Leemos el archivo index.html que está en la misma carpeta que el JS generado
        const htmlPath = path.join(__dirname, 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        return {
          statusCode: 200,
          headers: { "Content-Type": "text/html" },
          body: htmlContent,
        };
      } catch (error) {
        console.error("Error leyendo el HTML:", error);
        return {
          statusCode: 500,
          body: "Error interno: No se pudo cargar el archivo HTML.",
        };
      }
    }

  // 3. RUTA NO ENCONTRADA
  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Ruta no encontrada" }),
  };
};