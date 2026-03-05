const db = require('../config/db');

const userController = {
    getProfile: async (req, res) => {
        try {
            const result = await db.query(
                'SELECT id, name, email, phone, role, created_at, profile_image FROM users WHERE id = $1',
                [req.owner.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.status(200).json({ success: true, user: result.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error fetching profile' });
        }
    },

    updateProfile: async (req, res) => {
        const { name, phone, email } = req.body;
        try {
            const result = await db.query(
                'UPDATE users SET name = $1, phone = $2, email = $3 WHERE id = $4 RETURNING id, name, email, phone, role',
                [name, phone, email, req.owner.id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.status(200).json({ success: true, message: 'Profile updated successfully', user: result.rows[0] });
        } catch (err) {
            console.error('❌ Update Profile Error:', err);
            res.status(500).json({ success: false, message: 'Server error updating profile' });
        }
    }
};

module.exports = userController;
