const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerDefinition = require('../../docs/swaggerDef');
const path = require('path');

const router = express.Router();

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../routes/*.js')],
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

const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI
router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'eMandate API Documentation',
    customfavIcon: '/favicon.ico',
    explorer: true,
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
  })
);

// Route to get swagger.json
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router; 