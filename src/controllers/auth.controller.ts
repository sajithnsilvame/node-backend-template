import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import Logger from "../utils/logger";
import { injectable, inject } from "tsyringe";
import { AuthenticatedRequest } from "../types";
import { successResponse, messageResponse } from "../utils/response";

@injectable()
export class AuthController {

  constructor(@inject(AuthService) private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    Logger.info(`Received registration request from IP: ${req.ip}`);
    try {
      const { firstName, lastName, username, email, password, mobile } = req.body;
      const user = await this.authService.register(firstName, lastName, username, email, password, mobile);
      Logger.info(`Registration successful for user: ${user.email}`);
      successResponse(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    Logger.info(`Received login request from IP: ${req.ip}`);
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      Logger.info(`Login successful for user: ${result.user.email}`);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    Logger.info(`Received logout request from IP: ${req.ip}`);
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ status: false, message: 'Unauthorized', statusCode: 401, code: '005-401' });
        return;
      }
      await this.authService.logout(token);
      Logger.info(`Logout successful`);
      messageResponse(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    Logger.info(`Received logout all devices request from IP: ${req.ip}`);
    try {
      if (!req.user?.id) {
        res.status(401).json({ status: false, message: 'User not authenticated' });
        return;
      }
      await this.authService.logoutAllSessions(req.user.id);
      Logger.info(`Logout all devices successful for user ID: ${req.user.id}`);
      messageResponse(res, 'Logged out from all devices successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAuthUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.authService.getAuthUserDetails(req.user!.id);
      successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const updatedUser = await this.authService.updateUserDetails(req.user!.id, req.body);
      successResponse(res, updatedUser, 200, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await this.authService.updatePassword(req.user!.id, currentPassword, newPassword);
      messageResponse(res, 'Password updated successfully. Please login again.');
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
