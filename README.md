# Backend API Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/sajithnsilvame/backend-api-server/actions/workflows/deploy.yml/badge.svg)](https://github.com/sajithnsilvame/backend-api-server/actions/workflows/deploy.yml)

A Node.js Express MySQL backend template for building robust APIs. Features authentication, user roles, security best practices, and more. Built with TypeScript.

## Table of Contents
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Prerequisites](#prerequisites)
* [Environment Variables](#environment-variables)
* [Getting Started](#getting-started)
  * [1. Without Docker](#1-without-docker)
  * [2. With Docker (Recommended)](#2-with-docker-recommended)
* [Available Scripts](#available-scripts)
* [API Documentation](#api-documentation)
* [Authentication](#authentication)
* [Project Structure](#project-structure)
* [Security](#security)
* [Logging](#logging)
* [Contributing](#contributing)
* [License](#license)
* [Author](#author)

## Features
*   JWT-based Authentication (Login, Logout, Session Management tied to DB)
*   Role-Based Access Control (RBAC)
*   Secure Password Hashing (bcrypt)
*   Input Validation (Joi)
*   Security Headers (Helmet)
*   CORS Configuration
*   API Rate Limiting
*   Basic XSS Protection (Input Sanitization)
*   Centralized Error Handling
*   Structured Logging (Winston & Morgan)
*   Database Migrations & Seeding (Sequelize)
*   API Documentation (Swagger)
*   Dockerized Environment (Docker & Docker Compose)
*   TypeScript for type safety and maintainability

## Tech Stack
*   **Backend:** Node.js, Express.js, TypeScript
*   **Database:** MySQL, Sequelize (ORM)
*   **Authentication:** JSON Web Tokens (JWT), bcrypt
*   **Validation:** Joi
*   **Security:** Helmet, express-rate-limit, sanitize-html
*   **Logging:** Winston, Morgan
*   **API Documentation:** Swagger (swagger-jsdoc, swagger-ui-express)
*   **Containerization:** Docker

## Prerequisites
*   Node.js (v22 or higher recommended - based on Dockerfile `node:22`)
*   npm (comes with Node.js)
*   Docker and Docker Compose (Optional, for containerized setup)
*   MySQL Server (If running locally without Docker, e.g., MySQL 5.7 based on `docker-compose.yml`)

## Environment Variables
A `.env` file is required in the project root. Copy the example structure below and update it with your configuration.

```env
# Application Configuration
PORT=3000                 # Port for the application. For local, use 3000 or other. For Docker with provided docker-compose.yml, set to 8000.
APP_NAME="My API Server"
NODE_ENV=development      # development or production
CLIENT_ORIGIN="*"         # Frontend URL for CORS, or * to allow all

# JWT Configuration
JWT_SECRET="YOUR_VERY_STRONG_JWT_SECRET"  # !! IMPORTANT: Change this to a long, random string !!
JWT_EXPIRES_IN="1h"                       # Example: 1h, 7d

# Database Configuration (These are used for local setup. For Docker, DB connection details for the 'app' service are taken from docker-compose.yml)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=auth_api

# Swagger UI URL
SWAGGER_URL=/api-docs

# Rate Limiting (optional, defaults are set in code)
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX=100          # Max 100 requests per windowMs per IP
```

*   **CRITICAL:** The `JWT_SECRET` must be a long, random, and unique string. Keep it private and secure.
*   **Note on Docker Compose & PORT Variable:**
    *   The `docker-compose.yml` file maps host port 8000 to container port 8000 for the `app` service (`ports: - "8000:8000"`).
    *   The Node.js application (`src/app.ts`) uses `process.env.PORT || 3000` to determine its listening port.
    *   The `app` service in `docker-compose.yml` sets its `PORT` environment variable from the `.env` file (`environment: PORT: ${PORT}`).
    *   Therefore, to ensure the application inside the Docker container correctly listens on port 8000 (matching the `docker-compose.yml` port mapping), you **must set `PORT=8000` in your `.env` file** when using Docker Compose.
*   **Database Credentials with Docker:** The `docker-compose.yml` defines environment variables for the `app` service for database connection (e.g., `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`). These values set in `docker-compose.yml` (which can also reference variables from the `.env` file) take precedence for the Dockerized application. The `db` service in `docker-compose.yml` has its own separate MySQL credentials.

## Getting Started

**1. Without Docker:**
   1. Clone the repository: `git clone <repository-url>` (Replace `<repository-url>` with the actual URL of this repository)
   2. Navigate to the project directory: `cd backend-api-server`
   3. Install dependencies: `npm install`
   4. Create a `.env` file in the root directory. Copy the example structure from the "Environment Variables" section. Fill in your values, especially a unique `JWT_SECRET` and your local MySQL database credentials. Set `PORT` to your desired local port (e.g., 3000).
   5. Ensure your MySQL server is running and accessible with the credentials provided in your `.env` file.
   6. Run database migrations: `npm run migrate`
   7. (Optional) Seed the database with initial data: `npm run seed`
   8. Start the development server: `npm run dev`
      The application should be running on `http://localhost:PORT` (e.g., `http://localhost:3000`).

**2. With Docker (Recommended):**
   1. Clone the repository: `git clone <repository-url>` (Replace `<repository-url>` with the actual URL of this repository)
   2. Navigate to the project directory: `cd backend-api-server`
   3. Create a `.env` file in the root directory.
      *   Copy the example structure from the "Environment Variables" section.
      *   **Crucially, set `PORT=8000` in this `.env` file.** This makes the Node.js app inside the container (via the `PORT: ${PORT}` environment setting in `docker-compose.yml` for the `app` service) listen on port 8000. This matches the `docker-compose.yml` port mapping (`8000:8000`), making the app accessible on `http://localhost:8000` on your host machine.
      *   You also need to set `APP_NAME`, a unique `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN`, and `SWAGGER_URL`.
      *   Database connection details for the `app` service (like `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`) will be taken from the `environment` section of the `app` service in `docker-compose.yml`. These can reference variables from your `.env` file.
   4. Build and start the containers: `docker-compose up -d --build`
      The application will be accessible at `http://localhost:8000`. The database (MySQL) will be accessible on `localhost:3306` from your host machine (as mapped in `docker-compose.yml`).
   5. To run database migrations: `docker-compose exec app npm run migrate`
   6. (Optional) To seed the database: `docker-compose exec app npm run seed`
   7. To view logs from the application container: `docker-compose logs -f app`
   8. To view logs from the database container: `docker-compose logs -f db`

## Available Scripts
*   `npm run dev`: Starts the development server using `nodemon` for auto-reloading.
*   `npm start`: Builds the TypeScript code (outputs to `dist/`) and starts the application in production mode.
*   `npm run build`: Compiles TypeScript to JavaScript (output to `dist/` directory).
*   `npm run migrate`: Applies database migrations using Sequelize CLI.
*   `npm run seed`: Seeds the database using Sequelize CLI.
*   `npm run seed:undo`: Reverts all database seeds.
*   `npm run make:model <modelName>`: Generates a new Sequelize model file in `src/models`.
*   `npm run make:seeder <seederName>`: Generates a new Sequelize seeder file in `src/seeders`.
*   `npm run make:route <routeName>`: Generates a new route file template in `src/routes`.
*   `npm run make:controller <controllerName>`: Generates a new controller file template in `src/controllers`.
*   `npm run make:service <serviceName>`: Generates a new service file template in `src/services`.
*   `npm run make:repo <repositoryName>`: Generates a new repository file template in `src/repositories`.

## API Documentation
*   API documentation is generated using Swagger.
*   Once the application is running, access the Swagger UI at the URL specified by `SWAGGER_URL` in your `.env` file, relative to the application's base URL.
    *   Example (using Docker with `PORT=8000` and `SWAGGER_URL=/api-docs` in `.env`): `http://localhost:8000/api-docs`
    *   Example (local setup with `PORT=3000` and `SWAGGER_URL=/api-docs` in `.env`): `http://localhost:3000/api-docs`
*   The Swagger definition is auto-generated from JSDoc comments in the route files (primarily within `./src/routes/*.ts`) and configured in `src/config/swagger.ts`.

## Authentication
*   The API uses JSON Web Tokens (JWT) for authentication.
*   After successful login (e.g., via `/api/auth/login`), a JWT token is returned.
*   Include this token in the `Authorization` header for protected routes, prefixed with `Bearer `:
    ```
    Authorization: Bearer <your-jwt-token>
    ```
*   User sessions are also tracked in the database (table `UserSessions`) for enhanced security, allowing for server-side session invalidation (e.g., on logout).

## Project Structure
```
backend-api-server/
├── .env                   # Environment variables (must be created by user from example)
├── Dockerfile             # Docker configuration for the application
├── docker-compose.yml     # Docker Compose configuration for multi-container setup
├── package.json           # Project dependencies and scripts
├── sequelize.config.ts    # Sequelize CLI configuration (uses environment variables)
├── tsconfig.json          # TypeScript compiler options
├── src/
│   ├── app.ts             # Main application entry point, Express app setup
│   ├── config/            # Application configuration (database, swagger, logger, etc.)
│   ├── controllers/       # Express controllers (handle requests and responses)
│   ├── middlewares/       # Custom Express middlewares (authentication, error handling, validation)
│   ├── migrations/        # Database migration files generated by Sequelize
│   ├── models/            # Sequelize model definitions (database schema)
│   ├── repositories/      # Data Access Layer (interacts with models and database)
│   ├── routes/            # API route definitions
│   ├── schemas/           # Joi validation schemas for request bodies/params
│   ├── seeders/           # Database seeder files generated by Sequelize
│   ├── services/          # Business logic layer
│   ├── types/             # TypeScript type definitions and interfaces
│   └── utils/             # Utility functions (AppError, catchAsync, JWT helpers, logger instance)
└── logs/                    # Directory for log files (created if Winston file transport is configured)
```

## Security
This project incorporates several security best practices:
*   **Helmet:** Sets various HTTP headers to protect against common web vulnerabilities (e.g., XSS, content sniffing).
*   **bcrypt:** Used for hashing passwords securely before storing them.
*   **JWT Authentication:** Secure, stateless token-based authentication with DB-backed session tracking for forced logout capability.
*   **Input Validation:** Joi schemas validate incoming request data (body, params, query) to prevent malformed inputs and common injection vectors.
*   **Rate Limiting:** `express-rate-limit` is used to protect API endpoints against brute-force and denial-of-service attacks.
*   **CORS:** Configured via `cors` package to control cross-origin requests, allowing only trusted frontend origins.
*   **XSS Protection:** Basic input sanitization for string fields in request bodies using `sanitize-html` middleware.
*   **Environment Variables:** Sensitive data (like API keys, database credentials, JWT secrets) is managed via `.env` files and not hardcoded into the source code.
*   **Centralized Error Handling:** Consistent error response format.

## Logging
*   **HTTP Request Logging:** Morgan is used to log incoming HTTP requests, providing details like method, URL, status code, and response time.
*   **Application Logging:** Winston is used for structured, leveled logging (error, warn, info, debug) throughout the application.
*   Logs are output to the console by default. Winston can be further configured (see `src/config/logger.ts`) to write logs to files (e.g., in the `logs/` directory) or other transports.
*   In development (`NODE_ENV=development`), logs are typically formatted for human readability. In production (`NODE_ENV=production`), logs are often structured (e.g., JSON format) for easier parsing and analysis by log management systems.

## Contributing
Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes, adhering to the project's coding style and conventions.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request for review.

## License
This project is licensed under the MIT License. See the badge at the top of this file for a link to the license details. (A `LICENSE` file is not currently present in the repository; the badge serves as the primary indicator).

## Author
*   **Sajith N Silva**
*   GitHub: [https://github.com/sajithnsilvame](https://github.com/sajithnsilvame) (as per `package.json` and repository context)