import mongoose from "mongoose";


export const models: Array<{
    name: string;
    model: mongoose.Model<mongoose.Document>;
}> = [];
