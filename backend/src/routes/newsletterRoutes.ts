import { Router, Request, Response, NextFunction } from 'express';
import { NewsletterController } from '../controllers/newsletterController.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate, validatePagination } from '../middleware/validation.js';

const router = Router();
const newsletterController = new NewsletterController();

const validateSubscribe = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  validate
];

const validateUnsubscribe = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  validate
];

const validateEmail = [
  param('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  validate
];

// Public routes
router.post('/subscribe', validateSubscribe, (req: Request, res: Response, next: NextFunction) => {
  newsletterController.subscribe(req, res).catch(next);
});

router.post('/unsubscribe', validateUnsubscribe, (req: Request, res: Response, next: NextFunction) => {
  newsletterController.unsubscribe(req, res).catch(next);
});

// Admin only routes
router.get('/', authenticate, requireAdmin, validatePagination, (req: AuthRequest, res: Response, next: NextFunction) => {
  newsletterController.getAllSubscriptions(req, res).catch(next);
});

router.get('/stats', authenticate, requireAdmin, (req: AuthRequest, res: Response, next: NextFunction) => {
  newsletterController.getStats(req, res).catch(next);
});

router.delete('/:email', authenticate, requireAdmin, validateEmail, (req: AuthRequest, res: Response, next: NextFunction) => {
  newsletterController.deleteSubscription(req, res).catch(next);
});

router.post('/sync-brevo', authenticate, requireAdmin, (req: AuthRequest, res: Response, next: NextFunction) => {
  newsletterController.syncWithBrevo(req, res).catch(next);
});

export default router;


