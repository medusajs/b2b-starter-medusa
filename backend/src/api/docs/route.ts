/**
 * 📚 API Documentation Endpoint
 * Serves OpenAPI/Swagger UI (enabled via ENABLE_API_DOCS env var)
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { generateSwaggerSpec } from "../../utils/swagger-config";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  if (process.env.ENABLE_API_DOCS !== "true") {
    res.status(404).json({
      success: false,
      error: { code: "E404_NOT_FOUND", message: "API documentation is not enabled" },
    });
    return;
  }

  try {
    const swaggerSpec = generateSwaggerSpec();

    if (req.query?.format === "json") {
      res.status(200).json(swaggerSpec);
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>YSH Solar Hub API</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>.topbar{display:none!important}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload=()=>{SwaggerUIBundle({spec:${JSON.stringify(swaggerSpec)},dom_id:'#swagger-ui',deepLinking:true,presets:[SwaggerUIBundle.presets.apis,SwaggerUIStandalonePreset],layout:"StandaloneLayout"})};
  </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    res.status(200).send(html);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "E500_INTERNAL", message: "Failed to generate docs", details: error.message },
    });
  }
}
