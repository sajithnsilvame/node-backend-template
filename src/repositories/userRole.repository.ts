import Role from "../models/role.model";
import { IUserRoleRepository } from "../types/repo/IUserRoleRepository";

export class UserRoleRepository implements IUserRoleRepository {

    async createUserRole(userRoleData: Partial<Role>): Promise<Role> {
        return await Role.create(userRoleData);
    }

    async getAllUserRoles(): Promise<Role[]> {
        return await Role.findAll();
    }

    async findUserRoleById(userId: number): Promise<Role | null> {
        return await Role.findByPk(userId);
    }

    async updateUserRole(userId: number, updateData: Partial<Role>): Promise<Role | null> {
        const userRole = await this.findUserRoleById(userId);
        if (!userRole) return null;
        return await userRole.update(updateData);
         
    }   

    async deleteUserRole(userId: number): Promise<boolean> {
        const userRole = await this.findUserRoleById(userId);
        if (!userRole) return false;
        await userRole.destroy();
        return true;
    }
}