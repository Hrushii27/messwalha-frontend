const express = require('express');
const router = express.Router();
const { sendNotification, getNotificationsByMess, getAllNotifications } = require('../controllers/notificationController');

router.get('/', (req, res, next) => {
    console.log('🔔 Notifications root route hit');
    next();
}, getAllNotifications);
router.post('/', (req, res, next) => {
  if (!req.user || (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({ message: 'Only mess owners can post notices' });
  }
  next();
}, sendNotification);

router.get('/:messId', getNotificationsByMess);

module.exports = router;
