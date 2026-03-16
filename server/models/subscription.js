const db = require('../config/db');

const Subscription = {
    createTrial: async (ownerId) => {
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 90);

        const result = await db.query(
            'INSERT INTO subscriptions (mess_owner_id, plan_type, trial_start, trial_end, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [ownerId, 'trial', trialStart, trialEnd, 'trial']
        );
        return result.rows[0];
    },
    findByOwnerId: async (ownerId) => {
        const result = await db.query('SELECT * FROM subscriptions WHERE mess_owner_id = $1', [ownerId]);
        return result.rows[0];
    },
    updateStatus: async (id, status, planType = null, nextBillingDate = null) => {
        let query = 'UPDATE subscriptions SET status = $1';
        const params = [status];
        let count = 2;
        if (planType) {
            query += `, plan_type = $${count++}`;
            params.push(planType);
        }
        if (nextBillingDate) {
            query += `, next_billing_date = $${count++}`;
            params.push(nextBillingDate);
        }
        query += ` WHERE id = $${count} RETURNING *`;
        params.push(id);
        const result = await db.query(query, params);
        return result.rows[0];
    },
    findExpiredTrials: async () => {
        const now = new Date();
        const result = await db.query(
            "SELECT * FROM subscriptions WHERE plan_type = 'trial' AND status = 'trial' AND trial_end < $1",
            [now]
        );
        return result.rows;
    }
};

module.exports = Subscription;
