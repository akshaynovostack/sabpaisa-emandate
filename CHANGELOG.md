# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with Express.js
- PostgreSQL database integration with Prisma ORM
- Role and Team models with CRUD operations
- Authentication system with JWT
- Role-based access control
- API documentation using Swagger/OpenAPI
- Error handling middleware
- Rate limiting middleware
- Validation middleware
- Logging system with Winston
- Database models for Role, Team, and Auth
- Database migrations for role and team tables
- Database seeding functionality
- Comprehensive Swagger documentation for:
  - User management endpoints
  - Transaction management endpoints
  - Permission management endpoints
  - Role management endpoints
  - Merchant and merchant slab endpoints
  - Dashboard endpoints
- **NEW**: Mandate calculation API endpoint (`/api/v1/merchants/calculate-mandate`) without authentication
  - Calculates mandate details based on merchant ID and payout amount
  - Returns start date, end date, total EMIs, convenience fee, EMI amount, frequency, and duration
  - Uses merchant slabs to determine applicable rates and terms
  - Supports various payment frequencies (daily, weekly, monthly, etc.)
- **NEW**: External API route structure (`/api/v1/external/`) for public endpoints
  - Moved mandate calculation to `/api/v1/external/calculate-mandate`
  - No authentication required for external APIs
  - Separate route organization for public vs protected endpoints
- **NEW**: Google Tag Manager (GTM) integration in EJS templates
  - Added GTM script tags to mandate-related EJS templates
  - Implemented in mandateDetails.ejs, mandateFailure.ejs, mandateForm.ejs, and mandateRedirect.ejs
  - Includes both head script and noscript iframe for comprehensive tracking
- **NEW**: Enhanced mandate calculation features
  - Frequency descriptions in response (e.g., "Daily", "Weekly", "Monthly")
  - Duration calculation based on frequency and EMI tenure
  - Fixed EMI calculation logic to use payment amount directly
  - Improved duration calculation (e.g., bi-monthly tenure × 2 for months)
- **NEW**: "No recent activities found" response for dashboard endpoints
- **NEW**: Percentage changes in dashboard statistics
- **NEW**: Comprehensive Swagger documentation updates
  - Added detailed response schemas for mandate calculation
  - Updated dashboard endpoints with new response formats
  - Enhanced error handling documentation
  - Added external API documentation section

### Changed
- Reorganized database-related files under `src/db/`:
  - Moved models to `src/db/models/`
  - Moved migrations to `src/db/migrations/`
  - Moved seeders to `src/db/seeders/`
  - Moved database config to `src/db/config/`
  - Moved Prisma schema to `src/db/schema.prisma`
- Updated Prisma configuration in package.json to reflect new file structure
- Improved project structure for better organization
- Enhanced API documentation with:
  - Detailed request/response schemas
  - Authentication requirements
  - Permission requirements
  - Query parameters
  - Pagination details
  - Error responses
  - Examples for all endpoints
- **UPDATED**: Swagger configuration to include multiple server environments:
  - Development server: `http://localhost:4000`
  - UAT server: `https://sabpaisa-crm.novostack.net/api`
- **FIXED**: Prisma model/table usage in mandate and transaction services
  - Corrected table names and field references
  - Fixed database query issues
  - Improved data consistency
- **IMPROVED**: Mandate calculation logic
  - Fixed EMI tenure calculation (removed incorrect multiplication)
  - Enhanced duration calculation based on frequency
  - Improved frequency mapping to descriptive names
  - Better handling of payment amount vs slab ranges

### Security
- Implemented password hashing (to be enabled in production)
- Added JWT-based authentication
- Added role-based access control
- Added rate limiting for API endpoints

## [0.2.0] - 2024-03-20
### Added
- Swagger documentation for all API endpoints
- OpenAPI 3.0 specification compliance
- Detailed schema definitions for all models
- Authentication and permission requirements documentation
- Query parameter documentation
- Response schema documentation
- Example requests and responses

### Changed
- Updated API documentation to follow OpenAPI 3.0 standards
- Enhanced endpoint descriptions and examples
- Improved error response documentation
- Added pagination details for list endpoints
- Added meta information for timestamps and counts

## [0.1.0] - 2024-03-10
### Added
- Initial project setup
- Basic Express.js server configuration
- Environment configuration
- Basic project structure
- Git initialization
- Package.json with initial dependencies
- README.md with project documentation 