import { Hono } from 'hono';
import type { Context } from 'hono';
import { authenticate, requireAdmin } from '../middleware/auth';
import { Env, AuthContext } from '../types';

const coupons = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// Admin: Get all coupons
coupons.get('/', authenticate, requireAdmin, async (c: Context) => {
  try {
    const coupons = await c.env.DB.prepare(
      'SELECT * FROM coupons ORDER BY created_at DESC'
    ).all();

    return c.json(coupons.results || []);
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return c.json({ error: 'Failed to fetch coupons' }, 500);
  }
});

// Admin: Create coupon
coupons.post('/', authenticate, requireAdmin, async (c: Context) => {
  try {
    const user = c.get('user');
    const { code, discount_percentage, valid_from, valid_until, max_usage, max_uses_per_user } = await c.req.json();

    if (!code || !discount_percentage || !valid_from) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (discount_percentage <= 0 || discount_percentage > 100) {
      return c.json({ error: 'Discount percentage must be between 1 and 100' }, 400);
    }

    // Check if coupon code already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM coupons WHERE code = ?'
    ).bind(code.toUpperCase()).first();

    if (existing) {
      return c.json({ error: 'Coupon code already exists' }, 409);
    }

    // Insert coupon
    const result = await c.env.DB.prepare(
      `INSERT INTO coupons (code, discount_percentage, valid_from, valid_until, max_usage, max_uses_per_user, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      code.toUpperCase(),
      discount_percentage,
      valid_from,
      valid_until || null,
      max_usage || null,
      max_uses_per_user || null,
      user.id
    ).run();

    if (!result.success) {
      return c.json({ error: 'Failed to create coupon' }, 500);
    }

    const newCoupon = await c.env.DB.prepare(
      'SELECT * FROM coupons WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return c.json(newCoupon, 201);
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    return c.json({ error: 'Failed to create coupon' }, 500);
  }
});

// Admin: Update coupon
coupons.put('/:id', authenticate, requireAdmin, async (c: Context) => {
  try {
    const id = c.req.param('id');
    const { code, discount_percentage, valid_from, valid_until, max_usage, max_uses_per_user, is_active } = await c.req.json();

    if (!code || !discount_percentage || !valid_from) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (discount_percentage <= 0 || discount_percentage > 100) {
      return c.json({ error: 'Discount percentage must be between 1 and 100' }, 400);
    }

    // Check if coupon exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM coupons WHERE id = ?'
    ).bind(id).first();

    if (!existing) {
      return c.json({ error: 'Coupon not found' }, 404);
    }

    // Update coupon
    await c.env.DB.prepare(
      `UPDATE coupons 
       SET code = ?, discount_percentage = ?, valid_from = ?, valid_until = ?, 
           max_usage = ?, max_uses_per_user = ?, is_active = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(
      code.toUpperCase(),
      discount_percentage,
      valid_from,
      valid_until || null,
      max_usage || null,
      max_uses_per_user || null,
      is_active ? 1 : 0,
      id
    ).run();

    const updated = await c.env.DB.prepare(
      'SELECT * FROM coupons WHERE id = ?'
    ).bind(id).first();

    return c.json(updated);
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    return c.json({ error: 'Failed to update coupon' }, 500);
  }
});

// Admin: Delete coupon
coupons.delete('/:id', authenticate, requireAdmin, async (c: Context) => {
  try {
    const id = c.req.param('id');

    await c.env.DB.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();

    return c.json({ message: 'Coupon deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting coupon:', error);
    return c.json({ error: 'Failed to delete coupon' }, 500);
  }
});

// Public: Validate coupon (with optional user check)
coupons.post('/validate', async (c: Context) => {
  try {
    const { code, user_id } = await c.req.json();

    if (!code) {
      return c.json({ error: 'Coupon code is required' }, 400);
    }

    const coupon = await c.env.DB.prepare(
      `SELECT * FROM coupons 
       WHERE code = ? 
       AND is_active = 1 
       AND datetime('now') >= datetime(valid_from) 
       AND (valid_until IS NULL OR datetime('now') <= datetime(valid_until))`
    ).bind(code.toUpperCase()).first();

    if (!coupon) {
      return c.json({ error: 'Invalid or expired coupon code' }, 404);
    }

    // Check global usage limit
    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
      return c.json({ error: 'Coupon usage limit reached' }, 400);
    }

    // Check per-user usage limit if user_id provided and limit exists
    if (user_id && coupon.max_uses_per_user) {
      const userUsage = await c.env.DB.prepare(
        `SELECT COUNT(*) as count FROM coupon_usage 
         WHERE coupon_id = ? AND user_id = ?`
      ).bind(coupon.id, user_id).first<{ count: number }>();

      if (userUsage && userUsage.count >= coupon.max_uses_per_user) {
        return c.json({ 
          error: coupon.max_uses_per_user === 1 
            ? 'This coupon can only be used once per customer' 
            : `This coupon can only be used ${coupon.max_uses_per_user} times per customer`
        }, 400);
      }
    }

    return c.json({
      valid: true,
      discount_percentage: coupon.discount_percentage,
      code: coupon.code,
      max_uses_per_user: coupon.max_uses_per_user,
      remaining_uses: user_id && coupon.max_uses_per_user 
        ? coupon.max_uses_per_user - (await getUserCouponUsageCount(c.env.DB, coupon.id, user_id))
        : null
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return c.json({ error: 'Failed to validate coupon' }, 500);
  }
});

// Helper function to get user's coupon usage count
async function getUserCouponUsageCount(db: any, couponId: number, userId: number): Promise<number> {
  const result = await db.prepare(
    'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = ? AND user_id = ?'
  ).bind(couponId, userId).first<{ count: number }>();
  
  return result?.count || 0;
}

// Increment coupon usage (called internally when order is placed)
export async function incrementCouponUsage(db: any, code: string) {
  try {
    await db.prepare(
      'UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?'
    ).bind(code.toUpperCase()).run();
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
  }
}

export default coupons;

