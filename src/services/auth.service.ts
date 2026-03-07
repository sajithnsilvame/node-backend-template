import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { AuthRepository } from "../repositories/auth.repository";
import { add } from 'date-fns';
import { injectable, inject } from "tsyringe";
import { AppError } from "../utils/errors/AppError";
import { ConflictError, NotFoundError } from "../utils/errors/customErrors";
import { UserDTO } from "../types";
import config from "../config/application.config";

@injectable()
export class AuthService {

  constructor(@inject(AuthRepository) private authRepository: AuthRepository) {}

  async register(
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    password: string,
    mobile: string
  ): Promise<UserDTO> {
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.authRepository.createUser({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      mobile,
      roleId: config.app.defaultRoleId,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      mobile: user.mobile,
      roleId: user.roleId,
    };
  }

  async login(email: string, password: string): Promise<{ token: string; user: UserDTO }> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = generateToken({ id: user.id, email: user.email });
    const expiresAt = add(new Date(), { hours: 1 });
    await this.authRepository.createUserSession(user.id, token, expiresAt);

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        mobile: user.mobile,
        roleId: user.roleId,
      },
    };
  }

  async logout(token: string): Promise<void> {
    const isInvalidated = await this.authRepository.invalidateUserSession(token);
    if (!isInvalidated) {
      throw new AppError(400, 'Token is already invalid or does not exist');
    }
  }

  async getAuthUserDetails(userId: number): Promise<UserDTO> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      email: user.email,
      username: user.username,
      roleId: user.roleId,
    };
  }

  async updateUserDetails(userId: number, updateData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    mobile?: string;
    email?: string;
  }): Promise<UserDTO> {
    const updatedUser = await this.authRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      username: updatedUser.username,
      mobile: updatedUser.mobile,
      roleId: updatedUser.roleId,
    };
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const isValid = await this.authRepository.validatePassword(userId, currentPassword);
    if (!isValid) {
      throw new AppError(400, 'Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.authRepository.resetPasswordAndSessions(userId, hashedPassword);
  }

  async logoutAllSessions(userId: number): Promise<void> {
    await this.authRepository.invalidateAllUserSessions(userId);
  }
}
