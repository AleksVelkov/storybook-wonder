import axios from 'axios';
import { pool } from '../config/database.js';
import { NewsletterSubscription, SubscribeNewsletterDTO, BrevoContactResponse } from '../types/newsletter.js';
import { AppError } from '../middleware/errorHandler.js';

export class NewsletterService {
  private brevoApiKey: string;
  private brevoListId: string;
  private brevoApiUrl = 'https://api.brevo.com/v3';

  constructor() {
    this.brevoApiKey = process.env.BREVO_API_KEY || '';
    this.brevoListId = process.env.BREVO_LIST_ID || '';

    if (!this.brevoApiKey) {
      console.warn('⚠️  BREVO_API_KEY is not configured. Newsletter functionality will be limited.');
    }
    if (!this.brevoListId) {
      console.warn('⚠️  BREVO_LIST_ID is not configured. Newsletter functionality will be limited.');
    }
  }

  async subscribe(subscriptionData: SubscribeNewsletterDTO): Promise<NewsletterSubscription> {
    const { email, first_name, last_name } = subscriptionData;

    // Check if already subscribed
    const existing = await pool.query(
      'SELECT * FROM newsletter_subscriptions WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      const subscription = existing.rows[0];
      
      // If previously unsubscribed, resubscribe
      if (!subscription.is_subscribed) {
        return this.resubscribe(email, first_name, last_name);
      }
      
      throw new AppError('Email is already subscribed to newsletter', 409);
    }

    // Add to Brevo if configured
    let brevoContactId: string | undefined;
    if (this.brevoApiKey && this.brevoListId) {
      try {
        const brevoContact = await this.addToBrevo(email, first_name, last_name);
        brevoContactId = brevoContact.id.toString();
      } catch (error) {
        console.error('Failed to add contact to Brevo:', error);
        // Continue anyway - we'll store locally
      }
    }

    // Store in database
    const result = await pool.query(
      `INSERT INTO newsletter_subscriptions (email, first_name, last_name, is_subscribed, brevo_contact_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, first_name, last_name, true, brevoContactId]
    );

    return result.rows[0] as NewsletterSubscription;
  }

  async unsubscribe(email: string): Promise<NewsletterSubscription> {
    const result = await pool.query(
      `UPDATE newsletter_subscriptions
       SET is_subscribed = FALSE, unsubscribed_at = CURRENT_TIMESTAMP
       WHERE email = $1
       RETURNING *`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AppError('Email not found in newsletter subscriptions', 404);
    }

    const subscription = result.rows[0];

    // Remove from Brevo if configured
    if (this.brevoApiKey && subscription.brevo_contact_id) {
      try {
        await this.removeFromBrevoList(email);
      } catch (error) {
        console.error('Failed to remove contact from Brevo list:', error);
        // Continue anyway - local unsubscribe succeeded
      }
    }

    return subscription as NewsletterSubscription;
  }

  private async resubscribe(email: string, first_name?: string, last_name?: string): Promise<NewsletterSubscription> {
    const result = await pool.query(
      `UPDATE newsletter_subscriptions
       SET is_subscribed = TRUE, 
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           subscribed_at = CURRENT_TIMESTAMP,
           unsubscribed_at = NULL
       WHERE email = $1
       RETURNING *`,
      [email, first_name, last_name]
    );

    const subscription = result.rows[0];

    // Re-add to Brevo list if configured
    if (this.brevoApiKey && this.brevoListId) {
      try {
        await this.addToBrevoList(email);
      } catch (error) {
        console.error('Failed to re-add contact to Brevo list:', error);
      }
    }

    return subscription as NewsletterSubscription;
  }

  async getAllSubscriptions(
    page: number = 1,
    limit: number = 50,
    subscribed?: boolean
  ): Promise<{
    subscriptions: NewsletterSubscription[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM newsletter_subscriptions';
    let countQuery = 'SELECT COUNT(*) FROM newsletter_subscriptions';
    const params: any[] = [];
    let paramIndex = 1;

    if (subscribed !== undefined) {
      const whereClause = ` WHERE is_subscribed = $${paramIndex}`;
      query += whereClause;
      countQuery += whereClause;
      params.push(subscribed);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [subscriptionsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, subscribed !== undefined ? [subscribed] : [])
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      subscriptions: subscriptionsResult.rows as NewsletterSubscription[],
      total,
      page,
      totalPages
    };
  }

  async getStats(): Promise<{
    total_subscriptions: number;
    active_subscriptions: number;
    unsubscribed: number;
    new_today: number;
    new_this_week: number;
    new_this_month: number;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN is_subscribed = TRUE THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN is_subscribed = FALSE THEN 1 END) as unsubscribed,
        COUNT(CASE WHEN subscribed_at >= CURRENT_DATE THEN 1 END) as new_today,
        COUNT(CASE WHEN subscribed_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_this_week,
        COUNT(CASE WHEN subscribed_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month
      FROM newsletter_subscriptions
    `);

    return result.rows[0];
  }

  async deleteSubscription(email: string): Promise<void> {
    const subscription = await pool.query(
      'SELECT brevo_contact_id FROM newsletter_subscriptions WHERE email = $1',
      [email]
    );

    if (subscription.rows.length === 0) {
      throw new AppError('Email not found in newsletter subscriptions', 404);
    }

    // Delete from Brevo if configured
    if (this.brevoApiKey && subscription.rows[0].brevo_contact_id) {
      try {
        await this.deleteFromBrevo(email);
      } catch (error) {
        console.error('Failed to delete contact from Brevo:', error);
        // Continue anyway
      }
    }

    // Delete from database
    await pool.query('DELETE FROM newsletter_subscriptions WHERE email = $1', [email]);
  }

  // Brevo API Methods
  private async addToBrevo(email: string, firstName?: string, lastName?: string): Promise<BrevoContactResponse> {
    try {
      const response = await axios.post(
        `${this.brevoApiUrl}/contacts`,
        {
          email,
          attributes: {
            FIRSTNAME: firstName || '',
            LASTNAME: lastName || ''
          },
          listIds: [parseInt(this.brevoListId)],
          updateEnabled: true
        },
        {
          headers: {
            'api-key': this.brevoApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.code === 'duplicate_parameter') {
        // Contact already exists, try to add to list instead
        await this.addToBrevoList(email);
        // Fetch the contact to get the ID
        const contact = await this.getBrevoContact(email);
        return contact;
      }
      throw error;
    }
  }

  private async addToBrevoList(email: string): Promise<void> {
    await axios.post(
      `${this.brevoApiUrl}/contacts/lists/${this.brevoListId}/contacts/add`,
      {
        emails: [email]
      },
      {
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  private async removeFromBrevoList(email: string): Promise<void> {
    await axios.post(
      `${this.brevoApiUrl}/contacts/lists/${this.brevoListId}/contacts/remove`,
      {
        emails: [email]
      },
      {
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  private async getBrevoContact(email: string): Promise<BrevoContactResponse> {
    const response = await axios.get(
      `${this.brevoApiUrl}/contacts/${encodeURIComponent(email)}`,
      {
        headers: {
          'api-key': this.brevoApiKey
        }
      }
    );
    return response.data;
  }

  private async deleteFromBrevo(email: string): Promise<void> {
    await axios.delete(
      `${this.brevoApiUrl}/contacts/${encodeURIComponent(email)}`,
      {
        headers: {
          'api-key': this.brevoApiKey
        }
      }
    );
  }

  async syncWithBrevo(): Promise<{ synced: number; errors: number }> {
    if (!this.brevoApiKey || !this.brevoListId) {
      throw new AppError('Brevo is not configured', 400);
    }

    const subscriptions = await pool.query(
      'SELECT * FROM newsletter_subscriptions WHERE is_subscribed = TRUE AND brevo_contact_id IS NULL'
    );

    let synced = 0;
    let errors = 0;

    for (const subscription of subscriptions.rows) {
      try {
        const brevoContact = await this.addToBrevo(
          subscription.email,
          subscription.first_name,
          subscription.last_name
        );

        await pool.query(
          'UPDATE newsletter_subscriptions SET brevo_contact_id = $1 WHERE id = $2',
          [brevoContact.id.toString(), subscription.id]
        );

        synced++;
      } catch (error) {
        console.error(`Failed to sync ${subscription.email}:`, error);
        errors++;
      }
    }

    return { synced, errors };
  }
}


