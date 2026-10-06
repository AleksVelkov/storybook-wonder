-- Seed data for Storybook Wonder

-- Create the admin user with: node worker/create-admin.js <email> <password>

-- Insert test customer
-- Password: customer123 (bcrypt hash for cost 10)
--INSERT INTO users (email, password_hash, first_name, last_name, phone, address, city, postal_code, country)
--VALUES ('customer@example.com', '$2b$10$xN8kLvJ5Qz5YhGGxJ5nQqYEOuN7rJ0Ej5OxYZ9pQeK5qLxvMzVjE', 'John', 'Doe', '+0987654321', '456 Customer Lane', 'Los Angeles', '90001', 'USA');

-- Insert sample products
--INSERT INTO products (title, description, price, currency, image_url, stock_quantity, is_active) VALUES
--('The Adventures of Emma', 'A magical story about a brave girl named Emma who discovers a secret garden.', 24.99, 'USD', '/book-emma.jpg', 100, 1),
--('Teddy''s Big Day', 'Join Teddy the bear on an exciting adventure through the forest.', 19.99, 'USD', '/book-teddy.jpg', 150, 1),
--('The Secret Garden', 'A beautifully illustrated tale of friendship and discovery.', 29.99, 'USD', '/book-garden.jpg', 75, 1),
--('Rabbit''s Rainbow', 'Follow Rabbit as he searches for the end of the rainbow.', 22.99, 'USD', '/book-rabbit.jpg', 120, 1),
--('Honey Bear''s Journey', 'A heartwarming story about finding your way home.', 26.99, 'USD', '/book-honey.jpg', 90, 1),
--('The Wise Wolf', 'Learn important life lessons from the wise wolf of the mountains.', 27.99, 'USD', '/book-wolf.jpg', 85, 1);

-- Insert a sample order
--INSERT INTO orders (user_id, order_number, status, total_amount, currency, shipping_address, shipping_city, shipping_postal_code, shipping_country)
--VALUES (2, 'ORD-' || strftime('%s', 'now') || '-2', 'processing', 69.97, 'USD', '456 Customer Lane', 'Los Angeles', '90001', 'USA');

-- Insert order items for the sample order
--INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
--VALUES 
--(1, 1, 'The Adventures of Emma', 2, 24.99, 49.98),
--(1, 2, 'Teddy''s Big Day', 1, 19.99, 19.99);

