const cron = require('node-cron');
const Subscription = require('../models/subscription');
const Mess = require('../models/mess');

const startScheduler = () => {
    console.log('📅 Setting up daily trial expiry cron job...');
    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily trial expiry check...');
        try {
            const expiredSubscriptions = await Subscription.findExpiredTrials();
            for (const sub of expiredSubscriptions) {
                // Update subscription status to expired
                await Subscription.updateStatus(sub.id, 'expired');
                // Disable mess listings for this owner
                await Mess.updateVisibility(sub.mess_owner_id, false);
                console.log(`Subscription for owner ${sub.mess_owner_id} expired. Listings disabled.`);
            }
        } catch (err) {
            console.error('Error in trial expiry check job:', err);
        }
    });
};

module.exports = startScheduler;
