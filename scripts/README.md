# Database Scripts

This directory contains SQL migration scripts and a database initialization tool for the NC E-commerce project.

## 📁 Files

- **`01-create-schema.sql`** - Creates all database tables, indexes, and constraints
- **`02-seed-data.sql`** - Populates the database with sample data (categories, products, bundles, brands, discounts)
- **`03-add-password-hash.sql`** - Adds password hash column and creates admin user
- **`init-db.ts`** - Automated script to run all SQL files in order

## 🚀 Quick Start

### Prerequisites

1. Ensure you have a Neon database set up
2. Add your database connection string to `.env`:
   ```env
   DATABASE_URL=postgres://username:password@host/database
   ```

### Initialize Database

Run all migrations with a single command:

```bash
npm install tsx  # Install tsx if not already installed
npm run db:init
```

Or directly:

```bash
tsx scripts/init-db.ts
```

## ✨ Features

### Idempotent Design

All scripts are designed to be **idempotent** - you can run them multiple times safely without errors:

- **Schema Creation**: Uses `CREATE TABLE IF NOT EXISTS`
- **Seed Data**: Uses `ON CONFLICT DO NOTHING` for all INSERT statements
- **User Setup**: Uses `ON CONFLICT DO UPDATE` for admin user

### Automatic Error Handling

The initialization script:
- ✅ Tests database connection before running migrations
- ✅ Executes scripts in the correct order
- ✅ Handles duplicate entries gracefully
- ✅ Provides clear success/error messages
- ✅ Stops execution on critical errors

### Security

- Database credentials are masked in console output
- Uses environment variables for connection strings
- Bcrypt-hashed passwords for admin users

## 📝 What Gets Created

### Tables
- `users` - User accounts with authentication
- `categories` - Product categories
- `products` - Product catalog with pricing and inventory
- `product_images` - Additional product images
- `product_variants` - Product variations (size, color, etc.)
- `wishlists` - User wishlist items
- `cart_items` - Shopping cart items
- `orders` - Customer orders
- `order_items` - Order line items
- `discounts` - Promotional codes
- `analytics` - User behavior tracking
- `brand_partnerships` - Brand partner information
- `product_bundles` - Product bundle definitions
- `bundle_items` - Bundle contents
- `homepage_banners` - Homepage promotional banners

### Sample Data
- 4 product categories (Skincare, Haircare, Foods & Supplements, Cosmetics)
- 18 sample products across all categories
- 3 product bundles with items
- 5 brand partnerships
- 2 discount codes (WELCOME20, BUNDLE10)
- 1 admin user (email: `admin@namecheap.com`, password: `admin123`)

## 🔧 Manual Execution

If you prefer to run scripts individually:

```bash
# Using psql
psql $DATABASE_URL -f scripts/01-create-schema.sql
psql $DATABASE_URL -f scripts/02-seed-data.sql
psql $DATABASE_URL -f scripts/03-add-password-hash.sql
```

## 🧹 Reset Database

To completely reset your database:

```sql
-- Drop all tables (be careful!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Then run the init script
npm run db:init
```

## 📊 Verify Installation

After running the initialization script, verify your database:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check sample data
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM product_bundles;
SELECT COUNT(*) FROM brand_partnerships;

-- Test admin login
SELECT email, role FROM users WHERE role = 'admin';
```

## ⚠️ Troubleshooting

### Connection Error
```
❌ Error: DATABASE_URL environment variable is not set
```
**Solution**: Add `DATABASE_URL` to your `.env` file

### Permission Denied
```
ERROR: permission denied for schema public
```
**Solution**: Ensure your database user has CREATE privileges

### Duplicate Key Errors (First Run)
If you see duplicate key errors on first run, your database may already have data. The script will skip existing entries automatically.

## 🔐 Default Admin Credentials

After initialization, you can log in with:
- **Email**: `admin@namecheap.com`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password immediately in production!

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
