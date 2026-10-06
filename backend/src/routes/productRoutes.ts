import { Router, Response, NextFunction } from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticate, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validation.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.js';

const router = Router();
const productController = new ProductController();

const validateProduct = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('image_url').optional().trim(),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be non-negative'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  validate
];

const validateStockUpdate = [
  body('quantity').isInt().withMessage('Quantity must be an integer'),
  validate
];

// Public routes (anyone can view products)
router.get('/', optionalAuth, validatePagination, (req: AuthRequest, res: Response, next: NextFunction) => {
  productController.getAllProducts(req, res).catch(next);
});

router.get('/:id', optionalAuth, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  productController.getProductById(req, res).catch(next);
});

// Admin only routes
router.post('/', authenticate, requireAdmin, validateProduct, (req: AuthRequest, res: Response, next: NextFunction) => {
  productController.createProduct(req, res).catch(next);
});

router.put('/:id', authenticate, requireAdmin, validateId, validateProduct, (req: AuthRequest, res: Response, next: NextFunction) => {
  productController.updateProduct(req, res).catch(next);
});

router.patch('/:id/stock', authenticate, requireAdmin, validateId, validateStockUpdate, (req: AuthRequest, res: Response, next: NextFunction) => {
  productController.updateStock(req, res).catch(next);
});

router.delete('/:id', authenticate, requireAdmin, validateId, (req: AuthRequest, res: Response, next: NextFunction) => {
  productController.deleteProduct(req, res).catch(next);
});

export default router;

