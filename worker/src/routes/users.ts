import { Hono } from 'hono';
import { Env, AuthContext, User, UserProfile } from '../types';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticate, requireAdmin } from '../middleware/auth';

const users = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// Register
users.post('/register', async (c) => {
  const body = await c.req.json();
  const { email, password, first_name, last_name, phone, address, house_number, city, postal_code, country } = body;

  // Validation
  if (!email || !password || !first_name || !last_name) {
    return c.json({ error: 'Email, password, first name, and last name are required' }, 400);
  }

  // Check if user exists
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  
  if (existing) {
    return c.json({ error: 'User with this email already exists' }, 409);
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Insert user - ensure undefined values are converted to null for D1
  const result = await c.env.DB.prepare(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, address, house_number, city, postal_code, country)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id, email, first_name, last_name, phone, address, house_number, city, postal_code, country, is_admin, is_active, created_at, updated_at`
  ).bind(
    email, 
    password_hash, 
    first_name, 
    last_name, 
    phone || null, 
    address || null, 
    house_number || null,
    city || null, 
    postal_code || null, 
    country || null
  ).first<UserProfile>();

  if (!result) {
    return c.json({ error: 'Failed to create user' }, 500);
  }

  const token = await generateToken(
    { id: result.id, email: result.email, is_admin: !!result.is_admin },
    c.env.JWT_SECRET,
    c.env.JWT_EXPIRES_IN
  );

  return c.json({ user: { ...result, is_admin: !!result.is_admin, is_active: !!result.is_active }, token }, 201);
});

// Login
users.post('/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password are required' }, 400);
  }

  // Find user
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>();
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Check if active
  if (!user.is_active) {
    return c.json({ error: 'Account is deactivated' }, 403);
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // Update last login
  await c.env.DB.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').bind(user.id).run();

  const token = await generateToken(
    { id: user.id, email: user.email, is_admin: !!user.is_admin },
    c.env.JWT_SECRET,
    c.env.JWT_EXPIRES_IN
  );

  const { password_hash, ...userProfile } = user;

  return c.json({ 
    user: { ...userProfile, is_admin: !!user.is_admin, is_active: !!user.is_active }, 
    token 
  });
});

// Get profile
users.get('/profile', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const user = await c.env.DB.prepare(
    `SELECT id, email, first_name, last_name, phone, address, house_number, city, postal_code, country, 
            is_admin, is_active, created_at, updated_at, last_login
     FROM users WHERE id = ?`
  ).bind(authUser.id).first<UserProfile>();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ ...user, is_admin: !!user.is_admin, is_active: !!user.is_active });
});

// Update profile
users.put('/profile', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { first_name, last_name, phone, address, city, postal_code, country, house_number } = body;

  const updates: string[] = [];
  const values: any[] = [];

  if (first_name) {
    updates.push('first_name = ?');
    values.push(first_name);
  }
  if (last_name) {
    updates.push('last_name = ?');
    values.push(last_name);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    values.push(address);
  }
  if (house_number !== undefined) {
    updates.push('house_number = ?');
    values.push(house_number);
  }
  if (city !== undefined) {
    updates.push('city = ?');
    values.push(city);
  }
  if (postal_code !== undefined) {
    updates.push('postal_code = ?');
    values.push(postal_code);
  }
  if (country !== undefined) {
    updates.push('country = ?');
    values.push(country);
  }

  if (updates.length === 0) {
    return c.json({ error: 'No fields to update' }, 400);
  }

  values.push(authUser.id);

  await c.env.DB.prepare(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
  ).bind(...values).run();

  const user = await c.env.DB.prepare(
    `SELECT id, email, first_name, last_name, phone, address, house_number, city, postal_code, country, 
            is_admin, is_active, created_at, updated_at, last_login
     FROM users WHERE id = ?`
  ).bind(authUser.id).first<UserProfile>();

  return c.json({ ...user, is_admin: !!user?.is_admin, is_active: !!user?.is_active });
});

// Change password
users.post('/change-password', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { current_password, new_password } = body;

  if (!current_password || !new_password) {
    return c.json({ error: 'Current password and new password are required' }, 400);
  }

  if (new_password.length < 6) {
    return c.json({ error: 'New password must be at least 6 characters' }, 400);
  }

  // Get current user with password hash
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(authUser.id).first<User>();
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Verify current password
  const isValid = await verifyPassword(current_password, user.password_hash);
  
  if (!isValid) {
    return c.json({ error: 'Current password is incorrect' }, 401);
  }

  // Hash new password
  const new_password_hash = await hashPassword(new_password);

  // Update password
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?'
  ).bind(new_password_hash, authUser.id).run();

  return c.json({ message: 'Password updated successfully' });
});

// Get all users (admin)
users.get('/', authenticate, requireAdmin, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const search = c.req.query('search');
  const offset = (page - 1) * limit;

  let query = `SELECT id, email, first_name, last_name, phone, address, city, postal_code, country, 
                      is_admin, is_active, created_at, updated_at, last_login
               FROM users`;
  let countQuery = 'SELECT COUNT(*) as count FROM users';
  const params: any[] = [];

  if (search) {
    query += ` WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
    countQuery += ` WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  
  const [usersResult, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...params, limit, offset).all<UserProfile>(),
    c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>()
  ]);

  const total = countResult?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return c.json({
    users: usersResult.results.map(u => ({ ...u, is_admin: !!u.is_admin, is_active: !!u.is_active })),
    total,
    page,
    totalPages
  });
});

// Get user by ID (admin)
users.get('/:id', authenticate, requireAdmin, async (c) => {
  const id = c.req.param('id');

  const user = await c.env.DB.prepare(
    `SELECT id, email, first_name, last_name, phone, address, city, postal_code, country, 
            is_admin, is_active, created_at, updated_at, last_login
     FROM users WHERE id = ?`
  ).bind(id).first<UserProfile>();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ ...user, is_admin: !!user.is_admin, is_active: !!user.is_active });
});

// Toggle user status (admin)
users.patch('/:id/toggle-status', authenticate, requireAdmin, async (c) => {
  const id = c.req.param('id');

  await c.env.DB.prepare(
    'UPDATE users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?'
  ).bind(id).run();

  const user = await c.env.DB.prepare(
    `SELECT id, email, first_name, last_name, phone, address, city, postal_code, country, 
            is_admin, is_active, created_at, updated_at, last_login
     FROM users WHERE id = ?`
  ).bind(id).first<UserProfile>();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ ...user, is_admin: !!user.is_admin, is_active: !!user.is_active });
});

export default users;

