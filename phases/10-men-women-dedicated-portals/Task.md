# Task 10: Dedicated Men & Women Luxury Portals with Faceted Filtering

## Objective
Create dedicated high-fashion landing and collection pages for **Men** (`/men`) and **Women** (`/women`), each with tailored editorial aesthetics, curated categories, and multi-faceted filtering (categories, sizes, colors, price, collection status).

## Scope of Work
1. **Men's Atelier (`/men`)**:
   - Editorial hero banner with tailoring & modern menswear imagery.
   - Specific Categories: Tailoring & Suits, Cashmere Knitwear, Outerwear & Overcoats, Footwear, Leather Goods, Accessories.
   - Filter Bar: Category, Size (S to XXL), Color Swatches, Price Range, Collection (Current vs Archive).
   - Dynamic product query (`gender = 'men' OR gender = 'both'`).
2. **Women's Atelier (`/women`)**:
   - Editorial hero banner with haute couture & pr\u00eat-\u00e0-porter imagery.
   - Specific Categories: Gowns & Evening Dresses, Tailored Blazers, Silk Blouses & Tops, Fine Knitwear, Footwear, Handbags & Accessories.
   - Multi-faceted filtering tailored to women's apparel.
   - Dynamic product query (`gender = 'women' OR gender = 'both'`).
3. **Past Collections & Archive Portal (`/collections/past`)**:
   - Complete lookbook view for archival pieces marked as `isPastCollection`.
   - Storytelling narrative and timeless collectors' items.
4. **Header & Navigation Integration**:
   - Update `components/header.tsx` with direct links to `/women`, `/men`, `/collections/past`, and mobile navigation menu.

## Acceptance Criteria
- [ ] Navigating to `/men` loads the dedicated men's catalog with menswear filters.
- [ ] Navigating to `/women` loads the dedicated women's catalog with womenswear filters.
- [ ] Navigating to `/collections/past` displays archival and past collection garments.
- [ ] Multi-faceted filters dynamically refine products in real time.
