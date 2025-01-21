import { injectable, inject } from "tsyringe";
import { UserRoleRepository } from "../repositories/userRole.repository";
import Role from "../models/role.model";

@injectable()
export class UserRoleService {

    constructor(@inject(UserRoleRepository) private userRoleRepository: UserRoleRepository) {}

    async createUserRole(userRoleData: Partial<Role>): Promise<Role> {
        return await this.userRoleRepository.createUserRole(userRoleData);
    }

    async getAllUserRoles(): Promise<Role[]> {
        return await this.userRoleRepository.getAllUserRoles();
    }
    
    async findUserRoleById(userId: number): Promise<Role | null> {
        return await this.userRoleRepository.findUserRoleById(userId);
    }
    
    async updateUserRole(userId: number, updateData: Partial<Role>): Promise<Role | null> {
        return await this.userRoleRepository.updateUserRole(userId, updateData);
    }
    
    async deleteUserRole(userId: number): Promise<boolean> {
        return await this.userRoleRepository.deleteUserRole(userId);
    }
}