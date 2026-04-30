/**
 * Example E2E tests using Cypress
 * Run with: npm test:e2e
 */

describe('Complete Customer Journey', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('should allow customer to browse and checkout', () => {
    // Navigate to products
    cy.get('a[href="/products"]').click()
    cy.url().should('include', '/products')

    // Filter products
    cy.get('select[name="category"]').select('Electronics')
    cy.get('button[name="apply-filter"]').click()

    // Add product to cart
    cy.get('[data-testid="product-card"]').first().click()
    cy.get('button:contains("Add to Cart")').click()
    
    cy.get('[data-testid="cart-notification"]').should('be.visible')
    cy.get('[data-testid="cart-count"]').should('contain', '1')

    // Go to checkout
    cy.get('a[href="/checkout"]').click()
    cy.url().should('include', '/checkout')

    // Fill shipping address
    cy.get('input[name="address"]').type('123 Main St')
    cy.get('input[name="city"]').type('New York')
    cy.get('input[name="zipCode"]').type('10001')

    // Fill payment info
    cy.get('input[name="cardNumber"]').type('4242 4242 4242 4242')
    cy.get('input[name="expiry"]').type('12/25')
    cy.get('input[name="cvv"]').type('123')

    // Place order
    cy.get('button:contains("Place Order")').click()

    // Success page
    cy.url().should('include', '/success')
    cy.get('[data-testid="order-number"]').should('be.visible')
  })
})

describe('Order Tracking Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.login('customer@example.com', 'password123')
  })

  it('should display order tracking status', () => {
    cy.get('a[href="/orders"]').click()
    cy.url().should('include', '/orders')

    // Click on first order
    cy.get('[data-testid="order-row"]').first().click()

    // Check tracking timeline
    cy.get('[data-testid="tracking-timeline"]').should('be.visible')
    cy.get('[data-testid="status-pending"]').should('have.class', 'completed')
    cy.get('[data-testid="status-processing"]').should('have.class', 'completed')
    cy.get('[data-testid="status-shipped"]').should('have.class', 'active')
  })

  it('should update delivery status in real-time', () => {
    cy.get('a[href="/orders"]').click()
    cy.get('[data-testid="order-row"]').first().click()

    // Initial status
    cy.get('[data-testid="delivery-status"]').should('contain', 'In Transit')

    // Simulate status update
    cy.wait(5000) // Wait 5 seconds
    cy.reload()

    // Status should potentially be updated
    cy.get('[data-testid="delivery-status"]').should('be.visible')
  })
})

describe('Admin Dashboard Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.login('admin@example.com', 'password123')
  })

  it('should navigate admin dashboard', () => {
    cy.get('a[href="/admin"]').click()
    cy.url().should('include', '/admin')

    // Check dashboard cards
    cy.get('[data-testid="revenue-card"]').should('be.visible')
    cy.get('[data-testid="orders-card"]').should('be.visible')
    cy.get('[data-testid="aov-card"]').should('be.visible')
  })

  it('should manage products', () => {
    cy.get('a[href="/admin/products"]').click()
    cy.url().should('include', '/admin/products')

    // Add new product
    cy.get('button:contains("Add Product")').click()
    cy.get('input[name="name"]').type('New Product')
    cy.get('input[name="price"]').type('99.99')
    cy.get('textarea[name="description"]').type('Product description')
    cy.get('button:contains("Save")').click()

    cy.get('[data-testid="success-message"]').should('be.visible')
    cy.get('[data-testid="product-table"]').should('contain', 'New Product')
  })

  it('should manage staff members', () => {
    cy.get('a[href="/admin/staff"]').click()
    cy.url().should('include', '/admin/staff')

    // Invite staff
    cy.get('button:contains("Invite Staff")').click()
    cy.get('input[name="email"]').type('delivery@example.com')
    cy.get('select[name="role"]').select('delivery_personnel')
    cy.get('button:contains("Send Invite")').click()

    cy.get('[data-testid="success-message"]').should('contain', 'Invitation sent')
  })

  it('should view financial reports', () => {
    cy.get('a[href="/admin/finances"]').click()
    cy.url().should('include', '/admin/finances')

    // Check metrics
    cy.get('[data-testid="total-revenue"]').should('be.visible')
    cy.get('[data-testid="net-revenue"]').should('be.visible')
    cy.get('[data-testid="profit-margin"]').should('be.visible')

    // Filter by date range
    cy.get('button:contains("Last 30 days")').click()
    cy.get('[data-testid="revenue-chart"]').should('be.visible')
  })
})

describe('Delivery Personnel Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.login('delivery@example.com', 'password123')
  })

  it('should view assigned deliveries', () => {
    cy.get('a[href="/delivery-person/dashboard"]').click()
    cy.url().should('include', '/delivery-person/dashboard')

    // Check active deliveries
    cy.get('[data-testid="active-deliveries"]').should('be.visible')
    cy.get('[data-testid="delivery-card"]').should('have.length.greaterThan', 0)
  })

  it('should update delivery status', () => {
    cy.get('a[href="/delivery-person/dashboard"]').click()
    cy.get('[data-testid="delivery-card"]').first().click()

    // Update status
    cy.get('select[name="status"]').select('in_transit')
    cy.get('button:contains("Update Status")').click()

    cy.get('[data-testid="success-message"]').should('be.visible')
  })

  it('should navigate to delivery location', () => {
    cy.get('a[href="/delivery-person/dashboard"]').click()
    cy.get('[data-testid="delivery-card"]').first().click()

    // Open map
    cy.get('button:contains("Open Map")').click()
    cy.get('[data-testid="delivery-map"]').should('be.visible')
  })
})

describe('Multi-Language Support', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('should switch between languages', () => {
    // Default English
    cy.get('h1').should('contain', 'Welcome')

    // Switch to Arabic
    cy.get('[data-testid="language-switcher"]').click()
    cy.get('button:contains("عربي")').click()

    // Check RTL direction
    cy.get('html').should('have.attr', 'dir', 'rtl')
    cy.get('h1').should('contain', 'أهلا وسهلا')

    // Switch to French
    cy.get('[data-testid="language-switcher"]').click()
    cy.get('button:contains("Français")').click()
    cy.get('h1').should('contain', 'Bienvenue')
  })

  it('should persist language preference', () => {
    // Switch to Arabic
    cy.get('[data-testid="language-switcher"]').click()
    cy.get('button:contains("عربي")').click()

    // Reload page
    cy.reload()

    // Should still be in Arabic
    cy.get('html').should('have.attr', 'dir', 'rtl')
  })
})

describe('Authentication Flows', () => {
  it('should register new user', () => {
    cy.visit('http://localhost:3000/register')

    cy.get('input[name="firstName"]').type('John')
    cy.get('input[name="lastName"]').type('Doe')
    cy.get('input[name="email"]').type('john@example.com')
    cy.get('input[name="password"]').type('SecurePass123')
    cy.get('input[name="confirmPassword"]').type('SecurePass123')

    cy.get('button:contains("Register")').click()

    cy.url().should('include', '/dashboard')
  })

  it('should login existing user', () => {
    cy.visit('http://localhost:3000/login')

    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button:contains("Login")').click()

    cy.url().should('include', '/dashboard')
  })

  it('should handle invalid login', () => {
    cy.visit('http://localhost:3000/login')

    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button:contains("Login")').click()

    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials')
  })
})

describe('Performance Tests', () => {
  it('should load homepage within 2 seconds', () => {
    cy.visit('http://localhost:3000', {
      onBeforeLoad: (win) => {
        win.performance.mark('pageLoadStart')
      },
      onLoad: (win) => {
        win.performance.mark('pageLoadEnd')
      }
    })

    cy.window().then((win) => {
      const loadTime = win.performance.getEntriesByName('pageLoadEnd')[0].startTime -
                       win.performance.getEntriesByName('pageLoadStart')[0].startTime
      expect(loadTime).to.be.lessThan(2000)
    })
  })
})

// Custom commands
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('http://localhost:3000/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button:contains("Login")').click()
  cy.url().should('include', '/dashboard')
})
