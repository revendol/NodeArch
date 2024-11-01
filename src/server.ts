import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import 'express-async-errors';
import logger from '@util/logger'; // Updated to use Winston logger
import BaseRouter from '@routes/api';
import envVars from '@shared/env-vars';
import { CustomError } from '@shared/errors';

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.connectToDatabase();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this.app.set('port', envVars.port);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(envVars.cookieProps.secret));

    // Development logging
    if (envVars.nodeEnv === 'development') {
      this.app.use(morgan('dev', {
        stream: { write: (message) => logger.info(message.trim()) }
      }));
    }

    // Security middleware for production
    if (envVars.nodeEnv === 'production') {
      this.app.use(helmet());
    }
  }

  private connectToDatabase(): void {
    mongoose
      .connect(envVars.mongoDB.url)
      .then(() => logger.info('Database connected successfully'))
      .catch((error: Error) => {
        logger.error('Failed to connect to the database', {
          message: error.message,
          stack: error.stack
        });
        throw new Error('Failed to connect to the database');
      });
  }

  private configureRoutes(): void {
    // Primary API Routes
    this.app.use('/api', BaseRouter);

    // Default route for root access
    this.app.get('/', (req, res) => {
      res.status(StatusCodes.OK).send({
        message: "Ouch! It hurts 😔 Why would you do that?",
      });
      logger.info('Root access endpoint hit');
    });
  }

  private configureErrorHandling(): void {
    // Error handling middleware
    this.app.use((err: Error | CustomError, req: Request, res: Response) => {
      logger.error('An error occurred', {
        message: err.message,
        stack: err.stack
      });
      const status = err instanceof CustomError ?
        err.HttpStatus :
        StatusCodes.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        error: err.message,
      });
    });
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      logger.info(`Express server started on port: http://localhost:${port}`);
    });
  }
}

export default new Server();
