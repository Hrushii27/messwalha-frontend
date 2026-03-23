const db = require('../config/db');

const Payment = {
    create: async (userId, messId, amount, transactionId = null) => {
        const result = await db.query(
            "INSERT INTO payments (user_id, mess_id, amount, status, transaction_id) VALUES ($1, $2, $3, 'SUCCESS', $4) RETURNING *",
            [userId, messId, amount, transactionId]
        );
        return result.rows[0];
    },

    sumRevenueByMessId: async (messId) => {
        const result = await db.query(
            "SELECT SUM(amount) FROM payments WHERE mess_id = $1 AND status = 'SUCCESS'",
            [messId]
        );
        return parseFloat(result.rows[0].sum || 0);
    }
};

module.exports = Payment;
