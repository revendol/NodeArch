import ProfileController from "@controllers/ProfileController";
import Route from '@routes/Route';
import { generateBasePath } from "@util/helper-function";

// Paths for each route
export const p = {
  basePath: `/${generateBasePath(ProfileController.constructor.name)}`,
} as const;

// Excluded routes
const excludedRoutes = [] as string[]; // example: ['add', 'single', 'edit', 'destroy', 'all'];

// Instantiate Route with ProfileController
const profileRoute = new Route(ProfileController, excludedRoutes);

profileRoute.registerMoreRoutes([
  // { method: 'post', path: p.path, handlerName: 'controllerFunctionName' },
  // {
  //  method: 'post',
  //  path: p.path,
  //  handlerName: 'controllerFunctionName',
  //  middleware: [authMiddleware]
  // }
]);

// Export the configured router
export default profileRoute.router;
