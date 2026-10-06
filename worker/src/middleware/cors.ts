import { Context, Next } from 'hono';
import { Env } from '../types';

export function cors() {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const origin = c.req.header('Origin');
    const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || [];
    
    // Handle preflight
    if (c.req.method === 'OPTIONS') {
      const headers = new Headers();
      
      if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
        headers.set('Access-Control-Allow-Origin', origin);
      }
      
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      headers.set('Access-Control-Max-Age', '86400');
      headers.set('Access-Control-Allow-Credentials', 'true');
      
      return new Response(null, { status: 204, headers });
    }

    await next();

    // Add CORS headers to response
    if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Access-Control-Allow-Credentials', 'true');
    }
  };
}


