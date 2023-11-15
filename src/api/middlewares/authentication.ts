import { Request, Response } from "express";
import _ from "lodash";
import Logger from "../../loaders/logger";
import { Container } from "typedi";
import { AuthorizationService } from "../../services/Authorization Service/AuthorizationService";
import { UnauthorizedError } from "./authorization";
export const authentication = async (
  req: Request,
  res: Response,
  next: CallableFunction,
) => {
  const auth: string[] = req.headers?.authorization?.split(" ") || ["", ""];
  const authType: string = auth[0];
  const accessToken: string = auth[1];

  if (_.isEmpty(authType) || authType.toString().toLowerCase() != "bearer") {
    Logger.info("No Auth Mechanism found");
  } else if (_.isEmpty(accessToken)) {
    Logger.info("No Access Token Found");
  } else {
    try {
      const authenticationService = Container.get(AuthorizationService);
      const userData = authenticationService.verifyToken(accessToken);
      req.user = userData;
    } catch (e) {
      Logger.error(e);
      return next(
        new UnauthorizedError(
          new Error(`Unauthorized Access: Auth Token ${e}`),
        ),
      );
    }
  }
  return next();
};
