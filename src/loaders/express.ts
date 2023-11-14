import { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import Router from "../api/index";

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

  //Router Groups
  expressApp.use(Router());
};
