import { Request, Response, Router } from "express";
import Logger from "../../loaders/logger";
import { Container } from "typedi";
import { UserService } from "../../services/UserService/UserService";
import {
  IUserSignupFieldDetails,
  IUserSignupResponse,
} from "../../services/UserService/IUser";
import { ResponseWrapper } from "../responses/responseWrapper";

export default (router: Router): void => {
  const userService = Container.get(UserService);
  router.post("/signup", async (req: Request, res: Response) => {
    const response = new ResponseWrapper<IUserSignupResponse>();
    try {
      const userDetails: IUserSignupFieldDetails = {
        email: req.body.email,
        password: req.body.password,
      };
      const data: IUserSignupResponse = await userService.signup(userDetails);
      response.setData(data);
    } catch (e) {
      Logger.error(e.message);
      response.setError(e.message);
    }
    res.json(response);
  });
};
