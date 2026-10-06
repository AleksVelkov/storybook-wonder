import { Hono } from 'hono';
import { Env, AuthContext } from '../types';
import { authenticate, requireAdmin } from '../middleware/auth';

// Email templates
const getOrderConfirmationEmail = (order: any, customerName: string, language: string = 'nl') => {
  const statusText = language === 'nl' ? {
    pending: 'in behandeling',
    processing: 'wordt verwerkt',
    shipped: 'verzonden',
    delivered: 'afgeleverd',
    cancelled: 'geannuleerd'
  } : {
    pending: 'pending',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled'
  };

  return {
    subject: language === 'nl' 
      ? `Bedankt voor je bestelling! #${order.order_number}` 
      : `Thank you for your order! #${order.order_number}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6366f1;">
          ${language === 'nl' ? `Beste ${customerName},` : `Dear ${customerName},`}
        </h2>
        
        <p>${language === 'nl' ? 'Bedankt voor je bestelling bij Sterren Verhalen!' : 'Thank you for your order at Sterren Verhalen!'}</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${language === 'nl' ? 'Bestelgegevens' : 'Order Details'}</h3>
          <p><strong>${language === 'nl' ? 'Bestelnummer' : 'Order Number'}:</strong> ${order.order_number}</p>
          <p><strong>${language === 'nl' ? 'Status' : 'Status'}:</strong> ${statusText[order.status as keyof typeof statusText]}</p>
          <p><strong>${language === 'nl' ? 'Totaalbedrag' : 'Total Amount'}:</strong> €${order.total_amount.toFixed(2)}</p>
        </div>
        
        <h3>${language === 'nl' ? 'Wat gebeurt er nu?' : 'What happens next?'}</h3>
        <ol>
          <li>${language === 'nl' ? 'We verwerken je bestelling binnen 1-2 werkdagen' : 'We will process your order within 1-2 business days'}</li>
          <li>${language === 'nl' ? 'Je ontvangt een verzendbevestiging met track & trace' : 'You will receive a shipping confirmation with tracking'}</li>
          <li>${language === 'nl' ? 'Je bestelling wordt binnen 3-5 werkdagen bezorgd' : 'Your order will be delivered within 3-5 business days'}</li>
        </ol>
        
        <p>${language === 'nl' ? 'Je kunt je bestelling volgen via je account op onze website.' : 'You can track your order through your account on our website.'}</p>
        
        <p style="margin-top: 30px;">
          <strong>${language === 'nl' ? 'Hartelijke groet,' : 'Best regards,'}</strong><br>
          Het Sterren Verhalen-team
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666;">
          ${language === 'nl' ? 'Vragen over je bestelling?' : 'Questions about your order?'}<br>
          ${language === 'nl' ? 'Neem contact met ons op via' : 'Contact us at'} 
          <a href="mailto:orders@sterrenverhalen.nl" style="color: #6366f1;">orders@sterrenverhalen.nl</a>
        </p>
      </div>
    `
  };
};

const orders = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// Get user's own orders
orders.get('/my-orders', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get orders for the user
    const result = await c.env.DB.prepare(
      `SELECT id, order_number, status, total_amount, currency, 
              shipping_address, shipping_city, shipping_postal_code, shipping_country,
              tracking_number, created_at, updated_at
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`
    ).bind(authUser.id).all();

    return c.json({ orders: result.results || [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get specific order details with items
orders.get('/my-orders/:id', authenticate, async (c) => {
  const authUser = c.get('user');
  const orderId = c.req.param('id');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get order
    const order = await c.env.DB.prepare(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`
    ).bind(orderId, authUser.id).first();

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Get order items
    const items = await c.env.DB.prepare(
      `SELECT * FROM order_items WHERE order_id = ?`
    ).bind(orderId).all();

    return c.json({
      ...order,
      items: items.results || []
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Get all orders (admin only)
orders.get('/', authenticate, requireAdmin, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status');
  const offset = (page - 1) * limit;

  let query = `SELECT o.*, u.email, u.first_name, u.last_name
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id`;
  let countQuery = 'SELECT COUNT(*) as count FROM orders';
  const params: any[] = [];

  if (status) {
    query += ` WHERE o.status = ?`;
    countQuery += ` WHERE status = ?`;
    params.push(status);
  }

  query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  
  const [ordersResult, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...params, limit, offset).all(),
    c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>()
  ]);

  const total = countResult?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return c.json({
    orders: ordersResult.results || [],
    total,
    page,
    totalPages
  });
});

// Get specific order (admin only)
orders.get('/:id', authenticate, requireAdmin, async (c) => {
  const orderId = c.req.param('id');

  try {
    // Get order with user info
    const order = await c.env.DB.prepare(
      `SELECT o.*, u.email, u.first_name, u.last_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`
    ).bind(orderId).first();

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Get order items
    const items = await c.env.DB.prepare(
      `SELECT * FROM order_items WHERE order_id = ?`
    ).bind(orderId).all();

    return c.json({
      ...order,
      items: items.results || []
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Update order status (admin only)
orders.patch('/:id/status', authenticate, requireAdmin, async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const { status, tracking_number } = body;

  if (!status) {
    return c.json({ error: 'Status is required' }, 400);
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  try {
    const updates: string[] = ['status = ?', 'updated_at = datetime("now")'];
    const values: any[] = [status];

    if (tracking_number !== undefined) {
      updates.push('tracking_number = ?');
      values.push(tracking_number);
    }

    values.push(orderId);

    await c.env.DB.prepare(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).bind(orderId).first();

    // Send status update email
    if (c.env.BREVO_API_KEY && order) {
      try {
        const userInfo = await c.env.DB.prepare(
          'SELECT email, first_name, last_name FROM users WHERE id = ?'
        ).bind(order.user_id).first<{ email: string; first_name: string; last_name: string }>();

        if (userInfo) {
          const statusMessages: Record<string, { nl: string; en: string }> = {
            processing: {
              nl: 'Je bestelling wordt nu verwerkt en zal binnenkort verzonden worden.',
              en: 'Your order is now being processed and will be shipped soon.'
            },
            shipped: {
              nl: `Je bestelling is verzonden! ${tracking_number ? `Track & Trace: ${tracking_number}` : ''}`,
              en: `Your order has been shipped! ${tracking_number ? `Tracking: ${tracking_number}` : ''}`
            },
            delivered: {
              nl: 'Je bestelling is afgeleverd. We hopen dat je ervan geniet!',
              en: 'Your order has been delivered. We hope you enjoy it!'
            }
          };

          const statusMsg = statusMessages[status]?.nl;
          
          if (statusMsg) {
            await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: {
                'api-key': c.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                sender: {
                  name: 'Sterren Verhalen',
                  email: 'orders@sterrenverhalen.nl'
                },
                to: [{ email: userInfo.email, name: `${userInfo.first_name} ${userInfo.last_name}` }],
                subject: `Update voor je bestelling #${order.order_number}`,
                htmlContent: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #6366f1;">Beste ${userInfo.first_name},</h2>
                    <p>Er is een update voor je bestelling!</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                      <p><strong>Bestelnummer:</strong> ${order.order_number}</p>
                      <p><strong>Status:</strong> ${status}</p>
                      <p>${statusMsg}</p>
                    </div>
                    <p>Je kunt je bestelling volgen via je account op onze website.</p>
                    <p style="margin-top: 30px;">
                      <strong>Met vriendelijke groet,</strong><br>
                      Het Sterren Verhalen-team
                    </p>
                  </div>
                `
              })
            });
            console.log('Status update email sent for order:', order.order_number);
          }
        }
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
      }
    }

    return c.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

// Create order (authenticated users)
orders.post('/', authenticate, async (c) => {
  const authUser = c.get('user');
  
  if (!authUser) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  let body;
  try {
    body = await c.req.json();
    console.log('Order creation request:', JSON.stringify(body, null, 2));
  } catch (parseError) {
    console.error('Error parsing request body:', parseError);
    return c.json({ error: 'Invalid JSON body' }, 400);
  }
  const {
    items,
    subtotal,
    coupon_code,
    shipping_method = 'standard',
    currency = 'EUR',
    shipping_address,
    shipping_city,
    shipping_postal_code,
    shipping_country,
    billing_address,
    billing_city,
    billing_postal_code,
    billing_country
  } = body;

  // Validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return c.json({ error: 'Order items are required' }, 400);
  }
  if (!subtotal || !shipping_address || !shipping_city || !shipping_postal_code) {
    return c.json({ error: 'Missing required order information' }, 400);
  }

  try {
    // Log shipping data for debugging
    console.log('Creating order with shipping data:', {
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_country
    });

    let discount_amount = 0;
    let validated_coupon_code = null;

    // Validate coupon if provided
    let couponId: number | null = null;
    if (coupon_code) {
      const coupon = await c.env.DB.prepare(
        `SELECT * FROM coupons 
         WHERE code = ? 
         AND is_active = 1 
         AND datetime('now') >= datetime(valid_from) 
         AND datetime('now') <= datetime(valid_until)`
      ).bind(coupon_code.toUpperCase()).first();

      if (coupon) {
        // Check global usage limit
        if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
          return c.json({ error: 'Coupon usage limit reached' }, 400);
        }

        // Check per-user usage limit
        if (coupon.max_uses_per_user) {
          const userUsage = await c.env.DB.prepare(
            `SELECT COUNT(*) as count FROM coupon_usage 
             WHERE coupon_id = ? AND user_id = ?`
          ).bind(coupon.id, authUser.id).first<{ count: number }>();

          if (userUsage && userUsage.count >= coupon.max_uses_per_user) {
            return c.json({ 
              error: coupon.max_uses_per_user === 1 
                ? 'This coupon can only be used once per customer' 
                : `This coupon can only be used ${coupon.max_uses_per_user} times per customer`
            }, 400);
          }
        }

        discount_amount = (subtotal * coupon.discount_percentage) / 100;
        validated_coupon_code = coupon.code;
        couponId = coupon.id;
        
        // Increment global coupon usage
        await c.env.DB.prepare(
          'UPDATE coupons SET usage_count = usage_count + 1 WHERE code = ?'
        ).bind(coupon.code).run();
      }
    }

    // Calculate shipping cost
    let shipping_cost = 0;
    if (shipping_method === 'standard') {
      const subtotal_after_discount = subtotal - discount_amount;
      if (subtotal_after_discount < 50) {
        shipping_cost = 4.95;
      }
      // Free shipping for orders above €50 or pickup
    }

    const total_amount = subtotal - discount_amount + shipping_cost;

    // Generate order number
    const timestamp = Date.now();
    const order_number = `ORD-${timestamp}-${authUser.id}`;

    // Create order
    const orderResult = await c.env.DB.prepare(
      `INSERT INTO orders (
        user_id, order_number, status, subtotal, discount_amount, shipping_cost, 
        total_amount, currency, coupon_code, shipping_method,
        shipping_address, shipping_city, shipping_postal_code, shipping_country,
        billing_address, billing_city, billing_postal_code, billing_country
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id, order_number, status, subtotal, discount_amount, shipping_cost, 
                total_amount, currency, coupon_code, shipping_method, created_at`
    ).bind(
      authUser.id,
      order_number,
      'pending',
      subtotal,
      discount_amount,
      shipping_cost,
      total_amount,
      currency,
      validated_coupon_code || null,
      shipping_method,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_country || 'Nederland',
      billing_address || null,
      billing_city || null,
      billing_postal_code || null,
      billing_country || null
    ).first();

    if (!orderResult) {
      return c.json({ error: 'Failed to create order' }, 500);
    }

    // Create order items
    for (const item of items) {
      try {
        const personalizationData = item.personalization ? JSON.stringify(item.personalization) : null;
        
        await c.env.DB.prepare(
          `INSERT INTO order_items (
            order_id, product_id, product_name, quantity, unit_price, total_price, personalization_data
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          orderResult.id,
          item.product_id || 'unknown',
          item.product_name || 'Unknown Product',
          item.quantity || 1,
          item.unit_price || 0,
          item.total_price || (item.unit_price || 0) * (item.quantity || 1),
          personalizationData
        ).run();
      } catch (itemError) {
        console.error('Error inserting order item:', itemError, 'Item:', JSON.stringify(item));
        throw new Error(`Failed to insert order item: ${itemError}`);
      }
    }

    // Log coupon usage if coupon was applied
    if (couponId && validated_coupon_code) {
      await c.env.DB.prepare(
        `INSERT INTO coupon_usage (coupon_id, user_id, order_id)
         VALUES (?, ?, ?)`
      ).bind(couponId, authUser.id, orderResult.id).run();
    }

    // Send order confirmation emails (separate emails to customer and orders@sterrenverhalen.nl)
    if (c.env.BREVO_API_KEY) {
      try {
        // Get user info
        const user = await c.env.DB.prepare(
          'SELECT email, first_name, last_name FROM users WHERE id = ?'
        ).bind(authUser.id).first<{ email: string; first_name: string; last_name: string }>();

        if (user) {
          const customerName = `${user.first_name} ${user.last_name}`;
          const emailTemplate = getOrderConfirmationEmail(orderResult, customerName, 'nl');

          // Email 1: Send to customer
          const customerEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': c.env.BREVO_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sender: {
                name: 'Sterren Verhalen',
                email: 'orders@sterrenverhalen.nl'
              },
              to: [{ email: user.email, name: customerName }],
              subject: emailTemplate.subject,
              htmlContent: emailTemplate.htmlContent
            })
          });

          if (customerEmailResponse.ok) {
            console.log('Order confirmation email sent to customer:', user.email, orderResult.order_number);
          } else {
            const errorText = await customerEmailResponse.text();
            console.error('Failed to send customer confirmation:', errorText);
          }

          // Email 2: Send copy to orders@sterrenverhalen.nl
          const ordersEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': c.env.BREVO_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sender: {
                name: 'Sterren Verhalen',
                email: 'orders@sterrenverhalen.nl'
              },
              to: [{ email: 'orders@sterrenverhalen.nl', name: 'Sterren Verhalen Orders' }],
              subject: `[NIEUWE BESTELLING] ${emailTemplate.subject}`,
              htmlContent: `
                <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <h3 style="margin: 0; color: #856404;">🛒 Nieuwe Bestelling Ontvangen</h3>
                  <p style="margin: 5px 0 0 0;"><strong>Klant:</strong> ${customerName} (${user.email})</p>
                </div>
                ${emailTemplate.htmlContent}
              `
            })
          });

          if (ordersEmailResponse.ok) {
            console.log('Order notification sent to orders@sterrenverhalen.nl:', orderResult.order_number);
          } else {
            const errorText = await ordersEmailResponse.text();
            console.error('Failed to send orders notification:', errorText);
          }
        }
      } catch (emailError) {
        console.error('Error sending order confirmation emails:', emailError);
        // Don't fail order creation if email fails
      }
    }

    return c.json(orderResult, 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Send email to customer (admin only)
orders.post('/:id/send-email', authenticate, requireAdmin, async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const { subject, message } = body;

  if (!subject || !message) {
    return c.json({ error: 'Subject and message are required' }, 400);
  }

  if (!c.env.BREVO_API_KEY) {
    return c.json({ error: 'Email service not configured' }, 500);
  }

  try {
    // Get order with user info
    const order = await c.env.DB.prepare(
      `SELECT o.order_number, u.email, u.first_name, u.last_name
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`
    ).bind(orderId).first<{ order_number: string; email: string; first_name: string; last_name: string }>();

    if (!order || !order.email) {
      return c.json({ error: 'Order or customer email not found' }, 404);
    }

    const customerName = `${order.first_name} ${order.last_name}`;

    // Send email via Brevo
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': c.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Sterren Verhalen',
          email: 'orders@sterrenverhalen.nl'
        },
        to: [{ email: order.email, name: customerName }],
        subject: subject,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">Beste ${order.first_name},</h2>
            
            <div style="margin: 20px 0; white-space: pre-wrap;">${message}</div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666;">
              Dit bericht betreft bestelling: <strong>${order.order_number}</strong><br>
              Vragen? Neem contact met ons op via <a href="mailto:orders@sterrenverhalen.nl" style="color: #6366f1;">orders@sterrenverhalen.nl</a>
            </p>
            
            <p style="margin-top: 20px;">
              <strong>Met vriendelijke groet,</strong><br>
              Het Sterren Verhalen-team
            </p>
          </div>
        `
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Brevo email error:', errorText);
      return c.json({ error: 'Failed to send email' }, 500);
    }

    const emailData = await emailResponse.json();
    console.log('Admin email sent to customer:', order.email, emailData);

    return c.json({ message: 'Email sent successfully', messageId: emailData.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return c.json({ error: 'Failed to send email' }, 500);
  }
});

export default orders;

