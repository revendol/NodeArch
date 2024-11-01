import Service from "@services/Service";
import UserRepo from "@repos/UserRepo";
import { IUser } from "@models/User";
import { FilterQuery } from "mongoose";
import logger from "@util/logger";

class UserService extends Service<IUser> {
  constructor() {
    super(UserRepo);
  }

  async changePassword(email: string, oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      return UserRepo.updatePassword(email, oldPassword, newPassword);
    } catch (error) {
      logger.error('Error during changing password', error);
      return false;
    }
  }

  async singleByFieldWithPassword(query: FilterQuery<IUser>): Promise<IUser | null> {
    return UserRepo.singleByFieldWithPassword(query);
  }
}

export default new UserService();
