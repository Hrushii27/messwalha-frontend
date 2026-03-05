const db = require('../config/db');

const Subscription = {
    createTrial: async (ownerId) => {
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 60); // 2 months trial

        const result = await db.query(
            'INSERT INTO owner_subscriptions (owner_id, trial_start_date, trial_end_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [ownerId, trialStart, trialEnd, 'trial']
        );
        return result.rows[0];
    },

    findByOwnerId: async (ownerId) => {
        const result = await db.query('SELECT * FROM owner_subscriptions WHERE owner_id = $1', [ownerId]);
        return result.rows[0];
    },

    updateSubscription: async (ownerId, durationDays = 30) => {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + durationDays);

        const result = await db.query(
            'UPDATE owner_subscriptions SET subscription_start = $1, subscription_end = $2, status = $3 WHERE owner_id = $4 RETURNING *',
            [start, end, 'active', ownerId]
        );
        return result.rows[0];
    },

    checkStatus: async (ownerId) => {
        const result = await db.query('SELECT * FROM owner_subscriptions WHERE owner_id = $1', [ownerId]);
        if (result.rows.length === 0) return null;

        const sub = result.rows[0];
        const now = new Date();

        if (sub.status === 'active' && new Date(sub.subscription_end) > now) {
            return 'active';
        }
        if (sub.status === 'trial' && new Date(sub.trial_end_date) > now) {
            return 'trial';
        }
        return 'expired';
    }
};

module.exports = Subscription;
