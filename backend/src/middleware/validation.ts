import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('postal_code').optional().trim(),
  body('country').optional().trim(),
  validate
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

export const validateUpdateUser = [
  body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('postal_code').optional().trim(),
  body('country').optional().trim(),
  validate
];

export const validateCreateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  body('shipping_city').trim().notEmpty().withMessage('Shipping city is required'),
  body('shipping_postal_code').trim().notEmpty().withMessage('Shipping postal code is required'),
  body('shipping_country').trim().notEmpty().withMessage('Shipping country is required'),
  body('billing_address').optional().trim(),
  body('billing_city').optional().trim(),
  body('billing_postal_code').optional().trim(),
  body('billing_country').optional().trim(),
  body('notes').optional().trim(),
  validate
];

export const validateUpdateOrderStatus = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  body('notes').optional().trim(),
  validate
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

export const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required'),
  validate
];


