import { Router, Request, Response } from 'express';
import sequelize from '../config/database';
import config from '../config/application.config';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns API status, version, environment, and database connectivity
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 app:
 *                   type: string
 *                 version:
 *                   type: string
 *                 environment:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                 database:
 *                   type: string
 *       503:
 *         description: Service is unhealthy (database unreachable)
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = 'connected';
  let httpStatus = 200;

  try {
    await sequelize.authenticate();
  } catch {
    dbStatus = 'disconnected';
    httpStatus = 503;
  }

  res.status(httpStatus).json({
    status: httpStatus === 200,
    app: config.app.name,
    version: config.app.version,
    environment: config.app.nodeEnv,
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

export default router;
