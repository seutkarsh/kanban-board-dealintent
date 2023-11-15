import { Router } from "express";
import user from "./routes/user";
import team from "./routes/team"
import board from "./routes/board"
export default (): Router => {
    const expressRouter = Router();

    //route groups
    user(expressRouter);
    team(expressRouter);
    board(expressRouter);
    return expressRouter;
};
