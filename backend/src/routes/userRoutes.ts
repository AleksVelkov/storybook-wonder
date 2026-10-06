import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateUser,
  validateId,
  validatePagination
} from '../middleware/validation.js';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validateRegister, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.register(req, res).catch(next);
});

router.post('/login', validateLogin, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.login(req, res).catch(next);
});

// Protected routes (require authentication)
router.get('/profile', authenticate, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.getProfile(req, res).catch(next);
});

router.put('/profile', authenticate, validateUpdateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.updateProfile(req, res).catch(next);
});

// Admin only routes
router.get('/', authenticate, requireAdmin, validatePagination, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.getAllUsers(req, res).catch(next);
});

router.get('/:id', authenticate, requireAdmin, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.getUserById(req, res).catch(next);
});

router.put('/:id', authenticate, requireAdmin, validateId, validateUpdateUser, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.updateUser(req, res).catch(next);
});

router.patch('/:id/toggle-status', authenticate, requireAdmin, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.toggleUserStatus(req, res).catch(next);
});

router.delete('/:id', authenticate, requireAdmin, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  userController.deleteUser(req, res).catch(next);
});

export default router;

