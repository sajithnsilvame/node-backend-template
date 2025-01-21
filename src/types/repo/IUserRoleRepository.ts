import Role from "../../models/role.model";


export interface IUserRoleRepository {
    createUserRole(user: Partial<Role>): Promise<Role>;
    getAllUserRoles(): Promise<Role[]>;
    findUserRoleById(userId: number): Promise<Role | null>;
    updateUserRole(userId: number, updateData: Partial<Role>): Promise<Role | null>;
    deleteUserRole(userId: number): Promise<boolean>;
}