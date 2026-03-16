const db = require('../config/db');

const Subscription = {
    createTrial: async (ownerId) => {
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 60);

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
    },
    activate: async (ownerId, daysActive = 30) => {
        const now = new Date();
        const nextBilling = new Date();
        nextBilling.setDate(now.getDate() + daysActive);

        // Check if there's an existing subscription record
        let sub = await Subscription.findByOwnerId(ownerId);
        
        if (sub) {
            // Update existing
            const result = await db.query(
                "UPDATE subscriptions SET status = 'active', plan_type = 'paid', next_billing_date = $1 WHERE mess_owner_id = $2 RETURNING *",
                [nextBilling, ownerId]
            );
            return result.rows[0];
        } else {
            // Failsafe create
            const result = await db.query(
                "INSERT INTO subscriptions (mess_owner_id, plan_type, status, trial_start, trial_end, next_billing_date) VALUES ($1, 'paid', 'active', $2, $2, $3) RETURNING *",
                [ownerId, now, nextBilling]
            );
            return result.rows[0];
        }
    }
};

module.exports = Subscription;
