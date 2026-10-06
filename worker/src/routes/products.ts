import { Hono } from 'hono';
import { Env, AuthContext, Product } from '../types';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';

const products = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// Get all products (public)
products.get('/', optionalAuth, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const isActive = c.req.query('isActive');
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM products';
  let countQuery = 'SELECT COUNT(*) as count FROM products';
  const params: any[] = [];

  if (isActive !== undefined) {
    query += ' WHERE is_active = ?';
    countQuery += ' WHERE is_active = ?';
    params.push(isActive === 'true' ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const [productsResult, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...params, limit, offset).all<Product>(),
    c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>()
  ]);

  const total = countResult?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return c.json({
    products: productsResult.results.map(p => ({ ...p, is_active: !!p.is_active })),
    total,
    page,
    totalPages
  });
});

// Get product by ID (public)
products.get('/:id', optionalAuth, async (c) => {
  const id = c.req.param('id');

  const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<Product>();

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ ...product, is_active: !!product.is_active });
});

// Create product (admin)
products.post('/', authenticate, requireAdmin, async (c) => {
  const body = await c.req.json();
  const { title, description, price, currency, image_url, stock_quantity, is_active } = body;

  if (!title || price === undefined) {
    return c.json({ error: 'Title and price are required' }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO products (title, description, price, currency, image_url, stock_quantity, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    title,
    description || null,
    price,
    currency || 'USD',
    image_url || null,
    stock_quantity || 0,
    is_active !== undefined ? (is_active ? 1 : 0) : 1
  ).first<Product>();

  return c.json({ ...result, is_active: !!result?.is_active }, 201);
});

// Update product (admin)
products.put('/:id', authenticate, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  const allowedFields = ['title', 'description', 'price', 'currency', 'image_url', 'stock_quantity', 'is_active'];

  for (const [key, value] of Object.entries(body)) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(key === 'is_active' ? (value ? 1 : 0) : value);
    }
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(id);

  await c.env.DB.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<Product>();

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ ...product, is_active: !!product.is_active });
});

// Update stock (admin)
products.patch('/:id/stock', authenticate, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { quantity } = body;

  if (quantity === undefined) {
    return c.json({ error: 'Quantity is required' }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?'
  ).bind(quantity, id).run();

  const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(id)
    .first<Product>();

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ ...product, is_active: !!product.is_active });
});

// Delete product (admin)
products.delete('/:id', authenticate, requireAdmin, async (c) => {
  const id = c.req.param('id');

  const result = await c.env.DB.prepare('DELETE FROM products WHERE id = ? RETURNING id')
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.body(null, 204);
});

export default products;


