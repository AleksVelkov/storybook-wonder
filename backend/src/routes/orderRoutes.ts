import { Router, Response, NextFunction } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateId,
  validatePagination
} from '../middleware/validation.js';

const router = Router();
const orderController = new OrderController();

// Protected routes (require authentication)
router.post('/', authenticate, validateCreateOrder, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.createOrder(req, res).catch(next);
});

router.get('/my-orders', authenticate, validatePagination, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.getMyOrders(req, res).catch(next);
});

router.get('/:id', authenticate, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.getOrderById(req, res).catch(next);
});

router.patch('/:id/cancel', authenticate, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.cancelOrder(req, res).catch(next);
});

// Admin only routes
router.get('/', authenticate, requireAdmin, validatePagination, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.getAllOrders(req, res).catch(next);
});

router.patch('/:id/status', authenticate, requireAdmin, validateId, validateUpdateOrderStatus, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.updateOrderStatus(req, res).catch(next);
});

router.delete('/:id', authenticate, requireAdmin, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.deleteOrder(req, res).catch(next);
});

router.get('/stats/overview', authenticate, requireAdmin, (req: AuthRequest, res: Response, next: NextFunction) => {
  orderController.getOrderStats(req, res).catch(next);
});

export default router;

