import { Context, Next } from 'hono';
import { Env, AuthContext } from '../types';
import { verifyToken } from '../utils/jwt';

export async function authenticate(c: Context<{ Bindings: Env; Variables: AuthContext }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.substring(7);
  const user = await verifyToken(token, c.env.JWT_SECRET);

  if (!user) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  c.set('user', user);
  await next();
}

export async function requireAdmin(c: Context<{ Bindings: Env; Variables: AuthContext }>, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  if (!user.is_admin) {
    return c.json({ error: 'Admin access required' }, 403);
  }

  await next();
}

export async function optionalAuth(c: Context<{ Bindings: Env; Variables: AuthContext }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = await verifyToken(token, c.env.JWT_SECRET);
    
    if (user) {
      c.set('user', user);
    }
  }

  await next();
}


