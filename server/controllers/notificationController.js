const Notification = require('../models/notification');
const Mess = require('../models/mess');

const sendNotification = async (req, res) => {
    try {
        const { mess_id, message } = req.body;
        const userId = req.user.id;

        if (!mess_id || !message) {
            return res.status(400).json({ message: 'Mess ID and message are required' });
        }

        // Check if user is the owner of the mess
        const messes = await Mess.findByOwnerId(userId);
        const isOwner = messes.some(m => m.id === parseInt(mess_id));

        if (!isOwner && req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Only mess owners can send notifications' });
        }

        const notification = await Notification.create(mess_id, message);
        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        console.error('Error sending notification:', err);
        res.status(500).json({ message: 'Error sending notification' });
    }
};

const getNotificationsByMess = async (req, res) => {
    try {
        const { messId } = req.params;
        const notifications = await Notification.findByMessId(messId);
        res.json({ success: true, data: notifications });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll();
        // Frontend NotificationCenter expects { data: [...] }
        res.json({ success: true, data: notifications });
    } catch (err) {
        console.error('Error fetching all notifications:', err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

module.exports = {
    sendNotification,
    getNotificationsByMess,
    getAllNotifications
};
