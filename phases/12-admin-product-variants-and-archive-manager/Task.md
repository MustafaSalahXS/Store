# Task 12: Admin Product Management, Color/Size Editor & Archive Controller

## Objective
Upgrade the Admin Products portal (`/admin/products`) to provide full administrative control over adding, editing, and deleting products, managing color swatches, sizes, gender assignment, and toggling "Past Collection / Old Collection" vs "Current Collection" status.

## Scope of Work
1. **Admin Product Feed Overhaul**:
   - Integrate directly with Express API (`api.products.list()`, `api.products.create()`, `api.products.update()`, `api.products.delete()`).
   - Display color swatches, sizes, stock levels, and collection badges (Current vs Archival).
2. **Product Creation & Editing Modal**:
   - **Basic Info**: Name, SKU, Category, Gender (`men`, `women`, `both`), Price, Discount Price, Cost, Stock.
   - **Color Manager**: Interactive manager to add/remove color variants (Color Name + Hex Color Picker/Swatch + Optional Variant Image).
   - **Size Manager**: Multi-select or tag input for sizes (`XS`, `S`, `M`, `L`, `XL`, `XXL`, `Custom`).
   - **Collection Status Toggle**: Switch between **"New Arrivals / Current Season"** and **"Past Collection / Archive"**.
   - **Media Upload / URL**: Main image URL, gallery images, video URL.
   - **Fabric & Care**: Composition text (e.g. "100% Mongolian Cashmere, Dry Clean Only").
3. **One-Click Actions**:
   - Duplicate product, Archive/Unarchive, Toggle Active/Inactive, Delete with confirmation.

## Acceptance Criteria
- [ ] Store admins can create new products with customized colors, sizes, and collection status.
- [ ] Store admins can edit existing products to add new colors or change past collection status.
- [ ] Changes immediately reflect in the public storefront and gender portals.
