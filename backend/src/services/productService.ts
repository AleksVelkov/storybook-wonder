import { pool } from '../config/database.js';
import { Product } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class ProductService {
  async getAllProducts(
    page: number = 1,
    limit: number = 20,
    isActive?: boolean
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products';
    let countQuery = 'SELECT COUNT(*) FROM products';
    const params: any[] = [];
    let paramIndex = 1;

    if (isActive !== undefined) {
      const whereClause = ` WHERE is_active = $${paramIndex}`;
      query += whereClause;
      countQuery += whereClause;
      params.push(isActive);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [productsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, isActive !== undefined ? [isActive] : [])
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      products: productsResult.rows as Product[],
      total,
      page,
      totalPages
    };
  }

  async getProductById(productId: number): Promise<Product> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return result.rows[0] as Product;
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await pool.query(
      `INSERT INTO products (title, description, price, currency, image_url, stock_quantity, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        productData.title,
        productData.description,
        productData.price,
        productData.currency || 'USD',
        productData.image_url,
        productData.stock_quantity || 0,
        productData.is_active !== undefined ? productData.is_active : true
      ]
    );

    return result.rows[0] as Product;
  }

  async updateProduct(productId: number, updates: Partial<Product>): Promise<Product> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['title', 'description', 'price', 'currency', 'image_url', 'stock_quantity', 'is_active'];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && allowedFields.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(productId);

    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return result.rows[0] as Product;
  }

  async deleteProduct(productId: number): Promise<void> {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [productId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404);
    }
  }

  async updateStock(productId: number, quantity: number): Promise<Product> {
    const result = await pool.query(
      `UPDATE products SET stock_quantity = stock_quantity + $1
       WHERE id = $2
       RETURNING *`,
      [quantity, productId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return result.rows[0] as Product;
  }
}


