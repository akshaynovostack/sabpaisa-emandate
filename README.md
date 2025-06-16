# eMandate System

A robust Node.js-based eMandate system for managing recurring payments and mandates, built with Express.js, MySQL, and Prisma ORM.

## 🚀 Features

- 🔐 Secure authentication and authorization
- 👥 Team and role-based access control
- 📝 Electronic mandate management
- 📊 Comprehensive API documentation with Swagger
- 🔄 Database migrations and seeding
- 🛡️ Security best practices
- 📈 Rate limiting and request validation
- 🧪 Testing setup with Jest

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
│   │   └── schema.prisma     # Prisma schema
│   │
│   ├── middlewares/          # Custom middlewares
│   │   ├── auth.js          # Authentication middleware
│   │   ├── error.js         # Error handling middleware
│   │   ├── rateLimiter.js   # Rate limiting middleware
│   │   └── validate.js      # Request validation middleware
│   │
│   ├── utils/              # Utility functions
│   │   ├── catchAsync.js   # Async error handler
│   │   └── logger.js       # Logging utility
│   │
│   ├── v1/                 # API version 1
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Version-specific middlewares
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── validations/    # Request validations
│   │
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
│
├── tests/                 # Test files
│   ├── integration/       # Integration tests
│   └── unit/             # Unit tests
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

## 📚 API Documentation

Once the server is running, you can access the API documentation at:
- Swagger UI: `http://localhost:4000/api-docs`
- OpenAPI JSON: `http://localhost:4000/api-docs.json`

### Key Endpoints

- **Authentication**
  - POST `/api/v1/auth/register` - Register a new team
  - POST `/api/v1/auth/login` - Team login
  - POST `/api/v1/auth/forgot-password` - Request password reset
  - POST `/api/v1/auth/reset-password` - Reset password with token

- **Teams**
  - GET `/api/v1/teams` - List teams
  - POST `/api/v1/teams` - Create a new team
  - GET `/api/v1/teams/:id` - Get team details
  - PUT `/api/v1/teams/:id` - Update team
  - DELETE `/api/v1/teams/:id` - Delete team

- **Team Members**
  - GET `/api/v1/teams/:id/members` - List team members
  - POST `/api/v1/teams/:id/members` - Add team member
  - DELETE `/api/v1/teams/:id/members/:memberId` - Remove team member

- **Transactions**
  - GET `/api/v1/transactions` - List transactions
  - POST `/api/v1/transactions` - Create transaction
  - GET `/api/v1/transactions/:id` - Get transaction details

- **Mandates**
  - GET `/api/v1/mandates` - List mandates
  - POST `/api/v1/mandates` - Create mandate
  - GET `/api/v1/mandates/:id` - Get mandate details

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Security Features
- Token expiration
- Refresh token mechanism
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Secure cookie handling

### Authentication Flow
1. Team login/register
2. Server validates credentials
3. JWT token generated
4. Token returned to client
5. Token used in subsequent requests

## 🔒 Authorization

### Role-Based Access Control (RBAC)
- Hierarchical role system
- Role-based permissions
- Resource ownership validation

### Access Levels
1. **Super Admin**
   - Full system access
   - Manage all teams and roles
   - System configuration

2. **Admin**
   - Team management
   - Role assignment
   - Limited system access

3. **User**
   - Basic operations
   - Own resource management
   - Limited team access

### Permission Checks
- Middleware-based permission validation
- Resource ownership verification
- Role hierarchy enforcement

## 📝 Logging

### Logging System
- Uses Winston for logging
- Multiple log levels:
  - `error` - Error logs
  - `warn` - Warning logs
  - `info` - Information logs
  - `debug` - Debug logs

### Log Format
```json
{
  "timestamp": "2024-03-21T10:00:00.000Z",
  "level": "info",
  "message": "Team logged in",
  "teamId": "123",
  "ip": "192.168.1.1",
  "method": "POST",
  "path": "/api/v1/auth/login"
}
```

### Log Storage
- Console logging in development
- File-based logging in production
- Log rotation
- Error tracking integration

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Style
The project uses ESLint and Prettier for code formatting:
```bash
# Check code style
npm run lint

# Format code
npm run format
```

### Database Migrations
When making schema changes:
1. Update the Prisma schema
2. Create a migration:
   ```bash
   node --experimental-wasm-reftypes ./node_modules/prisma/build/index.js migrate dev --name <migration_name>
   ```
3. Apply the migration:
   ```bash
   node --experimental-wasm-reftypes ./node_modules/prisma/build/index.js migrate deploy
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- Prisma team for the excellent ORM
- All contributors who have helped shape this project 