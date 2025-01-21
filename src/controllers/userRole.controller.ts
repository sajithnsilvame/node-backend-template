import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import { UserRoleService } from "../services/userRole.service";
import { APIResponse } from "../types";
import { AppError } from "../utils/AppError";


@injectable()
export class UserRoleController  {
    constructor(@inject(UserRoleService) private userRoleService: UserRoleService) {}

    async createUserRole(req: Request, res: Response): Promise<void> {
        try {
            const newUserRole = await this.userRoleService.createUserRole(req.body);
            const response : APIResponse<typeof newUserRole> = {status: true, message: "User role created successfully"};
            res.status(201).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response); 
        }
    }

    async getAllUserRoles(req: Request, res: Response): Promise<void> {
        try {
            const userRoles = await this.userRoleService.getAllUserRoles();
            const response: APIResponse<typeof userRoles> = { status: true, data: userRoles };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }

    async getUserRoleById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            console.log(id);
            // Validate the ID
            if (isNaN(Number(id))) {
                return next(new AppError(400, 'Invalid ID format'));
            }

            const userRole = await this.userRoleService.findUserRoleById(Number(id));
            if (!userRole) {
                return next(new AppError(404, 'User role found'));
            }

            const response: APIResponse<typeof userRole> = { status: true, data: userRole };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }

    async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Validate the ID
            if (isNaN(Number(id))) {
                return next(new AppError(400, 'Invalid ID format'));
            }

            const userRole = await this.userRoleService.updateUserRole(Number(id), req.body);
            if (!userRole) {
                return next(new AppError(404, 'User role not found'));
            }

            const response: APIResponse<typeof userRole> = { status: true, data: userRole };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }

    async deleteUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Validate the ID
            if (isNaN(Number(id))) {
                return next(new AppError(400, 'Invalid ID format'));
            }

            const isDeleted = await this.userRoleService.deleteUserRole(Number(id));
            if (!isDeleted) {
                return next(new AppError(404, 'User role not found'));
            }

            const response: APIResponse<null> = { status: true, message: 'User role deleted successfully' };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }
}