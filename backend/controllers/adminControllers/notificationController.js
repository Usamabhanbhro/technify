const Notification = require('../../model/Notification');

/**
 * Get All Notifications (with filters and pagination)
 */
exports.getNotifications = async (req, res) => {
  try {
    const { type, status, priority, limit = 20, skip = 0 } = req.query;
    
    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

/**
 * Get Unread Notifications Count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ status: 'Unread' });
    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

/**
 * Mark Notification as Read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        status: 'Read',
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark All Notifications as Read
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { status: 'Unread' },
      {
        status: 'Read',
        readAt: new Date(),
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notifications as read',
      error: error.message,
    });
  }
};

/**
 * Archive Notification
 */
exports.archiveNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { status: 'Archived' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification archived',
      notification,
    });
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving notification',
      error: error.message,
    });
  }
};

/**
 * Delete Notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

/**
 * Create Notification (Internal - called by other controllers)
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
