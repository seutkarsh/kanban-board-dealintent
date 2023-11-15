import { Request, Response, Router } from "express";
import Logger from "../../loaders/logger";
import { Container } from "typedi";
import { UserService } from "../../services/UserService/UserService";
import {
  IUserLoginFieldDetails,
  IUserSignupFieldDetails,
  IUserSignupLoginResponse,
} from "../../services/UserService/IUser";
import { ResponseWrapper } from "../responses/responseWrapper";

export default (router: Router): void => {
  const userService = Container.get(UserService);
  router.post("/signup", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<IUserSignupLoginResponse>();
    try {
      const userDetails: IUserSignupFieldDetails = {
        email: req.body.email,
        password: req.body.password,
      };
      const data: IUserSignupLoginResponse =
        await userService.signup(userDetails);
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });

  router.post("/login", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<IUserSignupLoginResponse>();
    try {
      const userDetails: IUserLoginFieldDetails = {
        email: req.body.email,
        password: req.body.password,
      };

      const data: IUserSignupLoginResponse =
        await userService.login(userDetails);
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });
};
