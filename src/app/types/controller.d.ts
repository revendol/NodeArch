import { Request, Response } from 'express';

interface IController {
  add(req: Request, res: Response): Promise<Response> | Response;
  all(req: Request, res: Response): Promise<Response> | Response;
  single(req: Request, res: Response): Promise<Response> | Response;
  edit(req: Request, res: Response): Promise<Response> | Response;
  destroy(req: Request, res: Response): Promise<Response> | Response;
}

export default IController;