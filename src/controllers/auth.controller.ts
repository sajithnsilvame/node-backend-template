import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import Logger from "../utils/logger";
import { injectable, inject } from "tsyringe";


interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    username: string;
  };
}
@injectable()
export class AuthController {
  constructor(
      @inject(AuthService) private authService: AuthService // Injected dependency
    ) {}

  async login(req: Request, res: Response): Promise<void> {
    Logger.info(`Received login request from IP: ${req.ip}, Payload: ${JSON.stringify(req.body)}`);
    
    try {
      const { email, password } = req.body;
      const { token, user } = await this.authService.login(email, password);

      Logger.info(`Login successful for user: ${user.email}`);
      res.status(200).json({
        success: true,
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      Logger.error(`Login failed for IP: ${req.ip}, Error: ${errorMessage}`);
      res.status(401).json({ success: false, message: errorMessage });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
  Logger.info(`Received logout request from IP: ${req.ip}`);
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await this.authService.logout(token);
    Logger.info(`Logout successful for token: ${token}`);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    Logger.error(`Logout failed: ${error.message}`);
    res.status(400).json({ success: false, message: error.message });
  }
  }


  async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    Logger.info(`Received logout all devices request from IP: ${req.ip}`);
    
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, message: "User not authenticated" });
        return;
      }

      await this.authService.logoutAllSessions(req.user.id);
      Logger.info(`Logout all devices successful for user ID: ${req.user.id}`);
      res.status(200).json({ success: true, message: "Logged out from all devices successfully" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      Logger.error(`Logout all devices failed: ${errorMessage}`);
      res.status(500).json({ success: false, message: errorMessage });
    }
  }

  async getAuthUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = await this.authService.getAuthUserDetails(req.user!.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    Logger.error(`Failed to get auth user details: ${errorMessage}`);
    res.status(400).json({ success: false, message: errorMessage });
  }
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const updateData = req.body;
      
      const updatedUser = await this.authService.updateUserDetails(userId, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "User updated successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      Logger.error(`Failed to update user: ${errorMessage}`);
      res.status(400).json({ success: false, message: errorMessage });
    }
  }

  async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      await this.authService.updatePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: "Password updated successfully. Please login again."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      Logger.error(`Failed to update password: ${errorMessage}`);
      res.status(400).json({ 
        success: false, 
        message: errorMessage 
      });
    }
  }

}

export default AuthController;
