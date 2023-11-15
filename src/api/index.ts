import { Router } from "express";
import user from "./routes/user";
import team from "./routes/team"
export default (): Router => {
    const expressRouter = Router();

    //route groups
    user(expressRouter);
    team(expressRouter);
    return expressRouter;
};
