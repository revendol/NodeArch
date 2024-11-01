import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import StatusCodes from 'http-status-codes';
import { failure } from "@shared/response";
import envVars from "@shared/env-vars";
import SecurityRepo from "@repos/SecurityRepo";
import { ISecurity } from "@models/Security";
import UserService from "@services/UserService";
import {IUser} from "@models/User";
const { UNAUTHORIZED } = StatusCodes;
import {IAuthMiddlewareData} from "@type/auth";

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!authHeader || !token) {
      // Fix: Clearer check for empty or undefined token
      return res.status(UNAUTHORIZED).send(failure({
        message: "No token found in the header. Please try again later.",
        errors: {}
      }));
    }

    // Verify JWT Token
    let decoded: IAuthMiddlewareData;
    try {
      decoded = jwt.verify(token, envVars.jwt.secret) as IAuthMiddlewareData;
    } catch (err) {
      // Fix: More specific error handling for JWT verification
      return res.status(UNAUTHORIZED).send(failure({
        message: "Invalid token or signature.",
        errors: {}
      }));
    }
    // Fetch user by email
    const user : IUser | null = await UserService.singleByField({
      email: decoded.email
    });
    if (!user?.email) {
      return res.status(UNAUTHORIZED).send(failure({
        message: "User not found. Please try again later.",
        errors: {}
      }));
    }

    const loginInfo: ISecurity | null = await SecurityRepo.singleByField({
      userCustomID: user.customID
    });
    if (!loginInfo || loginInfo.accessToken !== token) {
      // Improved check for token mismatch or missing login info
      return res.status(UNAUTHORIZED).send(failure({
        message: "Invalid signature or access token has changed. Please try again later.",
        errors: {}
      }));
    }
    // Attach decoded token to request for further use
    req.token = decoded;
    next();
  } catch (err) {
    // Fix: Include the actual error details in the response (useful for debugging)
    return res.status(UNAUTHORIZED).send(failure({
      message: "An error occurred during authentication. Please try again.",
      errors: err
    }));
  }
};
