# Category & Subcategory Management System

## Overview
This implementation adds comprehensive category and subcategory management to the admin panel with full CRUD operations and bulk editing capabilities.

## Features Added

### 1. **Category Management Page** (`/admin/categories`)
- ✅ Create, Read, Update, Delete categories and subcategories
- ✅ Search and pagination
- ✅ Parent category selection for subcategories
- ✅ Product count and subcategory count display
- ✅ Visual distinction between main categories and subcategories
- ✅ Image URL support
- ✅ Automatic slug generation
- ✅ Protection against deleting categories with products or subcategories

### 2. **Enhanced Bulk Edit for Products**
- ✅ Separate dropdowns for main category and subcategory
- ✅ Dynamic subcategory loading based on selected main category
- ✅ Automatic category reset when switching main categories
- ✅ Support for assigning either main category or subcategory to products

### 3. **Updated Admin Navigation**
- ✅ New "Categories" menu item in admin sidebar
- ✅ FolderTree icon for easy identification

## Database Migration Required

**IMPORTANT:** Before using these features, you must run the database migration to add the `parent_category_id` column to the categories table.

### Option 1: Run SQL Script Directly (Recommended)

```bash
# If using PostgreSQL locally
psql -U your_username -d your_database -f scripts/04-add-subcategories.sql

# If using Neon Database (via connection string)
psql "your-neon-connection-string" -f scripts/04-add-subcategories.sql
```

### Option 2: Execute SQL Manually

Connect to your database and run:

```sql
-- Add parent_category_id column
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);
```

### Option 3: Using Database GUI Tools

If you're using a database management tool (e.g., pgAdmin, DBeaver, Neon Console):

1. Open the SQL editor
2. Copy the contents of `scripts/04-add-subcategories.sql`
3. Execute the script
4. Verify the column was added by checking the `categories` table schema

## Usage Guide

### Creating Main Categories

1. Navigate to **Admin Panel → Categories**
2. Click **"Add Category"** button
3. Fill in the form:
   - **Name**: Category name (e.g., "Electronics")
   - **Slug**: Auto-generated URL-friendly slug (e.g., "electronics")
   - **Parent Category**: Leave as "None (Main Category)"
   - **Description**: Optional description
   - **Image URL**: Optional category image
4. Click **"Create"**

### Creating Subcategories

1. Navigate to **Admin Panel → Categories**
2. Click **"Add Category"** button
3. Fill in the form:
   - **Name**: Subcategory name (e.g., "Laptops")
   - **Slug**: Auto-generated slug (e.g., "laptops")
   - **Parent Category**: Select a main category (e.g., "Electronics")
   - **Description**: Optional description
   - **Image URL**: Optional subcategory image
4. Click **"Create"**

### Editing Categories

1. In the categories list, click the **Edit** (pencil) icon
2. Modify any fields
3. Click **"Update"**

### Deleting Categories

1. Click the **Delete** (trash) icon next to a category
2. Confirm deletion

**Note:** You cannot delete:
- Categories that have products assigned to them
- Main categories that have subcategories
  
First reassign products or delete subcategories before deleting the parent category.

### Bulk Editing Products with Categories

1. Navigate to **Admin Panel → Products**
2. Select multiple products using checkboxes
3. Click **"Bulk Edit"** button
4. In the bulk edit dialog:
   - **Main Category**: Select a main category or "No change"
   - **Subcategory**: If the selected main category has subcategories, this dropdown will appear
   - Choose a subcategory or leave as "No change"
5. Click **"Apply Changes"**

**Behavior:**
- If you select only a main category, all selected products will be assigned to that category
- If you select a subcategory, all selected products will be assigned to that specific subcategory
- Subcategory selection overrides main category selection

## API Endpoints

### Categories

#### GET `/api/categories`
Get all categories with pagination and search support.

**Query Parameters:**
- `search` (optional): Search by category name
- `limit` (optional, default: 12, max: 12): Items per page
- `offset` (optional, default: 0): Pagination offset

**Response:**
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Electronics",
      "slug": "electronics",
      "description": "Electronic devices",
      "image_url": "https://...",
      "parent_category_id": null,
      "parent_category_name": null,
      "product_count": 45,
      "subcategory_count": 3,
      "created_at": "2026-01-04T..."
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 12,
    "offset": 0,
    "hasMore": true
  }
}
```

#### POST `/api/categories` (Admin only)
Create a new category or subcategory.

**Request Body:**
```json
{
  "name": "Laptops",
  "slug": "laptops",
  "description": "Laptop computers",
  "image_url": "https://...",
  "parent_category_id": 1  // null for main category
}
```

#### GET `/api/categories/[id]`
Get a single category by ID.

**Response:**
```json
{
  "category": {
    "id": 5,
    "name": "Laptops",
    "slug": "laptops",
    "parent_category_id": 1,
    "parent_category_name": "Electronics",
    "product_count": 12,
    "subcategory_count": 0
  }
}
```

#### PUT `/api/categories/[id]` (Admin only)
Update a category.

**Request Body:**
```json
{
  "name": "Updated Name",
  "slug": "updated-slug",
  "description": "Updated description",
  "image_url": "https://...",
  "parent_category_id": 2
}
```

**Validation:**
- Prevents circular references (category can't be its own parent)

#### DELETE `/api/categories/[id]` (Admin only)
Delete a category.

**Validation:**
- Returns 400 error if category has products
- Returns 400 error if main category has subcategories

## Files Changed/Added

### New Files
1. `app/admin/categories/page.tsx` - Category management UI
2. `app/api/categories/[id]/route.ts` - Single category CRUD endpoints
3. `scripts/04-add-subcategories.sql` - Database migration script
4. `CATEGORY_SUBCATEGORY_README.md` - This documentation file

### Modified Files
1. `app/api/categories/route.ts` - Updated to support parent_category_id
2. `app/admin/products/page.tsx` - Enhanced bulk edit with subcategory support
3. `app/admin/layout.tsx` - Added Categories menu item

## Data Model

```sql
categories
├── id                    SERIAL PRIMARY KEY
├── name                  TEXT NOT NULL UNIQUE
├── slug                  TEXT NOT NULL UNIQUE
├── description           TEXT
├── image_url             TEXT
├── parent_category_id    INTEGER REFERENCES categories(id) ON DELETE CASCADE  -- NEW
└── created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## Example Hierarchy

```
Electronics (Main Category)
├── Laptops (Subcategory)
├── Phones (Subcategory)
└── Accessories (Subcategory)

Fashion (Main Category)
├── Men's Clothing (Subcategory)
├── Women's Clothing (Subcategory)
└── Shoes (Subcategory)

Home & Garden (Main Category)
├── Furniture (Subcategory)
├── Decor (Subcategory)
└── Kitchen (Subcategory)
```

## UI Screenshots Reference

### Category List View
- Table with columns: Image, Name, Slug, Type, Products, Subcategories, Actions
- Main categories show badge "Main Category"
- Subcategories show badge "Subcategory" and parent name below
- Product count and subcategory count displayed

### Create/Edit Dialog
- Name field with auto-slug generation
- Slug field (editable)
- Parent Category dropdown (only shows main categories, excludes self)
- Description textarea
- Image URL input

### Bulk Edit Dialog (Products)
- Two-tiered category selection:
  - Main Category dropdown
  - Subcategory dropdown (appears only if main category has subcategories)
- Subcategory resets when main category changes

## Troubleshooting

### Error: "column c.parent_category_id does not exist"
**Solution:** Run the database migration script (see Database Migration Required section above)

### Error: "Cannot delete category with X products"
**Solution:** Reassign or delete products in that category first

### Error: "Cannot delete category with X subcategories"
**Solution:** Delete or reassign all subcategories first

### Subcategory dropdown not appearing in bulk edit
**Check:**
1. Did you select a main category first?
2. Does the selected main category have any subcategories?
3. Refresh the page to ensure latest data is loaded

## Performance Notes

- Index added on `parent_category_id` for fast subcategory queries
- Category list includes aggregated counts (products, subcategories)
- Limit of 1000 categories for bulk edit dropdowns (configurable)

## Future Enhancements (Optional)

- [ ] Multi-level category hierarchy (grandchildren, etc.)
- [ ] Drag-and-drop category reordering
- [ ] Category import/export (CSV)
- [ ] Category-specific SEO metadata
- [ ] Category visibility toggle
- [ ] Bulk delete categories
- [ ] Category analytics dashboard

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify database migration was run successfully
3. Check browser console for errors
4. Verify API responses in Network tab

---

**Last Updated:** January 4, 2026
**Version:** 1.0.0
