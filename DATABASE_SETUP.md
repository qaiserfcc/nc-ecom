# Database Setup Instructions

## Overview
This document provides instructions for setting up the database and running migrations for the e-commerce platform.

## Environment Setup

### 1. Neon PostgreSQL Connection

The project uses **Neon** PostgreSQL serverless database. Your connection details should be in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="your-secret-key"
```

These are automatically pulled by Vercel CLI during deployment.

## Running Database Schema

### Option 1: Using Neon SQL Editor

1. Go to your Neon project dashboard
2. Click on "SQL Editor"
3. Create a new query
4. Copy and paste the contents of `/scripts/01-create-schema.sql`
5. Click "Run"

### Option 2: Using psql Command Line

```bash
# Connect to your Neon database
psql "postgresql://user:password@host/database?sslmode=require" < scripts/01-create-schema.sql
```

### Option 3: Using Neon CLI

```bash
# Install Neon CLI (if not already installed)
npm install -g @neondatabase/cli

# Connect to your project
neon auth

# Run the schema script
neon query < scripts/01-create-schema.sql
```

## What the Schema Creates

The `01-create-schema.sql` script creates:

1. **users** - User accounts with authentication and profiles
2. **categories** - Product categories
3. **products** - Product catalog with pricing and inventory
4. **product_images** - Additional images for products
5. **product_variants** - Product variants (size, color, etc.)
6. **product_reviews** - Customer reviews
7. **carts** - Shopping carts
8. **cart_items** - Items in shopping carts
9. **orders** - Customer orders
10. **order_items** - Items in orders
11. **wishlists** - User wishlists
12. **wishlist_items** - Items in wishlists
13. **discounts** - Discount codes
14. **analytics** - User behavior analytics
15. **homepage_banners** - Homepage promotional banners (NEW)

## Banner Table Details

The new `homepage_banners` table has been added with the following structure:

```sql
CREATE TABLE IF NOT EXISTS homepage_banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_banners_active ON homepage_banners(is_active);
CREATE INDEX idx_banners_sort ON homepage_banners(sort_order);
```

### Fields:
- **id**: Unique identifier (auto-incremented)
- **title**: Banner title/heading (required)
- **description**: Optional description text
- **image_url**: URL to banner image (required)
- **link_url**: Optional link when banner is clicked
- **is_active**: Toggle banner visibility (default: true)
- **sort_order**: Display order (lower = earlier)
- **created_at**: Creation timestamp
- **updated_at**: Last update timestamp

## Verification

After running the schema, verify the tables were created:

```bash
# Connect to your database
psql "postgresql://user:password@host/database?sslmode=require"

# List all tables
\dt

# Check homepage_banners structure
\d homepage_banners
```

You should see output like:
```
           Table "public.homepage_banners"
    Column    |            Type             | Modifiers
--------------+-----------------------------+-----------
 id           | integer                     | not null
 title        | text                        | not null
 description  | text                        |
 image_url    | text                        | not null
 link_url     | text                        |
 is_active    | boolean                     | default true
 sort_order   | integer                     | default 0
 created_at   | timestamp                   | default now()
 updated_at   | timestamp                   | default now()
```

## Sample Data

To add sample banners for testing:

```sql
INSERT INTO homepage_banners (title, description, image_url, link_url, sort_order)
VALUES 
  ('Summer Sale', 'Up to 50% off on summer collection', '/images/summer-banner.jpg', '/shop?category=summer', 0),
  ('New Arrivals', 'Check out our latest products', '/images/new-arrivals-banner.jpg', '/shop?sort=newest', 1),
  ('Flash Deal', 'Limited time offers', '/images/flash-deal-banner.jpg', '/shop?deals=true', 2);
```

## Connection String Formats

### Pooled Connection (Recommended for Apps)
```
postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```

### Unpooled Connection (For Migrations)
```
postgresql://user:password@host.region.aws.neon.tech/database?sslmode=require
```

## Environment Variables in Vercel

When deploying to Vercel, ensure these environment variables are set:

1. Go to **Project Settings > Environment Variables**
2. Add or verify:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - Any other environment variables needed

These will be pulled automatically during the build process.

## Troubleshooting

### Connection Timeout
- Check your IP is whitelisted in Neon (usually automatic)
- Verify the connection string is correct
- Ensure `sslmode=require` is included

### "No database connection string" Error
- Make sure `.env.local` has `DATABASE_URL` set
- In Vercel, check Environment Variables are set
- Use the pooled connection string for applications

### Permission Denied
- Verify the PostgreSQL user has proper permissions
- Check the username and password are correct
- Ensure the user can create tables and indexes

### SSL Certificate Issues
- Always use `sslmode=require` for Neon
- For local development, you may need `sslmode=prefer`

## Next Steps

1. ✅ Run the schema script to create tables
2. ✅ Verify tables were created (see Verification section)
3. ✅ Add sample data if desired
4. ✅ Test the API endpoints
5. ✅ Set environment variables in Vercel
6. ✅ Deploy to production

---

For more information, see:
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Project FEATURES.md](./FEATURES.md) - Feature implementation guide
- [API Endpoints](./README.md) - API documentation
