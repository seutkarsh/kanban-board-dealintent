import { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import Router from "../api/index";
import Logger from "./logger";
import { authentication } from "../api/middlewares/authentication";

export default (expressApp: Application): void => {
  expressApp.get("/whoAmI", (req: Request, res: Response) => {
    res.send("Kanban Board - API").status(200).end();
  });

  expressApp.head("/whoAmI", (req: Request, res: Response) => {
    res.status(200).end();
  });

  expressApp.get("/health", (req: Request, res: Response) => {
    res.send("Healthy").status(200).end();
  });

  expressApp.head("/health", (req: Request, res: Response) => {
    res.status(200).end();
  });

  //Body Parser
  expressApp.use(bodyParser.json({ limit: "5mb" }));
  expressApp.use(bodyParser.urlencoded({ extended: true }));

  expressApp.use(authentication);
  //Router Groups
  expressApp.use(Router());

  expressApp.use(
    (
      err: ErrorWithStatus | Error,
      req: Request,
      res: Response,
      next: () => void,
    ) => {
      try {
        if (err.name === "UnauthorizedError") {
          return res.status(401).send({ message: err.message }).end();
        }
        if (err instanceof ErrorWithStatus) {
          res.status(err.status || 500);
        } else {
          res.status(500);
        }
        res.json();
      } catch (e) {
        Logger.error(e);
      }
      next();
    },
  );
};

class ErrorWithStatus extends Error {
  constructor(
    public status: number,
    name: string,
  ) {
    super(name);
  }
}
