const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/adminControllers/notificationController');

// Get All Notifications
router.get('/', notificationController.getNotifications);

// Get Unread Notifications Count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark Notification as Read
router.put('/:id/read', notificationController.markAsRead);

// Mark All Notifications as Read
router.put('/all/read', notificationController.markAllAsRead);

// Archive Notification
router.put('/:id/archive', notificationController.archiveNotification);

// Delete Notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
