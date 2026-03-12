const { sendNotification, getNotificationsByMess } = require('../controllers/notificationController');

router.post('/', (req, res, next) => {
    if (!req.user || (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ message: 'Only mess owners can post notices' });
    }
    next();
}, sendNotification);

router.get('/:messId', getNotificationsByMess);

module.exports = router;
