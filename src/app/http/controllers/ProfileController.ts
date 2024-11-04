// import { Request, Response } from 'express';
// import { StatusCodes } from 'http-status-codes';
// import ErrorMessage from "@shared/errorMessage"; // Error Messages for response
// import logger from "@util/logger"; // Logger
import Controller from "@controllers/Controller"; // Base Controller
import ProfileValidator from "@http/validators/ProfileValidator"; // Import Validator
import ProfileService from "@services/ProfileService"; // Import Service
import {IProfile} from "@models/Profile";

// const {
//    INTERNAL_SERVER_ERROR,
//    BAD_REQUEST,
//    UNPROCESSABLE_ENTITY,
//    OK
// } = StatusCodes; // HTTP Status Codes

class ProfileController extends Controller<IProfile> {
  constructor() {
    super(ProfileService, ProfileValidator);
  }
  // Add custom methods here
}

export default new ProfileController();
