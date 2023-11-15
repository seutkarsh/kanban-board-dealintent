import mongoose, { Connection, Document } from "mongoose";
import { Container } from "typedi";

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  description: String,
  team: { type: String, require: true },
  board: { type: String, require: true },
  creator: { type: String, require: true },
  priority: { type: String, require: true },
  status: { type: String, require: true },
  dueDate: { type: Date, require: false, default: null },
});

export interface ITaskSchema extends Document {
  name: string;
  description: string;
  board:string;
  team: string;
  creator: string;
  priority:string;
  status:string;
  dueDate?:Date
}

export default {
  name: "TaskSchema",
  model: Container.get<Connection>(
    "mongoDBConnection",
  ).model<mongoose.Document>("TaskSchema", TaskSchema, "tasks"),
};
