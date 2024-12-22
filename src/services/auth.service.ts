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

  async login(email: string, password: string): Promise<{ token: string; user: { id: number; email: string; username: string; } }> {
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
        email: user.email,
        username: user.username,
      },
    };
  }

  async logout(token: string): Promise<void> {
  const isInvalidated = await this.authRepository.invalidateUserSession(token);
  if (!isInvalidated) {
    throw new Error('Token is already invalid or does not exist');
  }
}

  async logoutAllSessions(userId: number): Promise<void> {
    await this.authRepository.invalidateAllUserSessions(userId);
  }
}