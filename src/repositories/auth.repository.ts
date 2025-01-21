import Role from "../models/role.model";
import { User } from "../models/user.model";
import { UserLoginSession } from "../models/userLoginSession.model";
import { IAuthRepository } from "../types/repo/IAuthRepository";
import { Op } from "sequelize";
import bcrypt from 'bcryptjs';


export class AuthRepository implements IAuthRepository {

  
  /**
   * Function: Create a new user
   * @param userData 
   * @returns 
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    mobile: string;
    roleId: number;
  }): Promise<User> {
    return await User.create(userData);
  }
  
  async findUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async findUserById(userId: number): Promise<User | null> {
    return await User.findOne({
      where: { id: userId },
      include: [{
        model: Role,
        attributes: ['role_name']
      }],
      attributes: { exclude: ['password'] } // Exclude password from response
    });
  }

  async updateUser(userId: number, updateData: Partial<User>): Promise<User | null> {
  const user = await User.findByPk(userId);
  if (!user) return null;

  await user.update(updateData);
  
  // Fetch updated user with role info but exclude password
  const updatedUser = await User.findOne({
    where: { id: userId },
    include: [{
      model: Role,
      attributes: ['role_name']
    }],
    attributes: { exclude: ['password'] }
  });

  return updatedUser;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<boolean> {
  const user = await User.findByPk(userId);
  if (!user) return false;

  await user.update({ password: newPassword });
  return true;
  }

  async validatePassword(userId: number, currentPassword: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) return false;
    
    return await bcrypt.compare(currentPassword, user.password);
  }

  async createUserSession(userId: number, token: string, expiresAt: Date): Promise<UserLoginSession> {
  await UserLoginSession.update(
    { isValid: false },
    { where: { userId, isValid: true } }
  );

  return await UserLoginSession.create({
    userId,
    token,
    expiresAt,
  });
  }

  async invalidateUserSession(token: string): Promise<boolean> {
  const session = await UserLoginSession.findOne({ where: { token, isValid: true } });
  if (session) {
    await session.update({ isValid: false });
    return true;
  }
  return false;
  }

  async invalidateAllUserSessions(userId: number): Promise<boolean> {
    await UserLoginSession.update(
      { isValid: false },
      { where: { userId, isValid: true } }
    );
    return true;
  }

  async isTokenValid(token: string): Promise<boolean> {
  const session = await UserLoginSession.findOne({
    where: {
      token,
      isValid: true,
      expiresAt: {
        [Op.gt]: new Date(),
      },
    },
  });
  return !!session;
  }
}