# Complete Admin Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Store Management](#store-management)
4. [Product Management](#product-management)
5. [Order Management](#order-management)
6. [Staff Management](#staff-management)
7. [Payment Management](#payment-management)
8. [Delivery Tracking](#delivery-tracking)
9. [Financial Reports](#financial-reports)
10. [Settings & Configuration](#settings--configuration)
11. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Super Admin Initial Setup

1. **Access Super Admin Panel**
   - Login with credentials provided during setup
   - Navigate to: https://yourdomain.com/admin/super-admin

2. **Create Your First Store**
   - Click "Create Store"
   - Fill in store details (name, description, currency)
   - Set store admin email and password
   - Click "Create Store"
   - Store admin will receive login credentials via email

3. **Assign Store Admin**
   - The store admin account is created automatically
   - They'll receive email with login link
   - They can then manage their own store

### Store Admin Login

1. Visit https://yourdomain.com/admin/login
2. Enter your email and password
3. For first login, you may need to verify your email
4. Complete your store profile setup

---

## Dashboard Overview

### Super Admin Dashboard

Shows:
- **Total Stores**: Number of active stores
- **Total Revenue**: Across all stores
- **Active Orders**: Orders in progress
- **Top Performing Stores**: By revenue

Actions:
- Create new store
- View all stores
- Manage store admins
- View system logs
- Configure payment gateways

### Store Admin Dashboard

Shows:
- **Total Revenue**: For your store
- **Orders Today**: New orders this day
- **Pending Deliveries**: Orders awaiting delivery
- **Customer Growth**: New customers chart

Quick Actions:
- View recent orders
- Manage products
- Create staff account
- View financial reports

---

## Store Management

### Create Store (Super Admin Only)

1. Click "Stores" in sidebar
2. Click "Create Store"
3. Fill in form:
   - Store name (unique)
   - Description
   - Currency (USD, EGP, etc.)
   - Logo upload
   - Admin email

4. Click "Create"
5. Store slug is auto-generated from name
6. Admin account created automatically
7. Admin receives welcome email with login link

### View All Stores

1. Click "Stores" in sidebar
2. See table with:
   - Store name
   - Total products
   - Total revenue
   - Active orders
   - Created date

3. Click store row to view details

### Edit Store Settings (Store Admin)

1. Go to Settings → Store Details
2. Edit:
   - Store name
   - Description
   - Logo & banner
   - Contact phone/email
   - Address & city
   - Timezone & language

3. Click "Save Changes"

### Configure Payment Methods

1. Go to Settings → Payment Methods
2. Enable/disable methods:
   - **Paymob**: Add API key and integration IDs
   - **Vodafone Cash**: Add merchant credentials
   - **InstaPay**: Add API key and merchant ID
   - **WhatsApp**: Add business account details

3. For each method, set:
   - Enable/disable toggle
   - Transaction fee (if any)
   - Instructions for customers

4. Click "Save Configuration"

---

## Product Management

### Create Product

1. Click "Products" in sidebar
2. Click "Add Product"
3. Fill in details:

   **Basic Info:**
   - Product name
   - Category
   - Description
   - Price

   **Media:**
   - Upload up to 5 images
   - Set primary image
   - Add video URL (optional)

   **Details:**
   - Stock quantity
   - SKU (optional)
   - Compare at price
   - Cost (for profitability tracking)

   **Themes:**
   - Add theme options (colors/designs)
   - For each theme:
     - Theme name
     - Color code
     - Preview image

4. Click "Save Product"
5. Toggle "Published" to make public

### Edit Product

1. Click "Products"
2. Find product in list
3. Click product row
4. Edit any details
5. Click "Save Changes"

### Bulk Actions

1. Click "Products"
2. Select multiple products (checkboxes)
3. Click "Bulk Actions" dropdown
4. Options:
   - Change price (increase/decrease percentage)
   - Change stock (set/increase/decrease)
   - Change category
   - Publish/Unpublish
   - Delete

5. Confirm action

### Product Analytics

1. Click product to view details
2. Scroll to "Performance" section
3. View:
   - Total sales
   - Total revenue
   - Average rating
   - Number of reviews
   - Stock remaining
   - 30-day sales trend

---

## Order Management

### View Orders

1. Click "Orders" in sidebar
2. See all orders with:
   - Order number
   - Customer name
   - Total amount
   - Order status
   - Payment status
   - Order date

3. Filter by:
   - Status (all, pending, confirmed, processing, etc.)
   - Payment status (unpaid, paid, refunded)
   - Date range
   - Customer name

### Order Details

1. Click order to open details
2. View:
   - **Order Items**: Products, quantities, themes/colors
   - **Customer Info**: Name, email, phone
   - **Shipping Address**: Full address details
   - **Timeline**: Status change history
   - **Payment**: Method, amount, status
   - **Delivery**: Tracking number, status, personnel assigned

3. Available actions:
   - Update status (confirm, process, cancel)
   - View payment details
   - Assign delivery personnel
   - Add notes
   - Print order

### Confirm Payment (WhatsApp)

When customer pays via WhatsApp:

1. Click order
2. Scroll to "Payment" section
3. Click "Confirm Payment"
4. Fill form:
   - Transaction ID (from payment proof)
   - Upload screenshot
   - Add notes (optional)

5. Click "Confirm"
6. Order status updates to "paid"
7. Delivery process can now start

### Cancel Order

1. Click order
2. Click "Cancel Order"
3. Select reason
4. If already paid, select refund method:
   - Same payment method
   - Alternative method
   - Manual refund (set custom date)

5. Click "Confirm Cancellation"

### Print Order/Invoice

1. Click order
2. Click "Print" button
3. Select what to print:
   - Order details
   - Invoice
   - Shipping label
   - Customer receipt

4. Click "Print" to open print dialog

---

## Staff Management

### Create Staff Account

1. Click "Staff" in Settings sidebar
2. Click "Invite Staff"
3. Select role:
   - **Accountant**: Access to financial reports
   - **Delivery Personnel**: Update delivery status
   - **Store Admin**: Full store management (select stores)

4. Enter staff details:
   - Email
   - First name
   - Last name
   - Phone (optional)

5. Click "Send Invitation"
6. Staff receives email with setup link
7. They click link to create password
8. Account is activated

### Manage Staff

1. Click "Staff" in Settings
2. See list of all staff with:
   - Name
   - Email
   - Role
   - Store assignment
   - Joined date
   - Last active date
   - Status (active/inactive)

3. Actions:
   - Click staff name to edit details
   - Change role assignment
   - Change store assignment
   - Disable account
   - Delete staff member

### Delivery Personnel Permissions

Delivery personnel can:
- View assigned orders
- Update delivery status
- Add delivery notes
- Upload delivery photos
- Track GPS location (if enabled)

Cannot:
- Modify order details
- Process payments
- Access financial data

---

## Payment Management

### View Payments

1. Click "Payments" in sidebar
2. See all payments with:
   - Order number
   - Payment method
   - Amount
   - Status
   - Date

3. Filter by:
   - Payment method (Paymob, Vodafone, InstaPay, WhatsApp)
   - Status (pending, completed, failed, refunded)
   - Date range
   - Amount range

### Refund Payment

1. Click "Payments"
2. Find payment to refund
3. Click payment row
4. Click "Refund"
5. Fill in:
   - Refund amount (defaults to full amount)
   - Reason
   - Refund method (original, alternative, manual)

6. Click "Process Refund"
7. Refund is processed to customer
8. Payment status changes to "refunded"

### Resolve Failed Payments

1. Click "Payments"
2. Filter by status "failed"
3. Click failed payment
4. View error details
5. Options:
   - Retry payment (customer retries)
   - Request manual payment (WhatsApp/email)
   - Contact payment provider
   - Cancel order

### Payment Gateway Settings

1. Go to Settings → Payment Methods
2. For each gateway, view:
   - Transaction fee
   - Success rate
   - Average processing time
   - Recent transactions

3. Test payment methods:
   - Paymob: Use test card 4012002000060016
   - Vodafone/InstaPay: Use test credentials

---

## Delivery Tracking

### View Deliveries

1. Click "Deliveries" in sidebar
2. See all deliveries with:
   - Tracking number
   - Order number
   - Customer name
   - Current status
   - Assigned personnel
   - Updated date

3. Filter by:
   - Status (pending, picked up, in transit, delivered, failed)
   - Personnel assigned
   - Date range

4. Click delivery to see full timeline

### Assign Delivery Personnel

1. Click order
2. Scroll to "Delivery" section
3. If not assigned, click "Assign Personnel"
4. Select from list:
   - Name
   - Phone
   - Vehicle type
   - Current load capacity

5. Click "Assign"
6. Personnel receives notification
7. They can accept or reject

### Track Delivery Status

Delivery lifecycle:

1. **Created** - Order confirmed and paid
2. **Processing** - Items being prepared for pickup
3. **Picked Up** - Delivery personnel collected package
4. **In Transit** - On the way to customer
5. **Delivered** - Successfully delivered to customer
6. **Failed** - Delivery attempt failed
7. **Returned** - Package returned to store

View real-time updates:
- Current status
- Last update time
- Personnel location (if GPS enabled)
- Customer signature (if digital)
- Delivery notes and photos

### Handle Delivery Issues

If delivery fails:

1. Click failed delivery
2. View failure reason
3. Options:
   - Reschedule for another date
   - Reassign to different personnel
   - Return to store
   - Contact customer

---

## Financial Reports

### View Dashboard

1. Click "Financial Reports" in sidebar
2. See overview:
   - Total revenue (selected period)
   - Total orders
   - Total refunds
   - Average order value
   - Refund rate

3. Charts:
   - Daily revenue trend
   - Order count trend
   - Payment method breakdown
   - Top products by revenue

### Generate Report

1. Click "Generate Report"
2. Select period:
   - Date range
   - Preset (today, week, month, quarter, year)

3. Select metrics to include:
   - Orders summary
   - Payment breakdown
   - Refund analysis
   - Product performance
   - Staff performance
   - Customer metrics

4. Select format:
   - PDF
   - CSV
   - Excel
   - Print

5. Click "Generate"
6. Download or view report

### Payment Method Breakdown

View in reports:
- Paymob card transactions
- Vodafone Cash transactions
- InstaPay transactions
- WhatsApp transactions
- Amount per method
- Count per method
- Average transaction value
- Success/failure rates

### Product Performance

View for each product:
- Total sales
- Total revenue
- Average price (with discounts)
- Customer reviews
- Return rate
- Most popular theme/color

### Export Data

1. Click "Exports" in Reports
2. Select what to export:
   - Orders (with items and customizations)
   - Payments (with transaction details)
   - Customers (with contact info)
   - Delivery tracking (with timeline)
   - Financial summary

3. Select date range and format
4. Click "Export"
5. Download file

---

## Settings & Configuration

### Store Details

1. Click Settings icon
2. Click "Store Details"
3. Edit:
   - Store name
   - Description
   - Logo & banner
   - Phone & email
   - Address
   - Timezone
   - Default language

4. Click "Save"

### Languages

1. Click Settings → Languages
2. Enable/disable languages:
   - English (en) - always enabled
   - Arabic (ar) - for Arabic storefront
   - French (fr) - optional

3. For each enabled language:
   - Translate store name and description
   - Set RTL for Arabic
   - Translate email templates

### Email Notifications

1. Click Settings → Email
2. Configure templates:
   - Order confirmation
   - Payment received
   - Order processing
   - Shipped notification
   - Delivery notification
   - Refund notification

3. For each template:
   - Edit subject and body
   - Preview email
   - Send test email

### SMS Notifications (Optional)

1. Click Settings → SMS
2. Enable/disable SMS
3. Configure messages:
   - Order confirmation
   - Payment reminder
   - Delivery update
   - Delivered confirmation

4. Set sending rules:
   - When to send
   - Which customers get SMS

### API Keys

1. Click Settings → API Keys
2. View existing keys
3. Create new key:
   - Name (for reference)
   - Permissions (read/write)
   - Scope (what can access)

4. Copy key to use in integrations
5. Regenerate key if compromised

---

## Troubleshooting

### Orders Not Appearing

**Problem**: New orders aren't showing in orders list

**Solutions**:
1. Refresh page (Ctrl+R)
2. Check store filter - make sure right store selected
3. Check order status filter - may be filtered out
4. Check date filter - may be outside selected date range
5. Clear all filters
6. Check Supabase connection status

### Payment Issues

**Problem**: Payment marked as failed

**Solutions**:
1. Check payment gateway settings are correct
2. Verify API keys are still valid
3. Check payment provider account status
4. Review error details in payment record
5. Contact payment provider support

**Problem**: WhatsApp payment not confirming

**Solutions**:
1. Check WhatsApp business account is active
2. Verify phone numbers are correct
3. Check WhatsApp API token is valid
4. Manually confirm payment via order details
5. Contact customer to resend payment proof

### Delivery Issues

**Problem**: Delivery personnel not updating status

**Solutions**:
1. Check personnel is assigned to order
2. Send reminder notification to personnel
3. Check internet connection on delivery app
4. Manually update status in admin panel
5. Reassign to different personnel

**Problem**: Delivery address not received

**Solutions**:
1. Check customer entered address correctly
2. Contact customer to verify address
3. Try to split address into correct fields
4. Use manual delivery note on order

### Staff Issues

**Problem**: Staff invitation expired

**Solutions**:
1. Create new invitation
2. Send new invite to same email
3. Old token becomes invalid

**Problem**: Staff can't login

**Solutions**:
1. Check staff account is active
2. Verify email address is correct
3. Check store assignment
4. Verify role is correct
5. Reset password via "Forgot Password"
6. Check browser cookies/cache

### Performance Issues

**Problem**: Dashboard loading slowly

**Solutions**:
1. Clear browser cache
2. Check internet connection
3. Try different browser
4. Check Supabase status page
5. Reduce date range for reports
6. Contact technical support

---

## Best Practices

1. **Order Processing**
   - Process orders within 24 hours
   - Communicate status changes to customers
   - Keep detailed delivery notes

2. **Payment Handling**
   - Verify WhatsApp payments immediately
   - Keep transaction records
   - Process refunds promptly

3. **Staff Management**
   - Create clear role assignments
   - Review staff activity regularly
   - Provide access only to needed data

4. **Financial Tracking**
   - Generate reports weekly/monthly
   - Monitor payment method performance
   - Track product profitability

5. **Customer Service**
   - Respond to issues quickly
   - Keep detailed order notes
   - Maintain professional communication
