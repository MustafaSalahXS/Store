# Task 09: Cart Toast, Quantity Counter & Dynamic Button States

## Objective
Implement a luxury informative toast notification when items are added to the bag, provide a quantity counter (`[- qty +]`) directly on product cards and product details, and transform the CTA button state dynamically to indicate the item is in the cart and provide a 1-click shortcut to view the bag.

## Scope of Work
1. **Informative Luxury Cart Toast**:
   - Component: `components/ui/cart-toast.tsx` or integrated into `CartProvider`.
   - Displays: Product thumbnail, name, selected color swatch, selected size, quantity added, unit price, and subtotal.
   - Action buttons: "View Bag & Checkout" (navigates to `/checkout`) and "Continue Browsing".
   - Smooth slide-in / fade-out animations using Framer Motion with an auto-dismiss progress bar.
2. **Product Quantity Counter**:
   - Incremental `[- qty +]` counter on `ProductCard` and `/product/[id]`.
   - Prevents negative or zero values (minimum 1, maximum available stock).
3. **Dynamic Button State Transformation**:
   - Initial State: "Add to Bag" (high-contrast black pill with bag icon).
   - In-Cart State: Switches dynamically to "In Bag • View Cart (qty)" or shows an active checkmark with bag icon.
   - Clicking when already in cart triggers the cart drawer or navigates to `/checkout`.

## Acceptance Criteria
- [ ] Adding an item to the cart immediately triggers the luxury informative toast.
- [ ] Quantity counter allows user to select 1, 2, 3... before adding to bag.
- [ ] Product card button dynamically indicates that the item is currently in the bag.
- [ ] Works across desktop and mobile devices.
