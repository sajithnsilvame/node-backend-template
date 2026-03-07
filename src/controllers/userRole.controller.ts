import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import { UserRoleService } from "../services/userRole.service";
import { AppError } from "../utils/errors/AppError";
import { successResponse, messageResponse } from "../utils/response";

@injectable()
export class UserRoleController {
  constructor(@inject(UserRoleService) private userRoleService: UserRoleService) {}

  async createUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.userRoleService.createUserRole(req.body);
      messageResponse(res, 'User role created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getAllUserRoles(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userRoles = await this.userRoleService.getAllUserRoles();
      successResponse(res, userRoles);
    } catch (error) {
      next(error);
    }
  }

  async getUserRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (isNaN(Number(id))) {
        return next(new AppError(400, 'Invalid ID format'));
      }

      const userRole = await this.userRoleService.findUserRoleById(Number(id));
      if (!userRole) {
        return next(new AppError(404, 'User role not found'));
      }

      successResponse(res, userRole);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (isNaN(Number(id))) {
        return next(new AppError(400, 'Invalid ID format'));
      }

      const userRole = await this.userRoleService.updateUserRole(Number(id), req.body);
      if (!userRole) {
        return next(new AppError(404, 'User role not found'));
      }

      successResponse(res, userRole);
    } catch (error) {
      next(error);
    }
  }

  async deleteUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (isNaN(Number(id))) {
        return next(new AppError(400, 'Invalid ID format'));
      }

      const isDeleted = await this.userRoleService.deleteUserRole(Number(id));
      if (!isDeleted) {
        return next(new AppError(404, 'User role not found'));
      }

      messageResponse(res, 'User role deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
