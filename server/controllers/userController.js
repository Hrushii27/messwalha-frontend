const Owner = require('../models/owner');
const bcrypt = require('bcrypt');

const userController = {
    getProfile: async (req, res) => {
        try {
            const user = await Owner.findById(req.user.id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            // Remove password from response
            const { password_hash, ...userData } = user;
            res.json({ success: true, user: userData });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    updateProfile: async (req, res) => {
        const { name, phone, profile_image } = req.body;
        try {
            const db = require('../config/db');
            const result = await db.query(
                'UPDATE mess_owners SET name = $1, phone = $2, profile_image = COALESCE($4, profile_image) WHERE id = $3 RETURNING id, name, email, phone, role, created_at, profile_image',
                [name, phone, req.user.id, profile_image]
            );
            res.json({ success: true, user: result.rows[0] });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    changePassword: async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        try {
            const user = await Owner.findById(req.user.id);
            const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
            if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(newPassword, salt);

            const db = require('../config/db');
            await db.query('UPDATE mess_owners SET password_hash = $1 WHERE id = $2', [hashed, req.user.id]);

            res.json({ message: 'Password changed successfully' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = userController;
