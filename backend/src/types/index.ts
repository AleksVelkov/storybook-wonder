export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
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
  created_at: Date;
  updated_at: Date;
  shipped_at?: Date;
  delivered_at?: Date;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  image_url?: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OrderWithDetails extends Order {
  user_email?: string;
  user_name?: string;
  items?: OrderItem[];
}

export interface CreateUserDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface UpdateUserDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface CreateOrderDTO {
  user_id: number;
  items: {
    product_id: number;
    quantity: number;
  }[];
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  billing_address?: string;
  billing_city?: string;
  billing_postal_code?: string;
  billing_country?: string;
  notes?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  notes?: string;
}


