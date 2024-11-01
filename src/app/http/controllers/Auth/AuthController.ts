import {Request, Response} from 'express';
import StatusCodes from 'http-status-codes';
import ErrorMessage from "@shared/errorMessage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envVars from "@shared/env-vars";
import {IUser} from "@models/User";
import SecurityService from "@services/SecurityService";
import UserService from "@services/UserService";
import moment from "moment";
import mailer from "@util/mailer";
import template from "@views/emails/reset-password.email";
import VerificationService from "@services/VerificationService";
import Controller from "@controllers/Controller";
import AuthValidator from "@validators/AuthValidator";
import {IValidation, ValidationType} from "@validators/Validators";
import {failure, success} from "@shared/response";
import logger from "@util/logger";
import {ISecurity} from "@models/Security";
import {
  IAuthMiddlewareData,
  ILoginRequest,
  IRefreshTokenRequest, IRegisterRequest,
  IResetPasswordEmailRequest,
  IResetPasswordRequest
} from "@type/auth";

const { INTERNAL_SERVER_ERROR, BAD_REQUEST, UNPROCESSABLE_ENTITY, OK, UNAUTHORIZED } = StatusCodes;



class AuthController extends Controller<IUser> {
  constructor() {
    super(UserService, AuthValidator);
  }
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password } : IRegisterRequest = req.body as IRegisterRequest;

      const validation : IValidation  = await AuthValidator.validateAdd(
        req.body as Record<string, unknown>
      );

      if (validation.hasError) {
        logger.warn("Validation failed during add operation", { errors: validation.errors });
        return res.status(BAD_REQUEST).json(this.failure(validation.message, validation.errors));
      }

      const existingUser : IUser | null = await this.Service.singleByField({ email });
      if (existingUser) {
        logger.info("User already exists with this email address.", { email });
        return res
          .status(UNPROCESSABLE_ENTITY)
          .json(this.failure("A user already exists with this email address."));
      }

      const created = await this.Service.addAndReturn({ name, email, password });
      // Specify return type without password
      const createdUser = created.toObject() as Partial<IUser>;

      delete createdUser.password; // Remove password

      logger.info("User created.", { createdUser });
      return res
        .status(OK)
        .json(this.success(ErrorMessage.HTTP_OK, createdUser));
    } catch (error : unknown) {
      logger.error("Error creating user.", { error });
      return res
        .status(INTERNAL_SERVER_ERROR)
        .json(this.failure(ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, {}));
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } : ILoginRequest = req.body as ILoginRequest;

      const validation  = await AuthValidator.validate(
        req.body as Record<string, unknown>,
        ValidationType.CUSTOM,
        {email: 'required|email', password: 'required|string'}
      );

      if (validation.hasError) {
        logger.warn("Validation failed during add operation", { errors: validation.errors });
        return res.status(BAD_REQUEST).json(this.failure(validation.message, validation.errors));
      }

      const user = await UserService.singleByFieldWithPassword({ email });
      if (!user || !bcrypt.compareSync(password, user.password)) {
        logger.warn("Invalid email or password.", { email, password });
        return res.status(UNAUTHORIZED).json(this.failure('Invalid email or password.'));
      }

      const accessToken = jwt.sign({
        email: user.email,
        name: user.name,
        role: user.role
      }, envVars.jwt.secret, {
        expiresIn: envVars.jwt.exp
      });
      const refreshToken = jwt.sign({
        id: user.customID,
        email: user.email,
        name: user.name,
        role: user.role
      }, envVars.jwt.secret, {
        expiresIn: envVars.jwt.refExp
      });

      await SecurityService.add({
        userCustomID: user.customID,
        accessToken,
        refreshToken,
        refreshTokenExpiresAt: moment().add(30, 'days').toDate()
      });
      logger.info("User logged in successfully.", { user: { name: user.name, email: user.email } });
      return res
        .status(OK)
        .json(this.success('User logged in successfully', {
          user: {
            name: user.name,
            email: user.email,
            role: user.role
          },
          accessToken,
          refreshToken
        }));
    } catch (error : unknown) {
      logger.error("Error logging in user.", { error });
      return res
        .status(INTERNAL_SERVER_ERROR)
        .json(this.failure(ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, {}));
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { token } : IRefreshTokenRequest = req.body as IRefreshTokenRequest;

      const validation = await AuthValidator.validate(
        req.body as Record<string, unknown>,
        ValidationType.CUSTOM,
        {token: 'required|string'}
      );

      if (validation.hasError) {
        logger.warn("Validation failed during add operation", { errors: validation.errors });
        return res.status(BAD_REQUEST).json(failure({
          message: ErrorMessage.HTTP_BAD_REQUEST,
          errors: validation.errors
        }));
      }

      let decoded : IAuthMiddlewareData;
      try {
        decoded = jwt.verify(token, envVars.jwt.secret) as IAuthMiddlewareData;
      } catch {
        logger.info("Invalid or expired refresh token.", { token });
        return res.status(UNAUTHORIZED).json(failure({
          message: "Invalid or expired refresh token.",
          errors: {}
        }));
      }
      const user : IUser | null = await UserService.singleByField({ email: decoded.email });

      if(!user) {
        logger.info("Invalid or expired refresh token.", { token });
        return res.status(UNAUTHORIZED).json(failure({
          message: "Invalid or expired refresh token.",
          errors: {}
        }));
      }

      const loginInfo = await SecurityService.singleByField({ userCustomID: user.customID });
      if (!loginInfo || loginInfo.refreshToken !== token) {
        logger.info("No valid session found.", { user: user.customID });
        return res.status(UNAUTHORIZED).json(failure({
          message: "No valid session found.",
          errors: {}
        }));
      }

      const now = moment();
      const exp = moment(loginInfo.refreshTokenExpiresAt);
      if (now.isAfter(exp)) {
        logger.info("Refresh token expired.", { user: user.customID });
        return res.status(UNAUTHORIZED).json(failure({
          message: "Refresh token expired.",
          errors: {}
        }));
      }

      const newToken = jwt.sign(
        { email: user.email, name: user.name, role: user.role },
        envVars.jwt.secret,
        { expiresIn: envVars.jwt.exp }
      );

      await SecurityService.update({ userCustomID: user.customID }, { accessToken: newToken });
      logger.info("New access token generated.", { user: user.customID });
      return res.status(OK).json(success("New access token generated", { token: newToken }));
    } catch (error : unknown) {
      logger.info("Error in refreshing token.", { error });
      return res.status(INTERNAL_SERVER_ERROR).json(failure({
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors: error
      }));
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const user : IUser | null = await UserService.singleByField({ email: req.token?.email });

      if(!user) {
        logger.info("Invalid or expired access token.", { token: req.token });
        return res.status(UNAUTHORIZED).json(failure({
          message: "Invalid or expired access token.",
          errors: {}
        }));
      }

      const loginInfo : ISecurity | null = await SecurityService.singleByField({
        userCustomID: user.customID
      });
      if (!loginInfo) {
        logger.info("No active session found.", { user: user.customID });
        return res.status(UNAUTHORIZED).json(failure({
          message: "No active session found.",
          errors: {}
        }));
      }

      await SecurityService.destroy({ userCustomID: user.customID });
      logger.info("User logged out successfully.", { user: user.customID });
      return res.status(OK).json(success("Logged out successfully", {}));
    } catch (error : unknown) {
      logger.info("Error in logging out user.", { error });
      return res.status(INTERNAL_SERVER_ERROR).json(failure({
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors: error
      }));
    }
  }

  async resetPasswordEmail(req: Request, res: Response) {
    try {
      const { email } : IResetPasswordEmailRequest = req.body as IResetPasswordEmailRequest;

      // Validate email field
      const validation : IValidation = await AuthValidator.validate(
        req.body as Record<string, unknown>,
        ValidationType.CUSTOM,
        {email: 'required|email'}
      );
      if (validation.hasError) {
        logger.warn("Validation failed during add operation", { errors: validation.errors });
        return res.status(BAD_REQUEST).json(failure({
          message: ErrorMessage.HTTP_BAD_REQUEST,
          errors: validation.errors,
        }));
      }

      // Check if user exists by email
      const user : IUser | null = await UserService.singleByField({ email });
      if (!user) {
        logger.info("User with this email address does not exist.", { email });
        return res.status(UNPROCESSABLE_ENTITY).json(failure({
          message: "User with this email address does not exist.",
          errors: {}
        }));
      }

      // Generate a 6-digit verification code
      const verificationCode : string = Math.floor(100000 + Math.random() * 900000).toString();

      // Save verification code with expiration (10 minutes)
      await VerificationService.add({
        userCustomID: user.customID,
        code: verificationCode,
        expiresAt: moment().add(10, 'minutes').toDate()
      });

      // Send verification email
      const subject = "Password Reset Verification Code";
      const html : string = template(verificationCode);
      await mailer.mail(email, subject, html);
      logger.info("Verification code sent to email.", { email });
      return res
        .status(OK)
        .json(success("Verification code sent to email", {}));
    } catch (error : unknown) {
      logger.error("Error in sending reset password email.", { error });
      return res.status(INTERNAL_SERVER_ERROR).json(failure({
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors: error
      }));
    }
  }

  async reset(req: Request, res: Response) {
    try {
      const {
        code,
        email,
        password
      } : Partial<IResetPasswordRequest> = req.body as IResetPasswordRequest;

      // Validate input fields
      const validation = await AuthValidator.validate(
        req.body as Record<string, unknown>,
        ValidationType.CUSTOM,
        {
          code: 'required|string',
          email: 'required|email',
          password: 'required|min:8|confirmed',
        });
      if (validation.hasError) {
        logger.warn("Validation failed during add operation", { errors: validation.errors });
        return res.status(BAD_REQUEST).json(failure({
          message: ErrorMessage.HTTP_BAD_REQUEST,
          errors: validation.errors,
        }));
      }

      // Fetch user by email
      const user : IUser | null = await UserService.singleByField({ email });
      if (!user) {
        logger.info("User not found during password reset.", { email });
        return res.status(UNPROCESSABLE_ENTITY).json(failure({
          message: "User not found",
          errors: {}
        }));
      }

      // Verify the code and check expiration
      const verification = await VerificationService.singleByField({ 
        userCustomID: user.customID, code 
      });
      if (!verification || moment().isAfter(moment(verification.expiresAt))) {
        logger.info("Invalid or expired verification code.", { email });
        return res.status(BAD_REQUEST).json(failure({
          message: "Invalid or expired verification code.",
          errors: {}
        }));
      }

      // Prevent reuse of the same password
      const isSamePassword = bcrypt.compareSync(password, user.password);
      if (isSamePassword) {
        logger.info("The new password cannot be the same as the old password.", { email });
        return res.status(BAD_REQUEST).json(failure({
          message: "The new password cannot be the same as the old password.",
          errors: {}
        }));
      }

      // Update user's password
      await UserService.update({ email }, { password: bcrypt.hashSync(password, 10) });
      logger.info("Password reset successful.", { email });
      return res.status(OK).json(success("Password reset successful.", {}));
    } catch (error : unknown) {
      logger.error("Error resetting password:", error);
      return res.status(INTERNAL_SERVER_ERROR).json(failure({
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors: error
      }));
    }
  }
}

export default new AuthController();
