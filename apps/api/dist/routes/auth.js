import { Router } from 'express';
import { prisma } from 'database';
import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';
const router = Router();
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});
// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);
        const passwordHash = await bcryptjs.hash(password, 10);
        // 1. Create Supabase auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role: 'customer' },
        });
        if (authError) {
            return res.status(400).json({ error: authError.message });
        }
        // 2. Create user profile in our DB
        const user = await prisma.user.create({
            data: {
                id: authUser.user.id,
                email,
                name,
                passwordHash,
                role: 'customer',
                isActive: true,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            userId: user.id,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});
// POST /api/auth/login  (validates credentials, returns user profile)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        // Sign in via Supabase to validate credentials
        const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Fetch user profile from our DB
        const user = await prisma.user.findUnique({
            where: { id: data.user.id },
        });
        res.json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                name: user?.name || data.user.user_metadata.name,
                role: user?.role || 'customer',
            },
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
            },
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: 'Validation error', details: error.errors });
        }
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});
// GET /api/auth/me  (get user profile from token)
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ error: 'No token' });
        const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        const { data: { user: authUser }, error } = await supabaseClient.auth.getUser(token);
        if (error || !authUser)
            return res.status(401).json({ error: 'Invalid token' });
        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            phone: user.phone,
            address: user.address,
            city: user.city,
            country: user.country,
        });
    }
    catch (error) {
        console.error('Auth/me error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});
// PATCH /api/auth/profile
router.patch('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ error: 'No token' });
        const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
        const { data: { user: authUser }, error: authUserError } = await supabaseClient.auth.getUser(token);
        if (authUserError || !authUser)
            return res.status(401).json({ error: 'Invalid token' });
        const { name, phone, address, city, country, avatarUrl, password } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (phone !== undefined)
            updateData.phone = phone;
        if (address !== undefined)
            updateData.address = address;
        if (city !== undefined)
            updateData.city = city;
        if (country !== undefined)
            updateData.country = country;
        if (avatarUrl !== undefined)
            updateData.avatarUrl = avatarUrl;
        // 1. Update Password in Supabase if provided
        if (password) {
            const { error: passError } = await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
                password
            });
            if (passError)
                return res.status(400).json({ error: passError.message });
            updateData.passwordHash = await bcryptjs.hash(password, 10);
        }
        // 2. Update DB Profile
        const updatedUser = await prisma.user.update({
            where: { id: authUser.id },
            data: updateData
        });
        // 3. Update Supabase Metadata
        if (name !== undefined) {
            await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
                user_metadata: { ...authUser.user_metadata, name }
            });
        }
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});
export { router as authRouter };
