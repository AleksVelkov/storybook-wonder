export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BREVO_API_KEY?: string;
  BREVO_LIST_ID?: string;
  ALLOWED_ORIGINS: string;
  RATE_LIMIT_REQUESTS: string;
  RATE_LIMIT_WINDOW: string;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  house_number?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_admin: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  house_number?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  stock_quantity: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  currency: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_address?: string;
  billing_city?: string;
  billing_postal_code?: string;
  billing_country?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface NewsletterSubscription {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_subscribed: number;
  brevo_contact_id?: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface JWTPayload {
  id: number;
  email: string;
  is_admin: boolean;
}

export interface AuthContext {
  user?: JWTPayload;
}

