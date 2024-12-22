import { User } from "../models/user.model";
import { UserLoginSession } from "../models/userLoginSession.model";
import { IAuthRepository } from "../types/repo/IAuthRepository";
import { Op } from "sequelize";
export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
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