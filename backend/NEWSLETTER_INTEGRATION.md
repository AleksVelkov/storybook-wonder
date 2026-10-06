# Newsletter Frontend Integration Examples

Complete examples for integrating newsletter subscription in your React/TypeScript frontend.

## Quick Integration

### 1. Simple Footer Newsletter Form

```tsx
import { useState } from 'react';

export function NewsletterFooter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Thank you for subscribing!');
        setEmail('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error');
    }
  };

  return (
    <div className="newsletter-footer">
      <h3>Stay Updated</h3>
      <p>Subscribe to our newsletter for the latest stories and special offers</p>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading'}
        />
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {status === 'success' && <p className="success-message">{message}</p>}
      {status === 'error' && <p className="error-message">{message}</p>}
    </div>
  );
}
```

### 2. Full Newsletter Modal/Popup

```tsx
import { useState } from 'react';
import { X } from 'lucide-react';

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Welcome! Check your email for a confirmation.');
        setTimeout(() => {
          onClose();
          setStatus('idle');
          setFormData({ email: '', firstName: '', lastName: '' });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>

        <h2>Join Our Newsletter</h2>
        <p>Get the latest children's books and special offers delivered to your inbox.</p>

        {status === 'success' ? (
          <div className="success-state">
            <h3>🎉 Welcome!</h3>
            <p>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
                disabled={status === 'loading'}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                  disabled={status === 'loading'}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            {status === 'error' && <p className="error-message">{message}</p>}

            <button type="submit" disabled={status === 'loading'} className="submit-button">
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

### 3. Newsletter API Service

Create a reusable service:

```typescript
// services/newsletterApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface NewsletterSubscription {
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface NewsletterResponse {
  message: string;
  subscription?: {
    email: string;
    subscribed_at: string;
  };
}

export const newsletterApi = {
  async subscribe(data: NewsletterSubscription): Promise<NewsletterResponse> {
    const response = await fetch(`${API_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Subscription failed');
    }

    return result;
  },

  async unsubscribe(email: string): Promise<NewsletterResponse> {
    const response = await fetch(`${API_URL}/api/newsletter/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unsubscribe failed');
    }

    return result;
  },
};
```

### 4. Using the Service

```tsx
import { useState } from 'react';
import { newsletterApi } from '../services/newsletterApi';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await newsletterApi.subscribe({ email });
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {success && <p>Successfully subscribed!</p>}
      {error && <p>{error}</p>}
    </form>
  );
}
```

### 5. With ShadCN UI Components

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { newsletterApi } from '@/services/newsletterApi';

export function NewsletterCard() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await newsletterApi.subscribe({
        email,
        first_name: firstName,
        last_name: lastName,
      });
      setSuccess(true);
      setEmail('');
      setFirstName('');
      setLastName('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Subscribe to Our Newsletter</CardTitle>
        <CardDescription>
          Get the latest children's books and exclusive offers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4">
            <AlertDescription>
              Thank you for subscribing! Check your email for confirmation.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 6. Inline Newsletter (Hero Section)

```tsx
import { useState } from 'react';

export function HeroNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="hero-newsletter">
      <h2>Join 10,000+ Happy Readers</h2>
      <p>Get weekly book recommendations and exclusive offers</p>
      
      <form onSubmit={handleSubmit} className="inline-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <button type="submit" disabled={status === 'loading' || status === 'success'}>
          {status === 'loading' && 'Subscribing...'}
          {status === 'success' && '✓ Subscribed!'}
          {status === 'idle' && 'Get Started'}
          {status === 'error' && 'Try Again'}
        </button>
      </form>

      {status === 'success' && (
        <p className="success-text">Thank you! Check your email.</p>
      )}
    </div>
  );
}
```

### 7. Environment Configuration

Create `.env.local` in your frontend:

```env
VITE_API_URL=http://localhost:3001
```

For production:

```env
VITE_API_URL=https://api.yourdomain.com
```

### 8. Admin Newsletter Dashboard

```tsx
import { useEffect, useState } from 'react';

interface NewsletterStats {
  total_subscriptions: number;
  active_subscriptions: number;
  unsubscribed: number;
  new_today: number;
  new_this_week: number;
  new_this_month: number;
}

export function NewsletterDashboard() {
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/newsletter/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>Failed to load stats</div>;

  return (
    <div className="newsletter-dashboard">
      <h2>Newsletter Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Subscribers</h3>
          <p className="stat-value">{stats.total_subscriptions}</p>
        </div>

        <div className="stat-card">
          <h3>Active</h3>
          <p className="stat-value">{stats.active_subscriptions}</p>
        </div>

        <div className="stat-card">
          <h3>New Today</h3>
          <p className="stat-value">{stats.new_today}</p>
        </div>

        <div className="stat-card">
          <h3>New This Week</h3>
          <p className="stat-value">{stats.new_this_week}</p>
        </div>

        <div className="stat-card">
          <h3>New This Month</h3>
          <p className="stat-value">{stats.new_this_month}</p>
        </div>

        <div className="stat-card">
          <h3>Unsubscribed</h3>
          <p className="stat-value">{stats.unsubscribed}</p>
        </div>
      </div>
    </div>
  );
}
```

## Styling Examples

### Basic CSS

```css
.newsletter-footer {
  padding: 2rem;
  background: #f8f9fa;
  text-align: center;
}

.newsletter-footer form {
  display: flex;
  gap: 0.5rem;
  max-width: 500px;
  margin: 1rem auto 0;
}

.newsletter-footer input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.newsletter-footer button {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.newsletter-footer button:hover {
  background: #0056b3;
}

.newsletter-footer button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  color: #28a745;
  margin-top: 0.5rem;
}

.error-message {
  color: #dc3545;
  margin-top: 0.5rem;
}
```

## Best Practices

1. **Always validate email format** on frontend before sending
2. **Handle errors gracefully** with user-friendly messages
3. **Show loading states** during API calls
4. **Clear form after success** to improve UX
5. **Display success confirmation** clearly
6. **Make it mobile-responsive**
7. **Add privacy policy link** near subscribe button
8. **Use environment variables** for API URL
9. **Test error scenarios** (network errors, duplicate subscriptions)
10. **Make unsubscribe easily accessible**

That's it! Choose the implementation that best fits your design and integrate it into your website. 🎉


