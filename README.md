# eMandate System

A robust Node.js-based eMandate system for managing recurring payments and mandates, built with Express.js, MySQL, and Prisma ORM.

## 🚀 Features

- 🔐 Secure authentication and authorization
- 👥 Team and role-based access control
- 📝 Electronic mandate management
- 📊 Comprehensive API documentation with Swagger/OpenAPI 3.0
- 🔄 Database migrations and seeding
- 🛡️ Security best practices
- 📈 Rate limiting and request validation
- 🧪 Testing setup with Jest
- 🔍 Advanced search and filtering
- 📱 Mobile-friendly API responses
- 📊 Dashboard analytics
- 🔄 Transaction status tracking
- 💳 Payment mandate processing
- 📋 Merchant slab management
- 👤 User profile management
- 🔐 Permission-based access control
- 📝 Audit logging
- 🔄 Webhook support
- 📊 Transaction reporting
- 🔍 Advanced querying capabilities

## 📋 Version History

### Current Version: 0.2.0 (2024-03-20)
- Added comprehensive Swagger documentation for all API endpoints
- Implemented OpenAPI 3.0 specification compliance
- Enhanced API documentation with detailed schemas and examples
- Added authentication and permission requirements documentation
- Improved endpoint descriptions and response formats
- Added merchant slab management system
- Implemented advanced filtering and search capabilities
- Added dashboard analytics endpoints
- Enhanced transaction management system
- Added webhook support for real-time updates
- Implemented audit logging system
- Added comprehensive error handling
- Enhanced security with permission-based access control
- Added transaction reporting capabilities
- Implemented advanced querying with Prisma

### Version 0.1.0 (2024-03-10)
- Initial project setup
- Basic Express.js server configuration
- Environment configuration
- Basic project structure
- Database schema design
- Basic CRUD operations
- Authentication system
- Role-based access control
- Basic API endpoints
- Error handling middleware
- Logging system
- Database migrations
- Basic validation

## 🛠️ Tech Stack

- **Runtime:** Node.js v22
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Documentation:** Swagger/OpenAPI
- **Validation:** Joi
- **Testing:** Jest
- **Code Quality:** ESLint, Prettier

## 📁 Project Structure

```
emandate/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── config.js          # Environment configuration
│   │   └── swagger/           # Swagger documentation
│   │       ├── components.yml # API components
│   │       └── swagger.yml    # API specification
│   │
│   ├── db/                    # Database related files
│   │   ├── migrations/        # Database migrations
│   │   ├── seeders/          # Database seeders
│   │   ├── models/           # Database models
│   │   └── schema.prisma     # Prisma schema
│   │
│   ├── middlewares/          # Custom middlewares
│   │   ├── auth.js          # Authentication middleware
│   │   ├── error.js         # Error handling middleware
│   │   ├── rateLimiter.js   # Rate limiting middleware
│   │   ├── validate.js      # Request validation middleware
│   │   ├── audit.js         # Audit logging middleware
│   │   └── webhook.js       # Webhook handling middleware
│   │
│   ├── utils/               # Utility functions
│   │   ├── catchAsync.js    # Async error handler
│   │   ├── logger.js        # Logging utility
│   │   ├── validator.js     # Validation utilities
│   │   ├── formatter.js     # Response formatter
│   │   ├── webhook.js       # Webhook utilities
│   │   └── analytics.js     # Analytics utilities
│   │
│   ├── v1/                  # API version 1
│   │   ├── controllers/     # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── transaction.controller.js
│   │   │   ├── merchant.controller.js
│   │   │   ├── permission.controller.js
│   │   │   ├── role.controller.js
│   │   │   └── dashboard.controller.js
│   │   │
│   │   ├── middlewares/     # Version-specific middlewares
│   │   │   ├── permission.js
│   │   │   └── validation.js
│   │   │
│   │   ├── routes/          # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── user.route.js
│   │   │   ├── transaction.route.js
│   │   │   ├── merchant.route.js
│   │   │   ├── permission.route.js
│   │   │   ├── role.route.js
│   │   │   └── dashboard.route.js
│   │   │
│   │   ├── services/        # Business logic
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── transaction.service.js
│   │   │   ├── merchant.service.js
│   │   │   ├── permission.service.js
│   │   │   ├── role.service.js
│   │   │   └── dashboard.service.js
│   │   │
│   │   └── validations/     # Request validations
│   │       ├── auth.validation.js
│   │       ├── user.validation.js
│   │       ├── transaction.validation.js
│   │       ├── merchant.validation.js
│   │       ├── permission.validation.js
│   │       └── role.validation.js
│   │
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
│
├── tests/                  # Test files
│   ├── integration/        # Integration tests
│   │   ├── auth.test.js
│   │   ├── user.test.js
│   │   ├── transaction.test.js
│   │   ├── merchant.test.js
│   │   ├── permission.test.js
│   │   └── role.test.js
│   │
│   └── unit/              # Unit tests
│       ├── services/
│       ├── utils/
│       └── middlewares/
│
├── scripts/               # Utility scripts
│   ├── seed.js           # Database seeding
│   ├── migrate.js        # Migration runner
│   └── test-setup.js     # Test environment setup
│
├── .env.example          # Environment variables template
├── .eslintrc.json       # ESLint configuration
├── .gitignore           # Git ignore rules
├── .prettierignore      # Prettier ignore rules
├── .prettierrc.json     # Prettier configuration
├── package.json         # Project dependencies
└── README.md           # Project documentation
```

## 💾 Database Schema

The system uses MySQL with Prisma ORM. Key models include:

### User (Customer)
- Represents end users/customers
- Stores basic user information (name, mobile, email, etc.)
- Has relations to transactions and mandates
- Fields:
  - `id`: Auto-incrementing integer (primary key)
  - `user_id`: Unique string identifier
  - `name`, `mobile`, `email`, `pan`, `telephone`: User details
  - Relations: transactions, user_mandates, team_members

### Team (System User)
- Represents system users/team members
- Has login credentials (email, password)
- Associated with a role
- Can have multiple team members (customers)
- Fields:
  - `id`: UUID (primary key)
  - `name`, `email`: Unique identifiers
  - `mobile`: Optional contact number
  - `password`: Hashed password
  - `description`: Optional team description
  - `role_id`: Foreign key to role
  - Relations: members (team_members), role

### Team Member
- Links users to teams with specific roles
- Manages team membership
- Fields:
  - `id`: UUID (primary key)
  - `team_id`: Foreign key to team
  - `user_id`: Foreign key to user
  - `role_id`: Foreign key to role
  - `joined_at`: Membership start date
  - Relations: team, user, role

### Role & Permissions
- Role-based access control system
- Roles can have multiple permissions
- Teams and team members are assigned roles
- Models:
  1. **Role**
     - `id`: Auto-incrementing integer (primary key)
     - `name`: Unique role name
     - `description`: Optional role description
     - Relations: teams, team_members, permissions
  2. **Permission**
     - `id`: UUID (primary key)
     - `name`: Unique permission name
     - `description`: Optional permission description
     - Relations: roles (through role_permissions)
  3. **Role Permission**
     - Junction table for role-permission relationships
     - `id`: UUID (primary key)
     - `role_id`: Foreign key to role
     - `permission_id`: Foreign key to permission

### Merchant & Slabs
- Manages merchant information and payment slabs
- Models:
  1. **Merchant**
     - `id`: Auto-incrementing integer (primary key)
     - `merchant_id`: Unique merchant identifier
     - `name`: Merchant name
     - `token`: Authentication token
     - `merchant_code`: Unique merchant code
     - `address`: Merchant address
     - `status`: Active/Inactive status
     - Relations: merchant_slabs, transactions
  2. **Merchant Slab**
     - Defines payment slabs for merchants
     - `id`: Auto-incrementing integer (primary key)
     - `merchant_id`: Foreign key to merchant
     - `slab_from`, `slab_to`: Amount range
     - `base_amount`, `emi_amount`: Payment amounts
     - `emi_tenure`: Duration in months
     - `frequency`: Payment frequency (enum)
     - `duration`: Slab duration
     - `processing_fee`: Transaction fee
     - `effective_date`, `expiry_date`: Validity period
     - `mandate_category`: Type of mandate (enum)
     - Relations: merchant

### Transaction & Mandate
- Handles payment transactions and mandates
- Models:
  1. **Transaction**
     - `id`: Auto-incrementing integer (primary key)
     - `transaction_id`: Unique transaction identifier
     - `client_transaction_id`: External reference
     - `user_id`: Foreign key to user
     - `merchant_id`: Foreign key to merchant
     - `monthly_emi`: EMI amount
     - `start_date`, `end_date`: Transaction period
     - `purpose`: Transaction purpose
     - `max_amount`: Maximum allowed amount
     - `amount`: Transaction amount
     - `sabpaisa_txn_id`: Internal reference
     - Relations: merchant, user, user_mandates
  2. **User Mandate**
     - `id`: Auto-incrementing integer (primary key)
     - `transaction_id`: Foreign key to transaction
     - `user_id`: Foreign key to user
     - `amount`: Mandate amount
     - `due_date`, `paid_date`: Payment dates
     - `bank_account_number`: Account details
     - `bank_account_type`: Account type
     - `bank_name`: Bank name
     - `bank_ifsc`: IFSC code
     - `frequency`: Payment frequency
     - `registration_status`: Mandate status
     - `bank_status_message`: Status details
     - Relations: transaction, user

### Enums
1. **Frequency**
   - Payment frequency options:
     - `ADHO`: Ad-hoc
     - `DAIL`: Daily
     - `WEEK`: Weekly
     - `MNTH`: Monthly
     - `QURT`: Quarterly
     - `MIAN`: Monthly (Interest)
     - `YEAR`: Yearly
     - `BIMN`: Bi-monthly
     - `OOFF`: One-off
     - `RCUR`: Recurring

2. **MandateCategory**
   - Mandate type categories:
     - `U005`, `B001`, `A001`, `D001`, `I002`, `L002`
     - `E001`, `I001`, `L001`, `M001`, `F001`
     - `U099`, `T002`, `T001`, `U001`, `U003`, `U006`

## 🔄 Webhook System

### Webhook Events
- Transaction Status Updates
- Mandate Registration Status
- Payment Processing Status
- User Registration
- Merchant Updates
- Role/Permission Changes

### Webhook Configuration
- Configurable endpoints
- Event filtering
- Retry mechanism
- Signature verification
- Payload encryption

## 📊 Dashboard Analytics

### Available Metrics
- Transaction Volume
- Success/Failure Rates
- Revenue Analytics
- User Growth
- Merchant Performance
- Mandate Statistics
- Payment Trends

### Report Types
- Daily Reports
- Weekly Summaries
- Monthly Analytics
- Custom Date Range Reports
- Merchant-specific Reports
- User Activity Reports

## 🔍 Search and Filtering

### Advanced Querying
- Full-text search
- Date range filtering
- Status-based filtering
- Amount-based filtering
- Multi-field sorting
- Pagination support

### Filter Types
- Transaction filters
- User filters
- Merchant filters
- Mandate filters
- Date filters
- Status filters

## 📝 Audit Logging

### Logged Events
- User actions
- System events
- Security events
- Data modifications
- Access attempts
- Configuration changes

### Log Features
- Timestamp tracking
- User identification
- IP address logging
- Action details
- Resource information
- Status tracking

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Password hashing
- Session management
- Rate limiting
- IP blocking

### Authorization
- Role-based access control
- Permission-based authorization
- Resource ownership validation
- API key management
- Scope-based access
- Team-based permissions

### Data Protection
- Input validation
- Output sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Data encryption

## 🚀 Getting Started

### Prerequisites

- Node.js v22
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/emandate.git
   cd emandate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Set up the database:
   ```bash
   # Run database migrations
   node --experimental-wasm-reftypes ./node_modules/prisma/build/index.js migrate dev

   # Seed the database (optional)
   node --experimental-wasm-reftypes ./node_modules/prisma/build/index.js db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Environment Variables

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL="mysql://user:password@localhost:3306/emandate"

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Webhook
WEBHOOK_SECRET=your_webhook_secret
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=5000

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

## 📚 API Documentation

The API documentation is built using Swagger/OpenAPI 3.0 and provides comprehensive details for all endpoints. Once the server is running, you can access:

- Swagger UI: `http://localhost:4000/api-docs`
- OpenAPI JSON: `http://localhost:4000/api-docs.json`

### Documentation Features
- Detailed request/response schemas
- Authentication requirements
- Permission requirements
- Query parameters
- Pagination details
- Error responses
- Example requests and responses

### Documented Endpoints

#### Authentication
- POST `/api/v1/auth/register` - Register a new team
- POST `/api/v1/auth/login` - Team login
- POST `/api/v1/auth/forgot-password` - Request password reset
- POST `/api/v1/auth/reset-password` - Reset password with token

#### User Management
- GET `/api/v1/users` - List users with filtering and pagination
- POST `/api/v1/users` - Create a new user
- GET `/api/v1/users/:id` - Get user details
- PATCH `/api/v1/users/:id` - Update user
- DELETE `/api/v1/users/:id` - Delete user

#### Transaction Management
- GET `/api/v1/transactions` - List transactions with filtering
- POST `/api/v1/transactions` - Create transaction
- GET `/api/v1/transactions/:id` - Get transaction details
- PATCH `/api/v1/transactions/:id` - Update transaction
- DELETE `/api/v1/transactions/:id` - Delete transaction

#### Permission Management
- GET `/api/v1/permissions` - List permissions
- POST `/api/v1/permissions` - Create permission
- GET `/api/v1/permissions/:id` - Get permission details
- PATCH `/api/v1/permissions/:id` - Update permission
- DELETE `/api/v1/permissions/:id` - Delete permission

#### Role Management
- GET `/api/v1/roles` - List roles
- POST `/api/v1/roles` - Create role
- GET `/api/v1/roles/:id` - Get role details
- PATCH `/api/v1/roles/:id` - Update role
- DELETE `/api/v1/roles/:id` - Delete role

#### Merchant Management
- GET `/api/v1/merchants` - List merchants
- POST `/api/v1/merchants` - Create merchant
- GET `/api/v1/merchants/:id` - Get merchant details
- PATCH `/api/v1/merchants/:id` - Update merchant
- DELETE `/api/v1/merchants/:id` - Delete merchant

#### Merchant Slab Management
- GET `/api/v1/merchants/:merchantId/slabs` - List merchant slabs
- POST `/api/v1/merchants/:merchantId/slabs` - Create merchant slab
- GET `/api/v1/merchants/:merchantId/slabs/:slabId` - Get slab details
- PATCH `/api/v1/merchants/:merchantId/slabs/:slabId` - Update slab
- DELETE `/api/v1/merchants/:merchantId/slabs/:slabId` - Delete slab

#### Dashboard
- GET `/api/v1/dashboard` - Get dashboard analytics

### Response Format

All API responses follow a consistent format:

```json
{
  "status": "success",
  "code": 200,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-03-21T10:00:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### Error Format

Error responses follow a consistent format:

```json
{
  "status": "error",
  "code": 400,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "meta": {
    "timestamp": "2024-03-21T10:00:00.000Z",
    "requestId": "req-123"
  }
}
```

## 🧪 Testing

### Test Categories
- Unit Tests
- Integration Tests
- API Tests
- Security Tests
- Performance Tests

### Test Coverage
- Controllers
- Services
- Middlewares
- Utilities
- Database Operations
- API Endpoints

### Running Tests
```bash
# Run all tests
npm test

# Run specific test category
npm run test:unit
npm run test:integration
npm run test:api

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📈 Monitoring and Logging

### Monitoring
- Request/Response logging
- Error tracking
- Performance monitoring
- Resource usage tracking
- API endpoint statistics
- Database query monitoring

### Logging
- Application logs
- Access logs
- Error logs
- Audit logs
- Security logs
- Performance logs

## 🔄 Database Migrations

### Migration Commands
```bash
# Create a new migration
npm run migrate:create -- --name migration_name

# Run pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Reset database
npm run migrate:reset

# Check migration status
npm run migrate:status
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
1. Create feature branch
2. Write tests
3. Implement feature
4. Run tests
5. Update documentation
6. Create pull request

### Code Style
- Follow ESLint rules
- Use Prettier formatting
- Write meaningful commits
- Add appropriate comments
- Update documentation
- Include tests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work
- Contributors - See [CONTRIBUTORS.md](CONTRIBUTORS.md)

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who have helped shape this project
- Open source community for various tools and libraries 