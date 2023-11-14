import { Container, Service } from "typedi";
import { IUserSignupFieldDetails, IUserSignupResponse } from "./IUser";
import { IUserSchema } from "../../models/Schemas/user";
import mongoose, { Model } from "mongoose";
import * as crypto from "crypto-js";
import config from "../../config";
import * as jwt from "jsonwebtoken";

@Service()
export class UserService {
  private userSchema: Model<IUserSchema & mongoose.Document> =
    Container.get("UserSchema");
  async signup(
    userDetails: IUserSignupFieldDetails,
  ): Promise<IUserSignupResponse> {
    //field validations

    const existingUser: IUserSchema | null = await this.getUserByEmail(
      userDetails.email,
    );
    if (existingUser) {
      throw new Error(UserServiceErrors.USER_ALREADY_EXISTS);
    }

    const securePassword = this.generateSecurePassword(userDetails.password);
    const user: IUserSchema = await this.createUser(
      userDetails.email,
      securePassword,
    );

    const token: string = this.generateToken(user);

    return { user: user.id, token: token };
  }

  private getUserByEmail(email: string) {
    return this.userSchema.findOne({ email: email });
  }

  private generateSecurePassword(password: string) {
    return crypto.AES.encrypt(password, config.passwordSecretKey).toString();
  }

  private createUser(email: string, securePassword: string) {
    return this.userSchema.create({ email: email, password: securePassword });
  }

  private generateToken(user: IUserSchema) {
    return jwt.sign(
      { id: user._id, email: user.email },
      config.tokenSecretKey,
      { expiresIn: "30d" },
    );
  }
}

export enum UserServiceErrors {
  USER_ALREADY_EXISTS = "User Already Exists",
}
