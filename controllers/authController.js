const User = require('../models/user');
const Subscription = require('../models/subscription');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

const authController = {
    register: async (req, res) => {
        const { name, email, phone, password, role } = req.body;
        try {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            const passwordHash = await hashPassword(password);
            const userRole = role || 'OWNER';
            const user = await User.create(name, email, phone, passwordHash, userRole);

            // Automatically assign 60-day trial for owners
            let ownerSubscription = null;
            if (userRole === 'OWNER') {
                ownerSubscription = await Subscription.createTrial(user.id);
            }

            const token = generateToken(user.id, userRole);
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: userRole,
                    ownerSubscription
                }
            });
        } catch (err) {
            console.error('❌ Registration Error Full:', err);
            res.status(500).json({
                success: false,
                message: 'Server error during registration',
                error: err.message,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
        }
    },

    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const token = generateToken(user.id, user.role);

            let ownerSubscription = null;
            if (user.role === 'OWNER') {
                ownerSubscription = await Subscription.findByOwnerId(user.id);
            }

            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
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
            const placeholderEmail = `user_${Date.now()}@firebase.test`;
            const userRole = role || 'STUDENT';

            const user = await User.create(
                name || 'Firebase User',
                placeholderEmail,
                '',
                'firebase-sync',
                userRole
            );

            let ownerSubscription = null;
            if (userRole === 'OWNER') {
                ownerSubscription = await Subscription.createTrial(user.id);
            }

            const token = generateToken(user.id, userRole);

            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
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
                    id: req.owner.id,
                    name: req.owner.name,
                    email: req.owner.email,
                    phone: req.owner.phone,
                    role: req.owner.role,
                    ownerSubscription
                }
            });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Server error fetching profile' });
        }
    }
};

module.exports = authController;
