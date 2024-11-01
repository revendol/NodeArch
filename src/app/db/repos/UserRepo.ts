import Repo from "./Repo";
import User, {IUser} from "../models/User";
import bcrypt from "bcryptjs";
import {FilterQuery} from "mongoose";

class UserRepo extends Repo<IUser> {
  constructor() {
    super(User);
  }

  // Helper function to hash passwords
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  // Helper function to compare passwords
  private async comparePasswords(inputPassword: string, storedPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  // Add a new user
  async addAndReturn(user: Partial<IUser>): Promise<IUser | null> {
    if (!user.password) {
      throw new Error("Password is required");
    }
    user.password = await this.hashPassword(user.password);
    return await User.create(user);
  }

  // Update user password
  async updatePassword(email: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.singleByFieldWithPassword({ email });
    if (!user || !user.password) {
      throw new Error("User not found or password is not set");
    }

    const isMatch = await this.comparePasswords(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password does not match");
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: { password: hashedNewPassword } },
      { new: true }
    ).exec();

    return !!updated;
  }

  // Fetch single user by query without password
  async singleByField(query: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne(query).select('-__v -_id -password').lean().exec();
  }

  // Fetch single user by query with password
  async singleByFieldWithPassword(query: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne(query).select('-__v -_id').lean().exec();
  }
}

export default new UserRepo();
