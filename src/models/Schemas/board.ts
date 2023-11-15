import mongoose, { Connection, Document } from "mongoose";
import { Container } from "typedi";

const BoardSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: String,
  team: { type: String, require: true },
  creator: { type: String, require: true },
  toDoColumn: Array(String),
  inProgressColumn: Array(String),
  completedColumn: Array(String),
});

export interface IBoardSchema extends Document {
  name: string;
  description: string;
  team: string;
  creator: string;
  toDoColumn: string[];
  inProgressColumn: string[];
  completedColumn: string[];
}

export default {
  name: "BoardSchema",
  model: Container.get<Connection>(
    "mongoDBConnection",
  ).model<mongoose.Document>("BoardSchema", BoardSchema, "boards"),
};
