const db = require('../config/db');

const userController = {
    getProfile: async (req, res) => {
        try {
            const result = await db.query('SELECT id, name, email, phone, role FROM mess_owners WHERE id = $1', [req.owner.id]);
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
        const { name, phone } = req.body;
        try {
            const result = await db.query(
                'UPDATE mess_owners SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, email, phone, role',
                [name, phone, req.owner.id]
            );
            res.status(200).json({ success: true, user: result.rows[0] });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error updating profile' });
        }
    }
};

module.exports = userController;
