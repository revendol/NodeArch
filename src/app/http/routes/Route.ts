import { Router, Request, Response, NextFunction } from 'express';
import IController from '@type/controller';
import logger from "@util/logger";

type RouteConfig<T> = {
  method: 'post' | 'get' | 'delete' | 'put' | 'patch' | 'options' | 'head';
  path: string;
  handlerName: keyof T; // Ensures handlerName is a valid key of T
  middlewares?: Array<(req: Request, res: Response, next: NextFunction) => void>;
};

export default class Route<T extends IController> {
  public router: Router;
  public controller: T;
  public exclude: Set<string>;

  constructor(controller: T, exclude: string[] = []) {
    this.controller = controller;
    this.router = Router();
    this.exclude = new Set(exclude);
    this.registerRoutes();
  }

  // Register routes with string handler names
  public registerMoreRoutes(routes: RouteConfig<T>[]): void {
    routes.forEach(({ method, path, handlerName, middlewares = [] }) => {
      if (!this.exclude.has(handlerName as string)) {
        const handler = this.controller[handlerName];
        if (typeof handler === 'function') {
          this.router[method](
            path,
            ...middlewares,
            this.asyncHandler(handler.bind(this.controller) as (
              req: Request,
              res: Response,
              next: NextFunction
            ) => Promise<Response> | Response)
          );
        } else {
          logger.error(`Handler "${String(handlerName)}" does not exist on the controller.`);
        }
      }
    });
  }

  // Async error handler for route methods
  public asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Response | Promise<Response>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Register core routes based on configuration
  protected registerRoutes(): void {
    const routes: RouteConfig<T>[] = [
      { method: 'post', path: '/add', handlerName: 'add' as keyof T },
      { method: 'get', path: '/list', handlerName: 'all' as keyof T },
      { method: 'get', path: '/single/:field/:value', handlerName: 'single' as keyof T },
      { method: 'post', path: '/edit/:field/:value', handlerName: 'edit' as keyof T },
      { method: 'delete', path: '/delete/:field/:value', handlerName: 'destroy' as keyof T }
    ];
    this.registerMoreRoutes(routes);
  }
}
