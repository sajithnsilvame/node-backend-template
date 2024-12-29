import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { AuthRepository } from "../repositories/auth.repository";
import { add } from 'date-fns';
import { injectable } from "tsyringe";



@injectable()
export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(email: string, password: string): Promise<{ token: string; user: { id: number; firstName: string; lastName: string; email: string; username: string; mobile: string; roleId: number } }> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email });
    
    // Create session with 1 hour expiry
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
        roleId: user.roleId
      },
    };
  }

  async logout(token: string): Promise<void> {
    const isInvalidated = await this.authRepository.invalidateUserSession(token);
    if (!isInvalidated) {
      throw new Error('Token is already invalid or does not exist');
    }
  }

  async getAuthUserDetails(userId: number): Promise<any> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
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
}): Promise<any> {
  
  const updatedUser = await this.authRepository.updateUser(userId, updateData);
  if (!updatedUser) {
    throw new Error("User not found");
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

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    // Validate current password
    const isValid = await this.authRepository.validatePassword(userId, currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const updated = await this.authRepository.updateUserPassword(userId, hashedPassword);
    if (!updated) {
      throw new Error('Failed to update password');
    }

    // Invalidate all sessions
    await this.authRepository.invalidateAllUserSessions(userId);
    
    return true;
  }

  async logoutAllSessions(userId: number): Promise<void> {
    await this.authRepository.invalidateAllUserSessions(userId);
  }
}