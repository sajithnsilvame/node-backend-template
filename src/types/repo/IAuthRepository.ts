import User from "../../models/user.model";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  // createUser(user: Partial<User>): Promise<User>;
}
