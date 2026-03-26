const cron = require('node-cron');
const Subscription = require('../models/subscription');
const Mess = require('../models/mess');

const startScheduler = () => {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
        console.log('🕒 Running daily subscription expiry check...');
        try {
            // Check expired trials
            const expiredTrials = await Subscription.findExpiredTrials();
            for (const sub of expiredTrials) {
                await Subscription.updateStatus(sub.id, 'expired');
                await Mess.deactivateByOwnerId(sub.owner_id);
                console.log(`✅ Expired trial for owner ID ${sub.owner_id} and deactivated listings.`);
            }

            // Check expired paid subscriptions
            const expiredSubs = await Subscription.findExpiredSubscriptions();
            for (const sub of expiredSubs) {
                await Subscription.updateStatus(sub.id, 'expired');
                await Mess.deactivateByOwnerId(sub.owner_id);
                console.log(`✅ Expired subscription for owner ID ${sub.owner_id} and deactivated listings.`);
            }
        } catch (err) {
            console.error('❌ Error in daily subscription expiry check:', err);
        }
    });

    console.log('🚀 Daily trial expiry scheduler initialized');
};

module.exports = startScheduler;
