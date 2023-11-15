import mongoose, { Connection,Document } from "mongoose";
import { Container } from "typedi";

const TeamSchema = new mongoose.Schema({
    name:{
        type:String,require:true
    },
    description:String,
    creator:{type:String,
    require: true},
    members:Array(Object),
    boards:Array(String)
});

export interface ITeamSchema extends Document{
    name:string,
    description:string,
    creator:string,
    members:ITeamMember[],
    boards:string[]
}

export interface ITeamMember{
    userId:string,
    role:string
}

export default {
    name: "TeamSchema",
    model: Container.get<Connection>(
        "mongoDBConnection",
    ).model<mongoose.Document>("TeamSchema", TeamSchema, "teams"),
};
