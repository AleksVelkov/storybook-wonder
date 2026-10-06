import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { OrderService } from '../services/orderService.js';
import { OrderStatus } from '../types/index.js';

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const orderData = {
        ...req.body,
        user_id: req.user.id
      };

      const order = await orderService.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user?.id;
      const isAdmin = req.user?.is_admin || false;

      const order = await orderService.getOrderById(orderId, userId, isAdmin);
      res.json(order);
    } catch (error) {
      throw error;
    }
  }

  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as OrderStatus;
      const userId = req.user?.id;
      const isAdmin = req.user?.is_admin || false;

      const result = await orderService.getAllOrders(page, limit, status, userId, isAdmin);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await orderService.getUserOrders(req.user.id, page, limit);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const orderId = parseInt(req.params.id);
      const order = await orderService.updateOrderStatus(orderId, req.body);
      res.json(order);
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user?.id;
      const isAdmin = req.user?.is_admin || false;

      const order = await orderService.cancelOrder(orderId, userId, isAdmin);
      res.json(order);
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(req: AuthRequest, res: Response) {
    try {
      const orderId = parseInt(req.params.id);
      await orderService.deleteOrder(orderId);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  async getOrderStats(req: AuthRequest, res: Response) {
    try {
      const stats = await orderService.getOrderStats();
      res.json(stats);
    } catch (error) {
      throw error;
    }
  }
}


