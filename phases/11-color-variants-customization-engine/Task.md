# Task 11: Color Options & Variant Selection Engine

## Objective
Enable customers to preview and select from available color options on product cards and product detail pages. Persist selected colors into the cart item state, checkout order items, and admin fulfillment records.

## Scope of Work
1. **Color Variant Architecture**:
   - Products support an array of color definitions:
     ```json
     [
       { "name": "Onyx Black", "hex": "#09090B", "image": "https://..." },
       { "name": "Ivory Cream", "hex": "#FDFBF7", "image": "https://..." },
       { "name": "Camel Beige", "hex": "#C19A6B", "image": "https://..." }
     ]
     ```
   - Stored in `customizationOptions.colors` or top-level product attributes.
2. **Interactive Color Swatches**:
   - Render circular luxury swatches with tooltips showing color name.
   - Active swatch highlighted with a delicate concentric ring.
   - Clicking a swatch updates the preview image (if variant image exists) and sets `selectedColor`.
3. **Cart & Order Persistence**:
   - `CartItem` includes `color?: string`.
   - `OrderItem` includes `customizations.selectedColor` and reflects on checkout invoices and admin orders.

## Acceptance Criteria
- [ ] Users can pick color swatches on product cards and `/product/[id]`.
- [ ] Selected color is reflected in the cart toast, cart drawer, and checkout.
- [ ] Admin order details display the selected color alongside selected size.
