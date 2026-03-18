const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { sendNotification, getNotificationsByMess } = require('../controllers/notificationController');

=======
const { sendNotification, getNotificationsByMess, getAllNotifications } = require('../controllers/notificationController');

router.get('/', (req, res, next) => {
    console.log('🔔 Notifications root route hit');
    next();
}, getAllNotifications);
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
router.post('/', (req, res, next) => {
  if (!req.user || (req.user.role !== 'OWNER' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({ message: 'Only mess owners can post notices' });
  }
  next();
}, sendNotification);

router.get('/:messId', getNotificationsByMess);

module.exports = router;
