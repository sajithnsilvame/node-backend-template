import "reflect-metadata";
import express from 'express';
import { json } from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger';
import routes from './routes/index';
import connectToDatabase from './config/database';
import { errorHandler } from './middlewares/error.middleware';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import morganMiddleware from './middlewares/logger.middleware';
import cors from 'cors';
import { apiLimiter } from "./middlewares/rateLimit.middleware";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || '*', // Allow all origins or specify the frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
};

app.use(cors(corsOptions)); // Use CORS middleware

// Security middleware
app.use(helmet());

// Logging middleware (morgan integrated with winston Logger)
app.use(morganMiddleware);

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Logs: :method :url :status :response-time ms
} else {
    app.use(morgan('combined')); // More detailed logging for production
}

app.use(apiLimiter);

// Middleware
app.use(json());
if (process.env.NODE_ENV === 'development') {
    app.use(process.env.SWAGGER_URL || '/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    
}

// Routes
app.use('/api', routes);

// Default route (optional)
app.get('/api', (req, res) => {
  res.send('Welcome to the Todo API');
});

// Error handling middleware
app.use(errorHandler);

// Database connection
connectToDatabase.authenticate()
  .then(() => {
    app.listen(PORT, () => {
      console.log('Connected to database');
      console.log(`Server is running on http://localhost:${PORT}/api`);
      console.log(`Swagger docs available at http://localhost:${PORT}${process.env.SWAGGER_URL || '/api-docs'}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });