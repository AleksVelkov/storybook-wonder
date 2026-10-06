import { Hono } from 'hono';
import { Env, AuthContext } from '../types';
import { authenticate } from '../middleware/auth';

const cart = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// Get user's cart
cart.get('/', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const items = await c.env.DB.prepare(
      `SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(authUser.id).all();

    return c.json({ items: items.results || [] });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return c.json({ error: 'Failed to fetch cart' }, 500);
  }
});

// Add item to cart (or update if exists)
cart.post('/', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const {
    product_id,
    product_name,
    product_name_en,
    image,
    formats,
    price,
    quantity = 1,
    personalization
  } = body;

  if (!product_id || !product_name || !price) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  try {
    const personalizationData = personalization ? JSON.stringify(personalization) : null;

    // Check if item already exists
    const existing = await c.env.DB.prepare(
      `SELECT id, quantity FROM cart_items 
       WHERE user_id = ? AND product_id = ? 
       AND formats_book = ? AND formats_audiobook = ? AND formats_digital = ?`
    ).bind(
      authUser.id,
      product_id,
      formats?.book ? 1 : 0,
      formats?.audiobook ? 1 : 0,
      formats?.digital ? 1 : 0
    ).first();

    if (existing) {
      // Update quantity
      await c.env.DB.prepare(
        `UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`
      ).bind(quantity, existing.id).run();
      
      return c.json({ message: 'Cart updated', item_id: existing.id });
    } else {
      // Insert new item
      const result = await c.env.DB.prepare(
        `INSERT INTO cart_items (
          user_id, product_id, product_name, product_name_en, image,
          formats_book, formats_audiobook, formats_digital,
          price, quantity, personalization_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id`
      ).bind(
        authUser.id,
        product_id,
        product_name,
        product_name_en || product_name,
        image || null,
        formats?.book ? 1 : 0,
        formats?.audiobook ? 1 : 0,
        formats?.digital ? 1 : 0,
        price,
        quantity,
        personalizationData
      ).first();

      return c.json({ message: 'Item added to cart', item_id: result?.id }, 201);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return c.json({ error: 'Failed to add item to cart' }, 500);
  }
});

// Update cart item quantity
cart.put('/:id', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const itemId = c.req.param('id');
  const body = await c.req.json();
  const { quantity } = body;

  if (!quantity || quantity < 1) {
    return c.json({ error: 'Invalid quantity' }, 400);
  }

  try {
    await c.env.DB.prepare(
      `UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?`
    ).bind(quantity, itemId, authUser.id).run();

    return c.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return c.json({ error: 'Failed to update cart item' }, 500);
  }
});

// Remove item from cart
cart.delete('/:id', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const itemId = c.req.param('id');

  try {
    await c.env.DB.prepare(
      `DELETE FROM cart_items WHERE id = ? AND user_id = ?`
    ).bind(itemId, authUser.id).run();

    return c.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return c.json({ error: 'Failed to remove item' }, 500);
  }
});

// Clear entire cart
cart.delete('/', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    await c.env.DB.prepare(
      `DELETE FROM cart_items WHERE user_id = ?`
    ).bind(authUser.id).run();

    return c.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return c.json({ error: 'Failed to clear cart' }, 500);
  }
});

// Sync cart from localStorage (merge)
cart.post('/sync', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { items } = body;

  if (!Array.isArray(items)) {
    return c.json({ error: 'Invalid items array' }, 400);
  }

  try {
    // Add each item from localStorage to database
    for (const item of items) {
      const personalizationData = item.personalization ? JSON.stringify(item.personalization) : null;

      // Check if item already exists
      const existing = await c.env.DB.prepare(
        `SELECT id, quantity FROM cart_items 
         WHERE user_id = ? AND product_id = ? 
         AND formats_book = ? AND formats_audiobook = ? AND formats_digital = ?`
      ).bind(
        authUser.id,
        item.id,
        item.formats?.book ? 1 : 0,
        item.formats?.audiobook ? 1 : 0,
        item.formats?.digital ? 1 : 0
      ).first();

      if (existing) {
        // Update quantity (add to existing)
        await c.env.DB.prepare(
          `UPDATE cart_items SET quantity = quantity + ? WHERE id = ?`
        ).bind(item.quantity || 1, existing.id).run();
      } else {
        // Insert new item
        await c.env.DB.prepare(
          `INSERT INTO cart_items (
            user_id, product_id, product_name, product_name_en, image,
            formats_book, formats_audiobook, formats_digital,
            price, quantity, personalization_data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          authUser.id,
          item.id,
          item.title,
          item.titleEn || item.title,
          item.image || null,
          item.formats?.book ? 1 : 0,
          item.formats?.audiobook ? 1 : 0,
          item.formats?.digital ? 1 : 0,
          item.price,
          item.quantity || 1,
          personalizationData
        ).run();
      }
    }

    // Return merged cart
    const mergedCart = await c.env.DB.prepare(
      `SELECT * FROM cart_items WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(authUser.id).all();

    return c.json({ message: 'Cart synced', items: mergedCart.results || [] });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return c.json({ error: 'Failed to sync cart' }, 500);
  }
});

export default cart;


