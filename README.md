# README.md

# Todo API

A robust Node.js Express API for managing todos with authentication, built using TypeScript, MySQL, and Sequelize ORM.

## Features

- **Authentication**
  - JWT-based authentication
  - Session management
  - Login/Logout functionality
  
- **Todo Management**
  - CRUD operations for todos
  - Input validation using Joi
  - Pagination and filtering (planned)

- **Database**
  - MySQL with Sequelize ORM
  - Database migrations
  - Seeders for testing data

- **Security**
  - Helmet for security headers
  - Password hashing with bcrypt
  - JWT token validation

- **Documentation**
  - Swagger API documentation
  - Detailed API specifications

- **Logging**
  - Winston logger implementation
  - Daily rotating log files
  - HTTP request logging with Morgan

## Project Structure


```
todo-api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Custom middleware
│   ├── migrations/      # Database migrations
│   ├── models/          # Sequelize models
│   ├── repositories/    # Data access layer
│   ├── routes/          # API routes
│   ├── schemas/         # Validation schemas
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── app.ts           # Starting point of the application
│   └── di-container.ts  # Dependency resolution container
├── logs/                # Application logs
├── .env                 # Environment variables
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
├── sequelize.config.js  # Sequelize configuration
└── .gitignore           # Git ignored files
```


## Prerequisites

- Node.js >= 14
- MySQL >= 5.7
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd todo-api

2. Install dependencies
   ```bash 
   npm install

3. Configure environment 
   ```bash
   cp .env.example .env  

4. Run migrations
   ```bash
   npm run migrate

5. Start server
   ```bash
   npm run dev
   ```

## Available Scripts

- **`npm run dev`**: Start the development server with hot-reload.
- **`npm start`**: Start the production server.
- **`npm run migrate`**: Run database migrations.
- **`npm run seed`**: Seed the database.
- **`npm run seed:undo`**: Undo all seeds.
- **`npm run make:model`**: Generate a new model.
- **`npm run make:seeder`**: Generate a new seeder.

## API Documentation

- Access the Swagger documentation at [http://localhost:3000/api-docs](http://localhost:3000/api-docs) when running in development mode.

Authentication
The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Contributing
Contributions are welcome! If you have any suggestions, improvements, or bug fixes, feel free to open an issue or create a pull request.

- **Create a feature branch**.
- **Commit your changes**.
- **Push to the branch**.
- **Create a Pull Request**.

#### Author

- GitHub: [https://github.com/sajithnsilvame](https://github.com/sajithnsilvame)
- Twitter: [https://x.com/SajithNSilvame](https://x.com/SajithNSilvame)
- LinkedIn: [https://www.linkedin.com/in/sajith-nishantha-silva](https://www.linkedin.com/in/sajith-nishantha-silva)
- Facebook: [https://www.facebook.com/sajithnsilva.me](https://www.facebook.com/sajithnsilva.me)
- Instagram: [https://www.instagram.com/sajithnsilvame](https://www.instagram.com/sajithnsilvame)

#### License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)