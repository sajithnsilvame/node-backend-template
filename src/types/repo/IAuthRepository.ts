import User from "../../models/user.model";
import UserLoginSession from "../../models/userLoginSession.model";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  createUser(user: Partial<User>): Promise<User>;
  findUserById(userId: number): Promise<User | null>;
  updateUser(userId: number, updateData: Partial<User>): Promise<User | null>;
  updateUserPassword(userId: number, newPassword: string): Promise<boolean>;
  invalidateUserSession(token: string): Promise<boolean>;
  invalidateAllUserSessions(userId: number): Promise<boolean>;
  validatePassword(userId: number, currentPassword: string): Promise<boolean>;
  createUserSession(userId: number, token: string, expiresAt: Date): Promise<UserLoginSession>;
  isTokenValid(token: string): Promise<boolean>;
}
