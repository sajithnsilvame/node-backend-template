import { Request } from "express";
import { verifyToken } from "../utils/jwt";
import { AuthService } from "../services/auth.service";
import { UnauthorizedError } from "./errors/customErrors";
import { injectable, inject } from "tsyringe";


@injectable()
export class AuthHelper {
    constructor( @inject(AuthService) private authService: AuthService ) {}
  async Auth(req: Request) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedError("No token provided");
      }

      // Extract the token
      const token = authHeader.split(" ")[1];
      const decoded: any = verifyToken(token); // Decode token



      // Retrieve authenticated user details
      const authUser = await this.authService.getAuthUserDetails(decoded.id);

      if (!authUser) {
        throw new UnauthorizedError("User not found");
      }

      return authUser; // Return the authenticated user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unauthorized";
      throw new UnauthorizedError(errorMessage);
    }
  }
}
