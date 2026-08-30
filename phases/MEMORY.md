# Project Memory, Data Schemas & Operational Rules

## 1. Product Model & Variant Contract

```prisma
model Product {
  id                   String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name                 String
  description          String?
  price                Decimal     @db.Decimal(10, 2)
  discountPrice        Decimal?    @map("discount_price") @db.Decimal(10, 2)
  cost                 Decimal?    @db.Decimal(10, 2)
  category             String?
  sku                  String?
  stock                Int         @default(0)
  isActive             Boolean     @default(true) @map("is_active")
  images               String[]    @default([])
  image                String?
  videoUrl             String?     @map("video_url")
  customizable         Boolean     @default(false)
  customizationOptions Json?       @map("customization_options")
  hasCounter           Boolean     @default(true) @map("has_counter")
  ctaText              String      @default("Add to Cart") @map("cta_text")
  directCheckout       Boolean     @default(false) @map("direct_checkout")
  trackStock           Boolean     @default(true) @map("track_stock")
  discountActive       Boolean     @default(false) @map("discount_active")
  discountPercentage   Int         @default(0) @map("discount_percentage")
  sizes                String[]    @default([])
  gender               String      @default("both") // "men" | "women" | "both"
  isAccessory          Boolean     @default(false) @map("is_accessory")
  isFootwear           Boolean     @default(false) @map("is_footwear")
  isCurated            Boolean     @default(false) @map("is_curated")
  createdAt            DateTime    @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt            DateTime    @default(now()) @updatedAt @map("updated_at") @db.Timestamptz(6)
  orderItems           OrderItem[]

  @@map("products")
}
```

### JSON Customization Schema (`customizationOptions`)
```json
{
  "colors": [
    { "name": "Onyx Black", "hex": "#09090B", "image": "https://..." },
    { "name": "Ivory Cream", "hex": "#FDFBF7", "image": "https://..." }
  ],
  "isPastCollection": false,
  "season": "Autumn/Winter 2024",
  "fabric": {
    "composition": "100% Virgin Wool",
    "care": "Dry Clean Only",
    "origin": "Italy"
  }
}
```

---

## 2. Cart & Toast State Protocol

```typescript
export interface CartItem {
  productId: string
  product: Product
  quantity: number
  size?: string
  color?: string
  customizations?: Record<string, any>
  addedAt: string
}

export interface CartToastData {
  product: Product
  quantity: number
  size?: string
  color?: string
}
```

---

## 3. Operational Rules
1. **Zero-Lock Database Policy**: Avoid running `prisma generate` while the dev process is running on Windows to prevent `EPERM` dll lock errors.
2. **Strict Admin Access Control**: Route `/admin/products` checks `['admin', 'super_admin', 'store_admin']`.
3. **Cart Button Reactivity**: When an item is added to the cart, the button on that product card instantly updates state without requiring a full page refresh.
