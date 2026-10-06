import { pool, getClient } from '../config/database.js';
import { Order, OrderWithDetails, OrderItem, CreateOrderDTO, UpdateOrderStatusDTO, OrderStatus } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class OrderService {
  async createOrder(orderData: CreateOrderDTO): Promise<OrderWithDetails> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Validate products and calculate total
      let totalAmount = 0;
      const orderItems: { product_id: number; product_name: string; quantity: number; unit_price: number; total_price: number }[] = [];

      for (const item of orderData.items) {
        const productResult = await client.query(
          'SELECT id, title, price, stock_quantity, is_active FROM products WHERE id = $1',
          [item.product_id]
        );

        if (productResult.rows.length === 0) {
          throw new AppError(`Product with ID ${item.product_id} not found`, 404);
        }

        const product = productResult.rows[0];

        if (!product.is_active) {
          throw new AppError(`Product "${product.title}" is not available`, 400);
        }

        if (product.stock_quantity < item.quantity) {
          throw new AppError(`Insufficient stock for product "${product.title}"`, 400);
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product_id: product.id,
          product_name: product.title,
          quantity: item.quantity,
          unit_price: parseFloat(product.price),
          total_price: itemTotal
        });

        // Update stock
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, product.id]
        );
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${orderData.user_id}`;

      // Create order
      const orderResult = await client.query(
        `INSERT INTO orders (
          user_id, order_number, status, total_amount, currency,
          shipping_address, shipping_city, shipping_postal_code, shipping_country,
          billing_address, billing_city, billing_postal_code, billing_country, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          orderData.user_id,
          orderNumber,
          'pending',
          totalAmount,
          'USD',
          orderData.shipping_address,
          orderData.shipping_city,
          orderData.shipping_postal_code,
          orderData.shipping_country,
          orderData.billing_address,
          orderData.billing_city,
          orderData.billing_postal_code,
          orderData.billing_country,
          orderData.notes
        ]
      );

      const order = orderResult.rows[0];

      // Create order items
      const items: OrderItem[] = [];
      for (const item of orderItems) {
        const itemResult = await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
          [order.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price]
        );
        items.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');

      return {
        ...order,
        items
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getOrderById(orderId: number, userId?: number, isAdmin: boolean = false): Promise<OrderWithDetails> {
    let query = `
      SELECT 
        o.*,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    const params: any[] = [orderId];

    // Non-admin users can only see their own orders
    if (!isAdmin && userId) {
      query += ' AND o.user_id = $2';
      params.push(userId);
    }

    const orderResult = await pool.query(query, params);

    if (orderResult.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(
      `SELECT oi.*, p.image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    return {
      ...order,
      items: itemsResult.rows
    };
  }

  async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus,
    userId?: number,
    isAdmin: boolean = false
  ): Promise<{
    orders: OrderWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        o.*,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) FROM orders o';
    const params: any[] = [];
    const conditions: string[] = [];
    let paramIndex = 1;

    // Non-admin users can only see their own orders
    if (!isAdmin && userId) {
      conditions.push(`o.user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    if (status) {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [ordersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, params.slice(0, -2))
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Get items for each order
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id]
        );
        return {
          ...order,
          items: itemsResult.rows
        };
      })
    );

    return {
      orders,
      total,
      page,
      totalPages
    };
  }

  async getUserOrders(userId: number, page: number = 1, limit: number = 20): Promise<{
    orders: OrderWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.getAllOrders(page, limit, undefined, userId, false);
  }

  async updateOrderStatus(orderId: number, statusUpdate: UpdateOrderStatusDTO): Promise<Order> {
    const { status, notes } = statusUpdate;

    // Build update fields
    const fields = ['status = $1'];
    const values: any[] = [status];
    let paramIndex = 2;

    if (notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }

    // Add timestamp fields based on status
    if (status === 'shipped') {
      fields.push(`shipped_at = CURRENT_TIMESTAMP`);
    } else if (status === 'delivered') {
      fields.push(`delivered_at = CURRENT_TIMESTAMP`);
    }

    values.push(orderId);

    const result = await pool.query(
      `UPDATE orders SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }

    return result.rows[0] as Order;
  }

  async cancelOrder(orderId: number, userId?: number, isAdmin: boolean = false): Promise<Order> {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Get order with user check
      let query = 'SELECT * FROM orders WHERE id = $1';
      const params: any[] = [orderId];

      if (!isAdmin && userId) {
        query += ' AND user_id = $2';
        params.push(userId);
      }

      const orderResult = await client.query(query, params);

      if (orderResult.rows.length === 0) {
        throw new AppError('Order not found', 404);
      }

      const order = orderResult.rows[0];

      // Only allow cancellation of pending or processing orders
      if (!['pending', 'processing'].includes(order.status)) {
        throw new AppError('Cannot cancel order in current status', 400);
      }

      // Restore stock quantities
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      const updateResult = await client.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        ['cancelled', orderId]
      );

      await client.query('COMMIT');

      return updateResult.rows[0] as Order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteOrder(orderId: number): Promise<void> {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING id', [orderId]);
    
    if (result.rows.length === 0) {
      throw new AppError('Order not found', 404);
    }
  }

  async getOrderStats(): Promise<{
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status NOT IN ('cancelled', 'refunded') THEN total_amount ELSE 0 END), 0) as total_revenue
      FROM orders
    `);

    return result.rows[0];
  }
}


