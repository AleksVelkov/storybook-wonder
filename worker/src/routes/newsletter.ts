import { Hono } from 'hono';
import { Env, AuthContext, NewsletterSubscription } from '../types';
import { authenticate, requireAdmin } from '../middleware/auth';

const newsletter = new Hono<{ Bindings: Env; Variables: AuthContext }>();

// Subscribe (public)
newsletter.post('/subscribe', async (c) => {
  const body = await c.req.json();
  const { email, first_name, last_name } = body;

  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  // Check if already subscribed
  const existing = await c.env.DB.prepare('SELECT * FROM newsletter_subscriptions WHERE email = ?')
    .bind(email)
    .first<NewsletterSubscription>();

  if (existing) {
    // If previously unsubscribed, resubscribe
    if (!existing.is_subscribed) {
      await c.env.DB.prepare(
        `UPDATE newsletter_subscriptions 
         SET is_subscribed = 1, 
             first_name = COALESCE(?, first_name),
             last_name = COALESCE(?, last_name),
             subscribed_at = datetime('now'),
             unsubscribed_at = NULL
         WHERE email = ?`
      ).bind(first_name || null, last_name || null, email).run();

      return c.json({
        message: 'Successfully resubscribed to newsletter',
        subscription: { email, subscribed_at: new Date().toISOString() }
      }, 201);
    }

    return c.json({ error: 'Email is already subscribed to newsletter' }, 409);
  }

  // Add to Brevo if configured
  let brevo_contact_id = null;
  if (c.env.BREVO_API_KEY && c.env.BREVO_LIST_ID) {
    try {
      const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': c.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          attributes: {
            FIRSTNAME: first_name || '',
            LASTNAME: last_name || ''
          },
          listIds: [parseInt(c.env.BREVO_LIST_ID)],
          updateEnabled: true
        })
      });

      if (brevoResponse.ok) {
        const brevoData = await brevoResponse.json() as any;
        brevo_contact_id = brevoData.id?.toString();
        console.log('Contact added to Brevo:', brevo_contact_id);
      } else {
        const errorData = await brevoResponse.text();
        console.log('Brevo contact error (might already exist):', brevoResponse.status, errorData);
      }

      // Send welcome email regardless of contact creation status
        try {
          const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'api-key': c.env.BREVO_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sender: {
                name: 'Sterren Verhalen',
                email: 'newsletter@sterrenverhalen.nl'
              },
              to: [{ email, name: first_name || 'Vriend' }],
              subject: 'Welkom bij onze verhalenwereld ✨',
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                  <h2 style="color: #6366f1;">Hallo${first_name ? ' ' + first_name : ''},</h2>
                  
                  <p>Wat fijn dat je je hebt ingeschreven voor onze nieuwsbrief!</p>
                  
                  <p>Vanaf nu houden we je op de hoogte van nieuwe kinderboeken, magische verhalen, luisterboeken en leuke verrassingen.</p>
                  
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
                    <p style="color: white; font-size: 16px; margin: 0 0 10px 0;">🎁 Als welkomstcadeau krijg je</p>
                    <p style="color: white; font-size: 28px; font-weight: bold; margin: 10px 0; letter-spacing: 2px;">10% KORTING</p>
                    <p style="color: white; font-size: 14px; margin: 10px 0 5px 0;">op je eerste bestelling met code:</p>
                    <div style="background: white; color: #667eea; font-size: 24px; font-weight: bold; padding: 12px 20px; border-radius: 5px; display: inline-block; margin-top: 10px; letter-spacing: 1px;">
                      NEWSLETTER10
                    </div>
                  </div>
                  
                  <p>Samen brengen we verhaaltjes tot leven — om voor te lezen, te luisteren en van te dromen. 🧸📖</p>
                  
                  <p style="text-align: center; margin: 30px 0;">
                    <a href="https://sterrenverhalen.nl/shop" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                      Ontdek onze boeken 📚
                    </a>
                  </p>
                  
                  <p>Dank je wel voor je vertrouwen en veel leesplezier!</p>
                  
                  <p style="margin-top: 30px;">
                    <strong>Hartelijke groet,</strong><br>
                    Het Sterren Verhalen-team
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                  
                  <p style="font-size: 12px; color: #666;">
                    Je ontvangt deze email omdat je je hebt ingeschreven voor onze nieuwsbrief via 
                    <a href="https://sterrenverhalen.nl" style="color: #6366f1;">sterrenverhalen.nl</a>
                  </p>
                </div>
              `,
              textContent: `
Hallo${first_name ? ' ' + first_name : ''},

Wat fijn dat je je hebt ingeschreven voor onze nieuwsbrief!
Vanaf nu houden we je op de hoogte van nieuwe kinderboeken, magische verhalen, luisterboeken en leuke verrassingen.

🎁 Als welkomstcadeau krijg je 10% KORTING op je eerste bestelling!

Gebruik code: NEWSLETTER10

Samen brengen we verhaaltjes tot leven — om voor te lezen, te luisteren en van te dromen. 🧸📖

Ontdek onze boeken: https://sterrenverhalen.nl/shop

Dank je wel voor je vertrouwen en veel leesplezier!

Hartelijke groet,
Het Sterren Verhalen-team

---
Je ontvangt deze email omdat je je hebt ingeschreven voor onze nieuwsbrief via sterrenverhalen.nl
              `
            })
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            console.error('Brevo email API error:', emailResponse.status, errorText);
          } else {
            const emailData = await emailResponse.json();
            console.log('Welcome email sent successfully:', emailData);
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the subscription if email fails
        }
    } catch (error) {
      console.error('Brevo error:', error);
      // Continue anyway
    }
  }

  // Insert subscription
  await c.env.DB.prepare(
    `INSERT INTO newsletter_subscriptions (email, first_name, last_name, brevo_contact_id)
     VALUES (?, ?, ?, ?)`
  ).bind(email, first_name || null, last_name || null, brevo_contact_id).run();

  return c.json({
    message: 'Successfully subscribed to newsletter',
    subscription: { email, subscribed_at: new Date().toISOString() }
  }, 201);
});

// Unsubscribe (public)
newsletter.post('/unsubscribe', async (c) => {
  const body = await c.req.json();
  const { email } = body;

  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  const result = await c.env.DB.prepare(
    `UPDATE newsletter_subscriptions
     SET is_subscribed = 0, unsubscribed_at = datetime('now')
     WHERE email = ?`
  ).bind(email).run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'Email not found in newsletter subscriptions' }, 404);
  }

  // Remove from Brevo if configured
  if (c.env.BREVO_API_KEY && c.env.BREVO_LIST_ID) {
    try {
      await fetch(`https://api.brevo.com/v3/contacts/lists/${c.env.BREVO_LIST_ID}/contacts/remove`, {
        method: 'POST',
        headers: {
          'api-key': c.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails: [email] })
      });
    } catch (error) {
      console.error('Brevo error:', error);
    }
  }

  return c.json({ message: 'Successfully unsubscribed from newsletter' });
});

// Get all subscriptions (admin)
newsletter.get('/', authenticate, requireAdmin, async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '50');
  const subscribed = c.req.query('subscribed');
  const offset = (page - 1) * limit;

  let query = 'SELECT * FROM newsletter_subscriptions';
  let countQuery = 'SELECT COUNT(*) as count FROM newsletter_subscriptions';
  const params: any[] = [];

  if (subscribed !== undefined) {
    query += ' WHERE is_subscribed = ?';
    countQuery += ' WHERE is_subscribed = ?';
    params.push(subscribed === 'true' ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const [subsResult, countResult] = await Promise.all([
    c.env.DB.prepare(query).bind(...params, limit, offset).all<NewsletterSubscription>(),
    c.env.DB.prepare(countQuery).bind(...params).first<{ count: number }>()
  ]);

  const total = countResult?.count || 0;
  const totalPages = Math.ceil(total / limit);

  return c.json({
    subscriptions: subsResult.results.map(s => ({ ...s, is_subscribed: !!s.is_subscribed })),
    total,
    page,
    totalPages
  });
});

// Get statistics (admin)
newsletter.get('/stats', authenticate, requireAdmin, async (c) => {
  const stats = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total_subscriptions,
      SUM(CASE WHEN is_subscribed = 1 THEN 1 ELSE 0 END) as active_subscriptions,
      SUM(CASE WHEN is_subscribed = 0 THEN 1 ELSE 0 END) as unsubscribed,
      SUM(CASE WHEN date(subscribed_at) = date('now') THEN 1 ELSE 0 END) as new_today,
      SUM(CASE WHEN date(subscribed_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as new_this_week,
      SUM(CASE WHEN date(subscribed_at) >= date('now', '-30 days') THEN 1 ELSE 0 END) as new_this_month
    FROM newsletter_subscriptions
  `).first();

  return c.json(stats || {});
});

// Delete subscription (admin)
newsletter.delete('/:email', authenticate, requireAdmin, async (c) => {
  const email = c.req.param('email');

  const result = await c.env.DB.prepare('DELETE FROM newsletter_subscriptions WHERE email = ? RETURNING id')
    .bind(email)
    .first();

  if (!result) {
    return c.json({ error: 'Email not found' }, 404);
  }

  return c.body(null, 204);
});

export default newsletter;

