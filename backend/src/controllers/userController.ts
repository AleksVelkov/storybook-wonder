import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { UserService } from '../services/userService.js';

const userService = new UserService();

export class UserController {
  async register(req: AuthRequest, res: Response) {
    try {
      const result = await userService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      throw error;
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userService.getUserById(req.user.id);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }

  async getUserById(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.getUserById(userId);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const result = await userService.getAllUsers(page, limit, search);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await userService.updateUser(req.user.id, req.body);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.updateUser(userId, req.body);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }

  async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.toggleUserStatus(userId);
      res.json(user);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      await userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}


