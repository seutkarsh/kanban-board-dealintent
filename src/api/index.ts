import { Router } from "express";
import user from "./routes/user";
export default (): Router => {
    const expressRouter = Router();

    //route groups
    user(expressRouter);
    return expressRouter;
};
