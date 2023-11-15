export interface AuthorizedPayload {
  sub: string;
  id: string;
  email: string;
  iss: string;
  exp: number;
  iat: number;
  jti: string;
}
