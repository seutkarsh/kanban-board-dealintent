import mongoose, { Connection,Document } from "mongoose";
import { Container } from "typedi";

const UserSchema = new mongoose.Schema({
  email: {
    require: true,
    type: String,
    unique: true,
  },
  password: {
    require: true,
    type: String,
  },
  team: Array(String),
});

export interface IUserSchema extends Document{
  email: string;
  password: string;
  team: string[];
}

export default {
  name: "UserSchema",
  model: Container.get<Connection>(
    "mongoDBConnection",
  ).model<mongoose.Document>("UserSchema", UserSchema, "users"),
};
