const { version } = require('../../package.json');
const config = require('../config/config');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const components = yaml.load(fs.readFileSync(path.join(__dirname, 'components.yml'), 'utf8'));

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'SabPaisa eNACH Config Dashboard',
    version,
    license: {
      name: '',
      url: '',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}`,
    },
  ],
  components,
  security: [
    {
      bearerAuth: [],
    },
  ],
};

module.exports = swaggerDef; 