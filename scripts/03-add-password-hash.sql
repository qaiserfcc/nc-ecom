-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create an admin user (password: admin123)
-- Hash generated with bcrypt, 12 rounds
INSERT INTO users (email, name, password_hash, role) 
VALUES ('admin@namecheap.com', 'Admin User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.Ljt1SHtQSCjKxu', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.Ljt1SHtQSCjKxu', role = 'admin';

-- Create a demo customer (password: user123)
INSERT INTO users (email, name, password_hash, role)
VALUES ('user@namecheap.com', 'Dev Shopper', '$2b$12$E3P6DUjY3lhq3bdK7YPEhOGNGY6eGyE9m3MKYwyRNykpVErfzGM2C', 'customer')
ON CONFLICT (email) DO UPDATE SET password_hash = '$2b$12$E3P6DUjY3lhq3bdK7YPEhOGNGY6eGyE9m3MKYwyRNykpVErfzGM2C', role = 'customer';
