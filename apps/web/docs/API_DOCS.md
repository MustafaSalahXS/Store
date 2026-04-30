# Complete API Documentation

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Store APIs](#store-apis)
3. [Product APIs](#product-apis)
4. [Order APIs](#order-apis)
5. [Payment APIs](#payment-apis)
6. [Delivery APIs](#delivery-apis)
7. [User Management APIs](#user-management-apis)
8. [Accountant APIs](#accountant-apis)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

All requests require `Content-Type: application/json` header.

---

## Authentication APIs

### Register User

**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+201234567890"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "email_verified": false
  },
  "message": "Verification email sent. Please check your inbox."
}
```

**Errors:**
- `400`: Email already registered
- `422`: Invalid email format or weak password

---

### Login User

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "customer",
    "store_id": null
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

**Errors:**
- `401`: Invalid credentials
- `403`: Email not verified

---

### Verify Email

**Endpoint:** `POST /auth/verify-email`

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully. You can now login.",
  "verified": true
}
```

---

### Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600
}
```

---

### Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Store APIs

### Create Store (Super Admin Only)

**Endpoint:** `POST /stores`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "My Wedding Store",
  "description": "Premium wedding templates",
  "logo_url": "https://...",
  "currency": "USD",
  "admin_email": "admin@mystore.com",
  "admin_password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "id": "store-uuid",
  "name": "My Wedding Store",
  "slug": "my-wedding-store",
  "admin_user_id": "admin-uuid",
  "created_at": "2024-04-15T10:30:00Z"
}
```

---

### Get Store Details

**Endpoint:** `GET /stores/{store_id}`

**Response (200):**
```json
{
  "id": "store-uuid",
  "name": "My Wedding Store",
  "description": "Premium wedding templates",
  "logo_url": "https://...",
  "currency": "USD",
  "admin": {
    "id": "admin-uuid",
    "email": "admin@mystore.com",
    "first_name": "John"
  },
  "stats": {
    "total_products": 6,
    "total_orders": 42,
    "total_revenue": 2500.00
  }
}
```

---

### Update Store

**Endpoint:** `PUT /stores/{store_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "name": "Updated Store Name",
  "description": "Updated description",
  "logo_url": "https://..."
}
```

**Response (200):**
```json
{
  "id": "store-uuid",
  "name": "Updated Store Name",
  "description": "Updated description",
  "updated_at": "2024-04-15T11:00:00Z"
}
```

---

## Product APIs

### Create Product

**Endpoint:** `POST /stores/{store_id}/products`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "name": "Wedding Invitation Suite",
  "price": 49.99,
  "category": "invitations",
  "description": "Beautiful customizable templates",
  "images": [
    "https://cdn.../image1.jpg",
    "https://cdn.../image2.jpg"
  ],
  "video_url": "https://cdn.../video.mp4",
  "rating": 4.9,
  "stock": 100
}
```

**Response (201):**
```json
{
  "id": "product-uuid",
  "store_id": "store-uuid",
  "name": "Wedding Invitation Suite",
  "slug": "wedding-invitation-suite",
  "price": 49.99,
  "created_at": "2024-04-15T10:30:00Z"
}
```

---

### Get Products (Paginated)

**Endpoint:** `GET /stores/{store_id}/products?page=1&limit=12&sort=price&category=invitations`

**Response (200):**
```json
{
  "products": [
    {
      "id": "product-uuid",
      "name": "Wedding Invitation Suite",
      "price": 49.99,
      "category": "invitations",
      "rating": 4.9,
      "reviews": 128,
      "image_url": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "pages": 4
  }
}
```

---

### Get Product Details

**Endpoint:** `GET /products/{product_id}`

**Response (200):**
```json
{
  "id": "product-uuid",
  "store_id": "store-uuid",
  "name": "Wedding Invitation Suite",
  "price": 49.99,
  "description": "...",
  "images": ["https://...", "https://..."],
  "video_url": "https://...",
  "rating": 4.9,
  "reviews": 128,
  "stock": 85,
  "features": ["Feature 1", "Feature 2"],
  "created_at": "2024-04-15T10:30:00Z"
}
```

---

### Update Product

**Endpoint:** `PUT /products/{product_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "name": "Updated Product Name",
  "price": 59.99,
  "stock": 80
}
```

**Response (200):**
```json
{
  "id": "product-uuid",
  "name": "Updated Product Name",
  "updated_at": "2024-04-15T11:00:00Z"
}
```

---

### Delete Product

**Endpoint:** `DELETE /products/{product_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

---

## Order APIs

### Create Order

**Endpoint:** `POST /orders`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "store_id": "store-uuid",
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 2,
      "selected_theme": "light",
      "selected_color": "#ffffff",
      "customizations": {
        "size": "A4",
        "quantity": 100
      }
    }
  ],
  "shipping_address": {
    "full_name": "John Doe",
    "phone": "+201234567890",
    "city": "Cairo",
    "postal_code": "12345",
    "address": "123 Main Street"
  }
}
```

**Response (201):**
```json
{
  "id": "order-uuid",
  "order_number": "ORD-2024-001",
  "store_id": "store-uuid",
  "user_id": "user-uuid",
  "total_amount": 99.98,
  "status": "pending",
  "payment_status": "unpaid",
  "created_at": "2024-04-15T10:30:00Z"
}
```

---

### Get Order Status

**Endpoint:** `GET /orders/{order_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": "order-uuid",
  "order_number": "ORD-2024-001",
  "status": "processing",
  "payment_status": "paid",
  "items": [
    {
      "product_id": "product-uuid",
      "product_name": "Wedding Invitation Suite",
      "quantity": 2,
      "unit_price": 49.99,
      "selected_theme": "light",
      "selected_color": "#ffffff"
    }
  ],
  "delivery": {
    "status": "picked_up",
    "picked_up_at": "2024-04-16T09:00:00Z",
    "estimated_delivery": "2024-04-18T18:00:00Z",
    "tracking_number": "TRK-2024-001"
  }
}
```

---

### Get User Orders

**Endpoint:** `GET /orders?status=processing&limit=10`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "orders": [
    {
      "id": "order-uuid",
      "order_number": "ORD-2024-001",
      "total_amount": 99.98,
      "status": "processing",
      "created_at": "2024-04-15T10:30:00Z"
    }
  ]
}
```

---

## Payment APIs

### Initiate Payment

**Endpoint:** `POST /orders/{order_id}/payments`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "method": "paymob_card",
  "currency": "USD",
  "amount": 99.98
}
```

**Available Methods:**
- `paymob_card` - Credit/Debit card via Paymob
- `vodafone_cash` - Vodafone Cash wallet
- `instapay` - InstaPay wallet
- `whatsapp` - WhatsApp payment (admin confirms)

**Response (200):**
```json
{
  "id": "payment-uuid",
  "order_id": "order-uuid",
  "amount": 99.98,
  "currency": "USD",
  "method": "paymob_card",
  "status": "pending",
  "payment_url": "https://paymob.com/...",
  "expires_at": "2024-04-15T11:30:00Z"
}
```

---

### Confirm Payment (WhatsApp)

**Endpoint:** `POST /payments/{payment_id}/confirm`

**Headers:**
```
Authorization: Bearer {access_token}
X-Admin-Key: {admin_secret}
```

**Request:**
```json
{
  "transaction_id": "TXN-12345",
  "screenshot_url": "https://...",
  "notes": "Payment received via WhatsApp"
}
```

**Response (200):**
```json
{
  "id": "payment-uuid",
  "status": "completed",
  "confirmed_at": "2024-04-15T10:45:00Z",
  "transaction_id": "TXN-12345"
}
```

---

### Get Payment Status

**Endpoint:** `GET /payments/{payment_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": "payment-uuid",
  "order_id": "order-uuid",
  "amount": 99.98,
  "method": "paymob_card",
  "status": "completed",
  "transaction_id": "txn_123456",
  "completed_at": "2024-04-15T10:45:00Z"
}
```

---

## Delivery APIs

### Get Delivery Status

**Endpoint:** `GET /orders/{order_id}/delivery`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": "delivery-uuid",
  "order_id": "order-uuid",
  "status": "in_transit",
  "current_status": "in_transit",
  "timeline": [
    {
      "status": "created",
      "updated_at": "2024-04-15T10:30:00Z",
      "note": "Order created"
    },
    {
      "status": "processing",
      "updated_at": "2024-04-15T12:00:00Z",
      "note": "Order being processed"
    },
    {
      "status": "picked_up",
      "updated_at": "2024-04-16T09:00:00Z",
      "note": "Package picked up by delivery"
    },
    {
      "status": "in_transit",
      "updated_at": "2024-04-17T10:30:00Z",
      "note": "Out for delivery today"
    }
  ],
  "delivery_personnel": {
    "id": "personnel-uuid",
    "name": "Ahmed Hassan",
    "phone": "+201234567890",
    "vehicle": "Motorcycle"
  },
  "tracking_number": "TRK-2024-001",
  "estimated_delivery": "2024-04-18T18:00:00Z"
}
```

---

### Update Delivery Status (Delivery Personnel)

**Endpoint:** `PUT /deliveries/{delivery_id}/status`

**Headers:**
```
Authorization: Bearer {access_token}
X-Personnel-Token: {personnel_token}
```

**Request:**
```json
{
  "status": "in_transit",
  "note": "Out for delivery, arriving in 2 hours",
  "location": {
    "latitude": 30.0444,
    "longitude": 31.2357,
    "accuracy": 10
  },
  "photo_url": "https://..."
}
```

**Status Values:**
- `created` - Order created
- `processing` - Being prepared
- `picked_up` - Picked up by delivery
- `in_transit` - On the way
- `delivered` - Successfully delivered
- `delivery_failed` - Delivery attempt failed
- `returned` - Returned to store

**Response (200):**
```json
{
  "id": "delivery-uuid",
  "status": "in_transit",
  "updated_at": "2024-04-17T10:30:00Z",
  "updated_by": "personnel-uuid"
}
```

---

## User Management APIs

### Create Staff Account (Admin Only)

**Endpoint:** `POST /stores/{store_id}/staff`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "email": "accountant@store.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "accountant",
  "phone": "+201234567890"
}
```

**Role Values:**
- `accountant` - Financial management access
- `delivery_personnel` - Delivery tracking updates
- `store_admin` - Full store management (limited stores)

**Response (201):**
```json
{
  "id": "user-uuid",
  "email": "accountant@store.com",
  "role": "accountant",
  "store_id": "store-uuid",
  "invite_token": "invite_token_...",
  "invite_url": "https://yoursite.com/accept-invite/invite_token_...",
  "created_at": "2024-04-15T10:30:00Z"
}
```

---

### Accept Staff Invitation

**Endpoint:** `POST /staff/accept-invite`

**Request:**
```json
{
  "invite_token": "invite_token_...",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "accountant@store.com",
    "role": "accountant",
    "store_id": "store-uuid"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Get Staff List (Admin Only)

**Endpoint:** `GET /stores/{store_id}/staff?role=accountant`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "staff": [
    {
      "id": "user-uuid",
      "email": "accountant@store.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "role": "accountant",
      "phone": "+201234567890",
      "joined_at": "2024-04-15T10:30:00Z",
      "last_active": "2024-04-18T14:20:00Z"
    }
  ]
}
```

---

## Accountant APIs

### Get Financial Dashboard

**Endpoint:** `GET /stores/{store_id}/financials/dashboard`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "period": "2024-04",
  "total_revenue": 15000.00,
  "total_orders": 125,
  "total_refunds": 500.00,
  "payment_methods": {
    "paymob_card": {
      "amount": 8000.00,
      "count": 60,
      "percentage": 53.3
    },
    "vodafone_cash": {
      "amount": 4000.00,
      "count": 35,
      "percentage": 26.7
    },
    "instapay": {
      "amount": 2000.00,
      "count": 20,
      "percentage": 13.3
    },
    "whatsapp": {
      "amount": 1000.00,
      "count": 10,
      "percentage": 6.7
    }
  },
  "top_products": [
    {
      "product_id": "product-uuid",
      "name": "Wedding Invitation Suite",
      "sales": 45,
      "revenue": 2249.55
    }
  ]
}
```

---

### Export Financial Report

**Endpoint:** `POST /stores/{store_id}/financials/export`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "format": "csv",
  "start_date": "2024-04-01",
  "end_date": "2024-04-30",
  "include": ["orders", "payments", "refunds"]
}
```

**Response (200):**
```json
{
  "download_url": "https://cdn.../report_2024_04.csv",
  "generated_at": "2024-04-18T15:30:00Z",
  "file_size": "2.5MB"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": true,
  "code": "INVALID_REQUEST",
  "message": "Human-readable error message",
  "details": {
    "field": "email",
    "reason": "Email already exists"
  },
  "timestamp": "2024-04-15T10:30:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `INVALID_REQUEST` | 400 | Invalid request body or parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `VALIDATION_ERROR` | 422 | Validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

### Limits by Endpoint Type

- **Authentication**: 5 requests per minute per IP
- **Product APIs**: 100 requests per minute per user
- **Order APIs**: 30 requests per minute per user
- **Payment APIs**: 10 requests per minute per user
- **Admin APIs**: 50 requests per minute per user

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1713171000
```

When rate limited, response is:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again in 45 seconds.",
  "retry_after": 45
}
```

---

## Webhooks

### Payment Confirmation Webhook

Paymob sends notifications to `https://yoursite.com/api/webhooks/paymob`

```json
{
  "transaction_id": "txn_123456",
  "order_id": "order-uuid",
  "amount": 99.98,
  "currency": "USD",
  "status": "success",
  "timestamp": "2024-04-15T10:45:00Z"
}
```

### Delivery Status Webhook

Sent to customer email/SMS:

```json
{
  "event": "delivery_status_changed",
  "order_id": "order-uuid",
  "status": "in_transit",
  "message": "Your order is out for delivery",
  "timestamp": "2024-04-17T10:30:00Z"
}
```

---

## Testing

Use provided Postman collection: `api-collection.postman_json`

Or test with curl:

```bash
# Get store details
curl -X GET https://api.yoursite.com/stores/store-uuid \
  -H "Authorization: Bearer {access_token}"

# Create order
curl -X POST https://api.yoursite.com/orders \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d @order-request.json
```
