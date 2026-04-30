import { Router } from 'express';
import axios from 'axios';
const router = Router();
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
// POST /api/payments/paymob/create-payment
router.post('/paymob/create-payment', async (req, res) => {
    try {
        const { orderId, amount, customer } = req.body;
        // 1. Authentication
        const authRes = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: PAYMOB_API_KEY,
        });
        const token = authRes.data.token;
        // 2. Order Registration
        const orderRes = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: token,
            delivery_needed: 'false',
            amount_cents: Math.round(amount * 100),
            currency: 'EGP',
            items: [],
        });
        const paymobOrderId = orderRes.data.id;
        // 3. Payment Key Generation
        const keyRes = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: Math.round(amount * 100),
            expiration: 3600,
            order_id: paymobOrderId,
            billing_data: {
                apartment: 'NA',
                email: customer.email,
                floor: 'NA',
                first_name: customer.name.split(' ')[0] || 'Customer',
                street: 'NA',
                building: 'NA',
                phone_number: customer.phone || 'NA',
                shipping_method: 'NA',
                postal_code: 'NA',
                city: 'NA',
                country: 'EG',
                last_name: customer.name.split(' ')[1] || 'NA',
                state: 'NA',
            },
            currency: 'EGP',
            integration_id: parseInt(PAYMOB_INTEGRATION_ID || '0'),
        });
        const paymentToken = keyRes.data.token;
        const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;
        res.json({ iframeUrl, paymentToken });
    }
    catch (error) {
        const paymobError = error.response?.data || error.message;
        console.error('Paymob error:', paymobError);
        res.status(500).json({
            error: 'Failed to initiate Paymob payment',
            details: paymobError
        });
    }
});
// Webhook for Paymob callback
router.post('/paymob/callback', async (req, res) => {
    try {
        const { obj } = req.body;
        const success = obj.success;
        const orderId = obj.order.id;
        // In a real app, verify HMAC here
        if (success) {
            // Update order status in DB
            // Note: You'd need to map Paymob Order ID to your Order ID
            console.log(`Payment success for Paymob order ${orderId}`);
        }
        res.json({ success: true });
    }
    catch (error) {
        console.error('Callback error:', error);
        res.status(500).end();
    }
});
export { router as paymentsRouter };
