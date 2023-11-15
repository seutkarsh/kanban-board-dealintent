import mongoose from "mongoose";
import UserSchema from "./Schemas/user";
import TeamSchema from "./Schemas/team"

export const models: Array<{
  name: string;
  model: mongoose.Model<mongoose.Document>;
}> = [UserSchema,TeamSchema];
