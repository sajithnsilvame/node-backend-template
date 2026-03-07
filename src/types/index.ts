import { Request } from 'express';

export interface APIResponse<T> {
  status: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}

/** Shape of the authenticated user attached to req.user by the auth middleware */
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  roleId: number;
  roleName: string;
}

/** Standard user data transfer object returned from service methods */
export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  mobile: string;
  roleId: number;
}

/** Express Request extended with the authenticated user */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}