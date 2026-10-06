import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { User, UserProfile, CreateUserDTO, UpdateUserDTO } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserService {
  async register(userData: CreateUserDTO): Promise<{ user: UserProfile; token: string }> {
    const { email, password, first_name, last_name, phone, address, city, postal_code, country } = userData;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, postal_code, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, email, first_name, last_name, phone, address, city, postal_code, country, is_admin, is_active, created_at, updated_at`,
      [email, password_hash, first_name, last_name, phone, address, city, postal_code, country]
    );

    const user = result.rows[0] as UserProfile;
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0] as User;

    // Check if user is active
    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Remove password from response
    const { password_hash, ...userProfile } = user;
    const token = this.generateToken(userProfile);

    return { user: userProfile, token };
  }

  async getUserById(userId: number): Promise<UserProfile> {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, address, city, postal_code, country, 
              is_admin, is_active, created_at, updated_at, last_login
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0] as UserProfile;
  }

  async getAllUsers(page: number = 1, limit: number = 20, search?: string): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    let query = `SELECT id, email, first_name, last_name, phone, address, city, postal_code, country, 
                        is_admin, is_active, created_at, updated_at, last_login
                 FROM users`;
    let countQuery = 'SELECT COUNT(*) FROM users';
    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      const searchCondition = ` WHERE 
        email ILIKE $${paramIndex} OR 
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex}`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      users: usersResult.rows as UserProfile[],
      total,
      page,
      totalPages
    };
  }

  async updateUser(userId: number, updates: UpdateUserDTO): Promise<UserProfile> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, phone, address, city, postal_code, country, 
                 is_admin, is_active, created_at, updated_at, last_login`,
      values
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0] as UserProfile;
  }

  async toggleUserStatus(userId: number): Promise<UserProfile> {
    const result = await pool.query(
      `UPDATE users SET is_active = NOT is_active
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone, address, city, postal_code, country, 
                 is_admin, is_active, created_at, updated_at, last_login`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return result.rows[0] as UserProfile;
  }

  async deleteUser(userId: number): Promise<void> {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    
    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }
  }

  private generateToken(user: UserProfile): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin
    };
    
    const options = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    };

    // @ts-ignore - JWT types are complex
    return jwt.sign(payload, secret, options);
  }
}

