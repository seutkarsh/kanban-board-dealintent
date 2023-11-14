import mongoose from "mongoose";
import UserSchema from "./Schemas/user";

export const models: Array<{
  name: string;
  model: mongoose.Model<mongoose.Document>;
}> = [UserSchema];
