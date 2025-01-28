const fs = require('fs');
const path = require('path');

// Define models (replace or dynamically load from an Excel/JSON file)
const models = [
    {
      name: 'Merchant',
      fields: [
        { name: 'id', type: 'Int', isId: true, isUnique: true, isAutoIncrement: true },
        { name: 'merchantId', type: 'String', isUnique: true },
        { name: 'name', type: 'String' },
        { name: 'token', type: 'String' },
        { name: 'merchantCode', type: 'String' },
        { name: 'address', type: 'String' },
        { name: 'status', type: 'String' },
        { name: 'createdAt', type: 'DateTime' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
    {
      name: 'MerchantSlab',
      fields: [
        { name: 'id', type: 'Int', isId: true, isUnique: true, isAutoIncrement: true },
        { name: 'merchantId', type: 'String' },
        { name: 'slabFrom', type: 'Decimal' },
        { name: 'slabTo', type: 'Decimal' },
        { name: 'baseAmount', type: 'Decimal' },
        { name: 'emiAmount', type: 'Decimal' },
        { name: 'emiTenure', type: 'Int' },
        { name: 'processingFee', type: 'Decimal' },
        { name: 'effectiveDate', type: 'Date' },
        { name: 'expiryDate', type: 'Date' },
        { name: 'remarks', type: 'String' },
        { name: 'status', type: 'String' },
        { name: 'createdAt', type: 'DateTime' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
    {
      name: 'User',
      fields: [
        { name: 'id', type: 'Int', isId: true, isUnique: true, isAutoIncrement: true },
        { name: 'userId', type: 'String', isUnique: true },
        { name: 'name', type: 'String' },
        { name: 'mobile', type: 'String' },
        { name: 'email', type: 'String' },
        { name: 'pan', type: 'String' },
        { name: 'telephone', type: 'String' },
        { name: 'createdAt', type: 'DateTime' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
    {
      name: 'Transaction',
      fields: [
        { name: 'id', type: 'Int', isId: true, isUnique: true, isAutoIncrement: true },
        { name: 'transactionId', type: 'String', isUnique: true },
        { name: 'userId', type: 'String' },
        { name: 'merchantId', type: 'String' },
        { name: 'txnId', type: 'String' },
        { name: 'monthlyEmi', type: 'Decimal' },
        { name: 'startDate', type: 'Date' },
        { name: 'endDate', type: 'Date' },
        { name: 'purpose', type: 'String' },
        { name: 'maxAmount', type: 'Decimal' },
        { name: 'createdAt', type: 'DateTime' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
    {
      name: 'UserMandate',
      fields: [
        { name: 'id', type: 'Int', isId: true, isUnique: true, isAutoIncrement: true },
        { name: 'transactionId', type: 'String' },
        { name: 'userId', type: 'String' },
        { name: 'amount', type: 'Decimal' },
        { name: 'dueDate', type: 'Date' },
        { name: 'paidDate', type: 'Date' },
        { name: 'createdAt', type: 'DateTime' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
  ];
  

const projectRoot = path.join(__dirname, 'project');

const folderStructure = [
  'controllers',
  'services',
  'routes',
  'prisma',
  'middlewares',
  'helpers',
  'validators',
  'logs',
];

const createFolders = () => {
  folderStructure.forEach((folder) => {
    const folderPath = path.join(projectRoot, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Created folder: ${folderPath}`);
    }
  });
};

const generatePrismaSchema = () => {
  const prismaPath = path.join(projectRoot, 'prisma', 'schema.prisma');
  const datasource = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
`;

  let modelsSchema = '';

  models.forEach((model) => {
    const fields = model.fields
      .map((field) => {
        const id = field.isId ? '@id' : '';
        const unique = field.isUnique ? '@unique' : '';
        const autoIncrement = field.isAutoIncrement ? '@default(autoincrement())' : '';
        return `${field.name} ${field.type} ${id} ${unique} ${autoIncrement}`;
      })
      .join('\n  ');

    modelsSchema += `model ${model.name} {\n  ${fields}\n}\n\n`;
  });

  const schema = datasource + modelsSchema;

  fs.writeFileSync(prismaPath, schema);
  console.log(`Generated Prisma schema at: ${prismaPath}`);
};

const generateLogger = () => {
  const loggerPath = path.join(projectRoot, 'helpers', 'logger.js');
  const loggerTemplate = `
const { createLogger, format, transports } = require('winston');
const { trace } = require('@opentelemetry/api');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json(),
    format.printf(({ level, message, timestamp }) => {
      const activeSpan = trace.getActiveSpan();
      const spanContext = activeSpan ? activeSpan.spanContext() : null;
      const traceId = spanContext ? spanContext.traceId : 'no-trace';
      return JSON.stringify({ timestamp, level, message, traceId });
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: '../logs/app.log' }),
  ],
});

module.exports = logger;
`;

  fs.writeFileSync(loggerPath, loggerTemplate.trim());
  console.log('Created logger at: helpers/logger.js');
};

const generateController = (model) => {
  const controllerTemplate = `
const ${model.name.toLowerCase()}Service = require('../services/${model.name.toLowerCase()}Service');
const logger = require('../helpers/logger');

const create${model.name} = async (req, res) => {
  try {
    const ${model.name.toLowerCase()} = await ${model.name.toLowerCase()}Service.create${model.name}(req.body);
    logger.info('${model.name} created successfully', { id: ${model.name.toLowerCase()}.id });
    res.status(201).json(${model.name.toLowerCase()});
  } catch (error) {
    logger.error('Error creating ${model.name}', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const get${model.name} = async (req, res) => {
  try {
    const ${model.name.toLowerCase()} = await ${model.name.toLowerCase()}Service.get${model.name}(req.params.id);
    if (!${model.name.toLowerCase()}) {
      logger.warn('${model.name} not found', { id: req.params.id });
      return res.status(404).json({ message: '${model.name} not found' });
    }
    logger.info('${model.name} retrieved successfully', { id: req.params.id });
    res.json(${model.name.toLowerCase()});
  } catch (error) {
    logger.error('Error retrieving ${model.name}', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const update${model.name} = async (req, res) => {
  try {
    const ${model.name.toLowerCase()} = await ${model.name.toLowerCase()}Service.update${model.name}(req.params.id, req.body);
    logger.info('${model.name} updated successfully', { id: req.params.id });
    res.json(${model.name.toLowerCase()});
  } catch (error) {
    logger.error('Error updating ${model.name}', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

const delete${model.name} = async (req, res) => {
  try {
    await ${model.name.toLowerCase()}Service.delete${model.name}(req.params.id);
    logger.info('${model.name} deleted successfully', { id: req.params.id });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting ${model.name}', { error: error.message });
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create${model.name},
  get${model.name},
  update${model.name},
  delete${model.name},
};
`;

  const filePath = path.join(projectRoot, 'controllers', `${model.name.toLowerCase()}Controller.js`);
  fs.writeFileSync(filePath, controllerTemplate.trim());
  console.log(`Created controller for: ${model.name}`);
};

const generateService = (model) => {
  const serviceTemplate = `
const prisma = require('../prisma/client');

const create${model.name} = async (data) => {
  return await prisma.${model.name.toLowerCase()}.create({ data });
};

const get${model.name} = async (id) => {
  return await prisma.${model.name.toLowerCase()}.findUnique({ where: { id: parseInt(id) } });
};

const update${model.name} = async (id, data) => {
  return await prisma.${model.name.toLowerCase()}.update({ where: { id: parseInt(id) }, data });
};

const delete${model.name} = async (id) => {
  return await prisma.${model.name.toLowerCase()}.delete({ where: { id: parseInt(id) } });
};

module.exports = {
  create${model.name},
  get${model.name},
  update${model.name},
  delete${model.name},
};
`;

  const filePath = path.join(projectRoot, 'services', `${model.name.toLowerCase()}Service.js`);
  fs.writeFileSync(filePath, serviceTemplate.trim());
  console.log(`Created service for: ${model.name}`);
};

const generateRoutes = (model) => {
  const routesTemplate = `
const express = require('express');
const ${model.name.toLowerCase()}Controller = require('../controllers/${model.name.toLowerCase()}Controller');
const router = express.Router();

router.post('/', ${model.name.toLowerCase()}Controller.create${model.name});
router.get('/:id', ${model.name.toLowerCase()}Controller.get${model.name});
router.put('/:id', ${model.name.toLowerCase()}Controller.update${model.name});
router.delete('/:id', ${model.name.toLowerCase()}Controller.delete${model.name});

module.exports = router;
`;

  const filePath = path.join(projectRoot, 'routes', `${model.name.toLowerCase()}Routes.js`);
  fs.writeFileSync(filePath, routesTemplate.trim());
  console.log(`Created routes for: ${model.name}`);
};

const createProject = () => {
  if (!fs.existsSync(projectRoot)) {
    fs.mkdirSync(projectRoot, { recursive: true });
    console.log(`Created project root: ${projectRoot}`);
  }

  createFolders();
  generateLogger();

  models.forEach((model) => {
    generateController(model);
    generateService(model);
    generateRoutes(model);
  });

  generatePrismaSchema();

  console.log('Project generation complete!');
};

createProject();

