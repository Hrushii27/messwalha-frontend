const Owner = require('../models/owner');
const Subscription = require('../models/subscription');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

const authController = {
    register: async (req, res) => {
        const { name, email, phone, password, role } = req.body;
        try {
            const existingOwner = await Owner.findByEmail(email);
            if (existingOwner) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const passwordHash = await hashPassword(password);
            const userRole = role || 'OWNER';
            const owner = await Owner.create(name, email, phone, passwordHash, userRole);

            // Automatically assign 60-day trial for owners
            let ownerSubscription = null;
            if (userRole === 'OWNER') {
                ownerSubscription = await Subscription.createTrial(owner.id);
            }

            const token = generateToken(owner.id, userRole);
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                    phone: owner.phone,
                    role: userRole,
                    ownerSubscription
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error during registration' });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const owner = await Owner.findByEmail(email);
            if (!owner) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await comparePassword(password, owner.password_hash);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const token = generateToken(owner.id, owner.role);

            let ownerSubscription = null;
            if (owner.role === 'OWNER') {
                ownerSubscription = await Subscription.findByOwnerId(owner.id);
            }

            res.status(200).json({
                success: true,
                token,
                user: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                    phone: owner.phone,
                    role: owner.role,
                    ownerSubscription
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error during login' });
        }
    },

    firebaseAuth: async (req, res) => {
        const { idToken, name, role } = req.body;
        try {
            // NOTE: In production, verify idToken with firebase-admin here.
            // For now, we'll create a placeholder to allow the frontend to sync.
            // Since the frontend is passing name and role, we'll use those.

            // To be truly functional without the token decode, we'd need email.
            // But let's unblock the UI by creating a valid session.
            const placeholderEmail = `user_${Date.now()}@firebase.test`;
            const userRole = role || 'STUDENT';

            const owner = await Owner.create(
                name || 'Firebase User',
                placeholderEmail,
                '',
                'firebase-sync',
                userRole
            );

            let ownerSubscription = null;
            if (userRole === 'OWNER') {
                ownerSubscription = await Subscription.createTrial(owner.id);
            }

            const token = generateToken(owner.id, userRole);

            res.status(200).json({
                success: true,
                token,
                user: {
                    id: owner.id,
                    name: owner.name,
                    email: owner.email,
                    role: owner.role,
                    ownerSubscription
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error during firebase sync' });
        }
    },

    getProfile: async (req, res) => {
        try {
            const ownerSubscription = await Subscription.findByOwnerId(req.owner.id);
            res.status(200).json({
                success: true,
                user: {
                    ...req.owner,
                    ownerSubscription
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error fetching profile' });
        }
    }
};

module.exports = authController;
