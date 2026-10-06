# Newsletter Setup Guide with Brevo

This guide will help you set up the newsletter functionality with Brevo (formerly Sendinblue) integration.

## Features

- ✅ Email subscription management
- ✅ Automatic Brevo integration
- ✅ Local database backup of subscriptions
- ✅ Unsubscribe functionality
- ✅ Admin dashboard for viewing subscribers
- ✅ Newsletter statistics
- ✅ Sync with Brevo API

## Step 1: Get Brevo API Credentials

### 1. Create a Brevo Account

1. Go to https://www.brevo.com/
2. Sign up for a free account (up to 300 emails/day free)
3. Verify your email

### 2. Get Your API Key

1. Log in to Brevo
2. Go to **SMTP & API** section (top right menu → SMTP & API)
3. Click **API Keys** tab
4. Click **Generate a new API key**
5. Give it a name (e.g., "Storybook Wonder API")
6. Copy the API key (save it somewhere safe!)

### 3. Create a Contact List

1. In Brevo, go to **Contacts** section
2. Click **Lists**
3. Click **Create a list**
4. Name it "Newsletter Subscribers" or similar
5. After creation, note the **List ID** (visible in the URL or list details)

## Step 2: Configure Backend

### 1. Update Environment Variables

Edit `backend/.env`:

```env
# Brevo (Newsletter)
BREVO_API_KEY=xkeysib-your-actual-api-key-here
BREVO_LIST_ID=2
```

Replace:
- `xkeysib-your-actual-api-key-here` with your actual Brevo API key
- `2` with your actual Brevo list ID

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Run Newsletter Migration

```bash
npm run db:migrate:newsletter
```

This creates the `newsletter_subscriptions` table.

## Step 3: Test the Newsletter API

### Subscribe to Newsletter

**Using cURL:**
```bash
curl -X POST http://localhost:3001/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","first_name":"John","last_name":"Doe"}'
```

**Using PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    first_name = "John"
    last_name = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/newsletter/subscribe" -Method Post -Body $body -ContentType "application/json"
```

**Response:**
```json
{
  "message": "Successfully subscribed to newsletter",
  "subscription": {
    "email": "test@example.com",
    "subscribed_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Verify in Brevo

1. Go to Brevo dashboard
2. Navigate to **Contacts** → **Lists**
3. Open your newsletter list
4. You should see the new subscriber!

## API Endpoints

### Public Endpoints

#### POST `/api/newsletter/subscribe`
Subscribe to newsletter

**Request:**
```json
{
  "email": "user@example.com",
  "first_name": "John",     // optional
  "last_name": "Doe"         // optional
}
```

**Response:** `201 Created`
```json
{
  "message": "Successfully subscribed to newsletter",
  "subscription": {
    "email": "user@example.com",
    "subscribed_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST `/api/newsletter/unsubscribe`
Unsubscribe from newsletter

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Successfully unsubscribed from newsletter"
}
```

### Admin Endpoints (Require Authentication)

#### GET `/api/newsletter`
Get all newsletter subscriptions (paginated)

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page (default: 50)
- `subscribed` (optional): Filter by subscription status (true/false)

**Example:**
```bash
GET /api/newsletter?page=1&limit=50&subscribed=true
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "subscriptions": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "is_subscribed": true,
      "brevo_contact_id": "123456",
      "subscribed_at": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
```

#### GET `/api/newsletter/stats`
Get newsletter statistics

**Response:**
```json
{
  "total_subscriptions": 150,
  "active_subscriptions": 145,
  "unsubscribed": 5,
  "new_today": 3,
  "new_this_week": 15,
  "new_this_month": 48
}
```

#### DELETE `/api/newsletter/:email`
Delete a subscription (admin only)

**Example:**
```bash
DELETE /api/newsletter/user@example.com
Authorization: Bearer ADMIN_TOKEN
```

#### POST `/api/newsletter/sync-brevo`
Sync local subscriptions with Brevo

**Response:**
```json
{
  "message": "Sync completed",
  "synced": 10,
  "errors": 0
}
```

## Frontend Integration

### Subscribe Form Example (React)

```tsx
import { useState } from 'react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
        setFirstName('');
        setLastName('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <h3>Subscribe to Our Newsletter</h3>
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
      />
      
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name (optional)"
      />
      
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last name (optional)"
      />

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>

      {status === 'success' && <p className="success">{message}</p>}
      {status === 'error' && <p className="error">{message}</p>}
    </form>
  );
}
```

### Simple Footer Newsletter (React)

```tsx
export function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('✓ Subscribed successfully!');
        setEmail('');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Subscription failed');
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="footer-newsletter">
      <h4>Stay Updated</h4>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '...' : 'Subscribe'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
```

## Testing Endpoints

Add to your `backend/test-api.http`:

```http
### Newsletter Endpoints

### Subscribe to newsletter (public)
POST {{baseUrl}}/api/newsletter/subscribe
Content-Type: application/json

{
  "email": "newsletter@example.com",
  "first_name": "Newsletter",
  "last_name": "Subscriber"
}

### Unsubscribe from newsletter (public)
POST {{baseUrl}}/api/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "newsletter@example.com"
}

### Get all newsletter subscriptions (admin)
GET {{baseUrl}}/api/newsletter?page=1&limit=50
Authorization: Bearer {{token}}

### Get active subscriptions only (admin)
GET {{baseUrl}}/api/newsletter?subscribed=true
Authorization: Bearer {{token}}

### Get newsletter statistics (admin)
GET {{baseUrl}}/api/newsletter/stats
Authorization: Bearer {{token}}

### Sync with Brevo (admin)
POST {{baseUrl}}/api/newsletter/sync-brevo
Authorization: Bearer {{token}}

### Delete subscription (admin)
DELETE {{baseUrl}}/api/newsletter/newsletter@example.com
Authorization: Bearer {{token}}
```

## How It Works

1. **User subscribes** → Email stored in local database
2. **Automatically synced** → Contact added to Brevo list
3. **Brevo handles** → Email campaigns, automation, etc.
4. **User unsubscribes** → Removed from Brevo list, marked inactive locally
5. **Admin can view** → All subscriptions via API

## Benefits

- **Dual Storage**: Data stored both locally and in Brevo
- **Reliability**: Works even if Brevo API is temporarily down
- **Privacy**: You own the data in your database
- **Flexibility**: Can switch email providers easily
- **Analytics**: Track subscription growth over time

## Brevo Free Tier

- 300 emails per day
- Unlimited contacts
- Email campaigns
- Contact management
- Marketing automation
- SMTP relay

Perfect for starting out!

## Troubleshooting

### "Brevo is not configured" error
- Check that `BREVO_API_KEY` and `BREVO_LIST_ID` are set in `.env`
- Restart the server after updating `.env`

### Contact not appearing in Brevo
1. Check Brevo dashboard → Contacts → Lists
2. Verify the API key is correct
3. Verify the List ID is correct
4. Check server logs for errors
5. Try the sync endpoint: `POST /api/newsletter/sync-brevo`

### "Duplicate parameter" error
- Contact already exists in Brevo
- The system will automatically add them to the list instead

## Security Notes

- Never commit `.env` file with real API keys
- Use different API keys for development and production
- Brevo API keys start with `xkeysib-`
- Keep your API key secret!

## Next Steps

1. ✅ Add newsletter signup form to your website
2. ✅ Create welcome email campaign in Brevo
3. ✅ Set up email automation workflows
4. ✅ Design beautiful email templates
5. ✅ Monitor subscription growth via admin API

Enjoy your newsletter system! 🎉


