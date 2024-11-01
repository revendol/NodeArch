import AuthController from "@controllers/Auth/AuthController";
import { auth } from "@middlewares/auth";
import Route from '@routes/Route';
import {generateBasePath} from "@util/helper-function";

// Paths for each route
export const p = {
  basePath: `/${generateBasePath(AuthController.constructor.name)}`,
  register: '/register',
  login: '/login',
  logout: '/logout',
  refreshToken: '/refresh-token',
  resetEmail: '/reset-email',
  resetPassword: '/reset-password',
} as const;

// Excluded routes
const excludedRoutes = ['add', 'single', 'edit', 'destroy', 'all'];
// Instantiate Route with AuthController
const authRoute = new Route(AuthController, excludedRoutes);
authRoute.registerMoreRoutes([
  { method: 'post', path: p.register, handlerName: 'register' },
  { method: 'post', path: p.login, handlerName: 'login' },
  { method: 'post', path: p.logout, handlerName: 'logout', middlewares: [auth] },
  { method: 'post', path: p.refreshToken, handlerName: 'refreshToken' },
  { method: 'post', path: p.resetEmail, handlerName: 'resetPasswordEmail' },
  { method: 'post', path: p.resetPassword, handlerName: 'reset' },
]);
// Export the configured router
export default authRoute.router;
