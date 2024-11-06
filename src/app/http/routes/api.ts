import { Router } from 'express';
import authRouter, { p as authPath } from "@routes/AuthRouter";

// Define the API version
const API_VERSION = '/v1';

// Initialize the main API router
const apiRouter = Router();

/*================================================
 Add versioned API routes
================================================*/
apiRouter.use(`${API_VERSION}${authPath.basePath}`, authRouter);


// **** Export default **** //
export default apiRouter;
