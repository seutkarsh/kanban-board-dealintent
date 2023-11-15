import { Service } from "typedi";
import * as jwt from "jsonwebtoken";
import config from "../../config";
import { AuthorizedPayload } from "./authorizedPayload";

@Service()
export class AuthorizationService {
  verifyToken(accessToken: string) {
    const jwtPayload = jwt.verify(accessToken, config.tokenSecretKey);
    if (typeof jwtPayload === "string") throw new Error(jwtPayload);
    const authPayload = jwtPayload as AuthorizedPayload;

    return { id: authPayload.id, email: authPayload.email };
  }
}
