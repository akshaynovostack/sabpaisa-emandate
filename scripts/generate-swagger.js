const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const swaggerDefinition = require('../src/docs/swaggerDef');

// Options for the swagger-jsdoc
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    './src/v1/routes/*.js',
    './src/v1/controllers/*.js',
    './src/v1/validations/*.js'
  ],
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showCommonExtensions: true,
    showExtensions: true,
    showRequestHeaders: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
  },
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);

// Generate swagger.json
const outputPath = path.join(__dirname, '../src/docs/swagger.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log('Swagger documentation generated successfully!');
console.log(`Output file: ${outputPath}`); 