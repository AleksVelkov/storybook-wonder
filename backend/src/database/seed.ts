import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, is_admin, phone, address, city, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO NOTHING
    `, [
      'admin@storybookwonder.com',
      adminPassword,
      'Admin',
      'User',
      true,
      '+1234567890',
      '123 Admin Street',
      'New York',
      '10001',
      'USA'
    ]);
    console.log('✅ Admin user created');

    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 10);
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, postal_code, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (email) DO NOTHING
    `, [
      'customer@example.com',
      customerPassword,
      'John',
      'Doe',
      '+0987654321',
      '456 Customer Lane',
      'Los Angeles',
      '90001',
      'USA'
    ]);
    console.log('✅ Test customer created');

    // Insert sample products
    const products = [
      {
        title: 'The Adventures of Emma',
        description: 'A magical story about a brave girl named Emma who discovers a secret garden.',
        price: 24.99,
        image_url: '/book-emma.jpg',
        stock: 100
      },
      {
        title: 'Teddy\'s Big Day',
        description: 'Join Teddy the bear on an exciting adventure through the forest.',
        price: 19.99,
        image_url: '/book-teddy.jpg',
        stock: 150
      },
      {
        title: 'The Secret Garden',
        description: 'A beautifully illustrated tale of friendship and discovery.',
        price: 29.99,
        image_url: '/book-garden.jpg',
        stock: 75
      },
      {
        title: 'Rabbit\'s Rainbow',
        description: 'Follow Rabbit as he searches for the end of the rainbow.',
        price: 22.99,
        image_url: '/book-rabbit.jpg',
        stock: 120
      },
      {
        title: 'Honey Bear\'s Journey',
        description: 'A heartwarming story about finding your way home.',
        price: 26.99,
        image_url: '/book-honey.jpg',
        stock: 90
      },
      {
        title: 'The Wise Wolf',
        description: 'Learn important life lessons from the wise wolf of the mountains.',
        price: 27.99,
        image_url: '/book-wolf.jpg',
        stock: 85
      }
    ];

    for (const product of products) {
      await pool.query(`
        INSERT INTO products (title, description, price, currency, image_url, stock_quantity, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        product.title,
        product.description,
        product.price,
        'USD',
        product.image_url,
        product.stock,
        true
      ]);
    }
    console.log('✅ Sample products created');

    // Create sample orders
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', ['customer@example.com']);
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      const productResult = await pool.query('SELECT id, title, price FROM products LIMIT 2');
      
      if (productResult.rows.length >= 2) {
        const orderNumber = `ORD-${Date.now()}`;
        const totalAmount = productResult.rows.reduce((sum, p) => sum + parseFloat(p.price), 0);
        
        const orderResult = await pool.query(`
          INSERT INTO orders (
            user_id, order_number, status, total_amount, currency,
            shipping_address, shipping_city, shipping_postal_code, shipping_country
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          userId,
          orderNumber,
          'processing',
          totalAmount,
          'USD',
          '456 Customer Lane',
          'Los Angeles',
          '90001',
          'USA'
        ]);

        const orderId = orderResult.rows[0].id;

        for (const product of productResult.rows) {
          await pool.query(`
            INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            orderId,
            product.id,
            product.title,
            1,
            product.price,
            product.price
          ]);
        }

        console.log('✅ Sample order created');
      }
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();


