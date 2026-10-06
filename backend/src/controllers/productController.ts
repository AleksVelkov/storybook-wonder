import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ProductService } from '../services/productService.js';

const productService = new ProductService();

export class ProductController {
  async getAllProducts(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const isActiveParam = req.query.isActive as string;
      const isActive = isActiveParam !== undefined ? isActiveParam === 'true' : undefined;

      const result = await productService.getAllProducts(page, limit, isActive);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  async getProductById(req: AuthRequest, res: Response) {
    try {
      const productId = parseInt(req.params.id);
      const product = await productService.getProductById(productId);
      res.json(product);
    } catch (error) {
      throw error;
    }
  }

  async createProduct(req: AuthRequest, res: Response) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      const productId = parseInt(req.params.id);
      const product = await productService.updateProduct(productId, req.body);
      res.json(product);
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const productId = parseInt(req.params.id);
      await productService.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  async updateStock(req: AuthRequest, res: Response) {
    try {
      const productId = parseInt(req.params.id);
      const { quantity } = req.body;
      const product = await productService.updateStock(productId, quantity);
      res.json(product);
    } catch (error) {
      throw error;
    }
  }
}


