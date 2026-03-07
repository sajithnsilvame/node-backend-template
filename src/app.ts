import "reflect-metadata";
import express from 'express';
import { json } from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger';
import routes from './routes/index';
import connectToDatabase from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import helmet from 'helmet';
import morgan from 'morgan';
import morganMiddleware from './middlewares/logger.middleware';
import cors from 'cors';
import { apiLimiter } from "./middlewares/rateLimit.middleware";
import config from './config/application.config';
import Logger from './utils/logger';

const app = express();
const PORT = config.app.port;

// Export app for testing
export { app };

// CORS middleware
const corsOptions = {
  origin: config.app.clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Security middleware
app.use(helmet());

// Logging middleware (morgan integrated with winston Logger)
app.use(morganMiddleware);

// Request logging middleware
if (config.app.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(apiLimiter);

// Body parsers
app.use(json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Swagger docs (development only)
if (config.app.nodeEnv === 'development') {
  app.use(config.app.swaggerUrl, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: true, message: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler — must be after all routes
app.use(notFoundHandler);

// Global error handler — must be last
app.use(errorHandler);

// Database connection and server startup
connectToDatabase.authenticate()
  .then(() => {
    app.listen(PORT, () => {
      Logger.info('Connected to database');
      Logger.info(`Application Mode: ${config.app.nodeEnv}`);
      Logger.info(`Server is running on http://localhost:${PORT}/api`);
      if (config.app.nodeEnv === 'development') {
        Logger.info(`Swagger docs available at http://localhost:${PORT}${config.app.swaggerUrl}`);
      }
    });
  })
  .catch(err => {
    Logger.error('Database connection failed', { error: err });
    process.exit(1);
  });
