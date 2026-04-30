# DigitalStore Admin Guide

A comprehensive guide for managing your store through the Admin Dashboard.

---

## Table of Contents

1. [Coupon Management](#coupon-management)
2. [CSV Bulk Product Import/Export](#csv-bulk-product-importexport)
3. [Quick Reference](#quick-reference)

---

## Coupon Management

### Creating a Coupon

1. Navigate to the **Admin Dashboard** → **Coupons** tab.
2. Click **"New Coupon"** in the top-right corner.
3. Fill in the form:
   - **Coupon Code**: A unique alphanumeric code (e.g., `SUMMER25`). Automatically uppercased.
   - **Discount Type**: Choose between:
     - `Percentage (%)` — e.g., 15% off the cart subtotal.
     - `Fixed Amount` — e.g., 50 EGP off the cart subtotal.
   - **Value**: The numeric discount value (e.g., `15` for 15% or `50` for 50 EGP).
   - **Usage Limit** *(optional)*: Maximum number of times this coupon can be used. Leave blank for unlimited.
   - **Expiry Date** *(optional)*: The coupon will automatically become invalid after this date.
   - **Active**: Toggle whether the coupon is currently usable.
4. Click **"Create Coupon"**.

### Editing a Coupon

1. Find the coupon in the table.
2. Click the **pencil icon** (Edit) on the right.
3. Modify the fields and click **"Update Coupon"**.

### Deleting a Coupon

1. Click the **trash icon** (Delete) on the right side of the coupon row.
2. Confirm the deletion in the dialog.

### How Customers Use Coupons

1. At checkout, customers see a **"Promo Code"** input field in the cart step.
2. They type their code and click **"Apply"**.
3. If valid, the discount is shown in the **Order Summary** sidebar and deducted from the total.
4. They can click **"Remove"** to remove a previously applied coupon.

---

## CSV Bulk Product Import/Export

### Overview

The CSV system allows you to manage your entire product catalog in a spreadsheet. You can:
- **Export** all current products to a `.csv` file
- **Import** products from a `.csv` file (creates new products or updates existing ones by SKU)
- **Download a template** with correct column headers and an example row

### Accessing CSV Controls

Go to **Admin Dashboard** → **Inventory** tab. You'll see three buttons at the top:
- 📄 **Template** — Downloads a blank CSV with correct headers + 1 example row
- ⬇️ **Export** — Downloads all products in your database as CSV
- ⬆️ **Import** — Opens file picker to upload a `.csv` file

### CSV Column Reference

| Column | Type | Required | Description | Example |
|--------|------|----------|-------------|---------|
| `name` | text | ✅ | Product display name | `Premium T-Shirt` |
| `description` | text | | Product description (can contain commas if quoted) | `A soft cotton shirt` |
| `price` | number | ✅ | Selling price | `299.99` |
| `category` | text | | Category label | `Clothing` |
| `stock` | integer | | Quantity in stock | `50` |
| `sku` | text | | Unique product identifier for updates | `TSH-001` |
| `cost` | number | | Your cost price (for profit tracking) | `150` |
| `isActive` | boolean | | Whether product is visible on storefront | `true` |
| `image` | URL | | Main product image URL | `https://...` |
| `videoUrl` | URL | | Product video URL | `https://...` |
| `discountActive` | boolean | | Whether discount is currently enabled | `false` |
| `discountPercentage` | number | | Discount percentage (0-100) | `20` |
| `sizes` | text | | Available sizes, separated by semicolons (`;`) | `S;M;L;XL` |
| `gender` | text | | Target gender: `both`, `male`, or `female` | `both` |
| `isAccessory` | boolean | | Mark as accessory product | `false` |
| `isFootwear` | boolean | | Mark as footwear product | `false` |
| `isCurated` | boolean | | Feature in curated collections | `false` |
| `hasCounter` | boolean | | Show quantity counter on product page | `true` |
| `ctaText` | text | | Call-to-action button text | `Add to Cart` |
| `directCheckout` | boolean | | Skip cart and go to checkout directly | `false` |
| `trackStock` | boolean | | Enable stock tracking | `true` |

### Workflow: Adding Products in Bulk

1. Click **"Template"** to download the template CSV file.
2. Open it in **Excel**, **Google Sheets**, or any spreadsheet app.
3. Fill in your product rows (one product per row). Keep the header row as-is.
4. Save the file as `.csv` (CSV UTF-8 format).
5. Back in the Admin Dashboard, click **"Import"** and select your file.
6. A summary will show how many products were created/updated, and any errors.

### Update vs. Create Logic

- If a row has a **`sku` value** that matches an existing product, that product is **updated**.
- If the `sku` doesn't match any existing product, or is empty, a **new product is created**.

> **Tip**: Always assign unique SKUs to your products if you plan to update them via CSV.

### Exporting Products

1. Click **"Export"** to download all products as a CSV.
2. Open in any spreadsheet application to review or modify.
3. Re-import the modified file to apply bulk changes.

---

## Quick Reference

| Feature | Location | Shortcut |
|---------|----------|----------|
| Create coupon | Admin → Coupons → New Coupon | — |
| Import products | Admin → Inventory → Import | — |
| Export products | Admin → Inventory → Export | — |
| Download template | Admin → Inventory → Template | — |
| Apply coupon (customer) | Checkout → Cart step → Promo Code | — |

---

*Last updated: April 2025*
