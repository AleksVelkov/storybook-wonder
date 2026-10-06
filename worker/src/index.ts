import { Hono } from 'hono';
import { Env, AuthContext } from './types';
import { cors } from './middleware/cors';
import users from './routes/users';
import products from './routes/products';
import orders from './routes/orders';
import newsletter from './routes/newsletter';
import contact from './routes/contact';
import address from './routes/address';
import coupons from './routes/coupons';
import cart from './routes/cart';

const app = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// CORS middleware
app.use('*', cors());

// Health check
app.get('/health', async (c) => {
  try {
    // Test DB connection
    await c.env.DB.prepare('SELECT 1').first();
    return c.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return c.json({ status: 'error', database: 'disconnected' }, 503);
  }
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Storybook Wonder API - Cloudflare Workers',
    version: '2.0.0',
    environment: c.env.ENVIRONMENT || 'production',
    endpoints: {
      health: '/health',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      newsletter: '/api/newsletter',
      contact: '/api/contact',
      address: '/api/address',
      coupons: '/api/coupons',
      cart: '/api/cart'
    }
  });
});

// API routes
app.route('/api/users', users);
app.route('/api/products', products);
app.route('/api/orders', orders);
app.route('/api/newsletter', newsletter);
app.route('/api/contact', contact);
app.route('/api/address', address);
app.route('/api/coupons', coupons);
app.route('/api/cart', cart);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: 'Internal server error',
    ...(c.env.ENVIRONMENT === 'development' && { message: err.message })
  }, 500);
});

export default app;

