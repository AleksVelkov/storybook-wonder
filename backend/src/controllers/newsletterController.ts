import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { NewsletterService } from '../services/newsletterService.js';

const newsletterService = new NewsletterService();

export class NewsletterController {
  async subscribe(req: Request, res: Response) {
    try {
      const subscription = await newsletterService.subscribe(req.body);
      res.status(201).json({
        message: 'Successfully subscribed to newsletter',
        subscription: {
          email: subscription.email,
          subscribed_at: subscription.subscribed_at
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async unsubscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await newsletterService.unsubscribe(email);
      res.json({
        message: 'Successfully unsubscribed from newsletter'
      });
    } catch (error) {
      throw error;
    }
  }

  async getAllSubscriptions(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const subscribedParam = req.query.subscribed as string;
      const subscribed = subscribedParam !== undefined ? subscribedParam === 'true' : undefined;

      const result = await newsletterService.getAllSubscriptions(page, limit, subscribed);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await newsletterService.getStats();
      res.json(stats);
    } catch (error) {
      throw error;
    }
  }

  async deleteSubscription(req: AuthRequest, res: Response) {
    try {
      const { email } = req.params;
      await newsletterService.deleteSubscription(email);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  async syncWithBrevo(req: AuthRequest, res: Response) {
    try {
      const result = await newsletterService.syncWithBrevo();
      res.json({
        message: 'Sync completed',
        ...result
      });
    } catch (error) {
      throw error;
    }
  }
}


