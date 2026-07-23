import { useState, useEffect } from 'react';
import { Bell, Trash2, Check, Archive, AlertCircle, Filter } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Unread');
  const [selectedType, setSelectedType] = useState('All');
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationTypes = ['All', 'Donation', 'Payment', 'Admission', 'Enrollment', 'Certificate', 'System'];
  const filterOptions = ['All', 'Unread', 'Read', 'Archived'];

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [selectedFilter, selectedType]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/notifications';
      const params = [];
      
      if (selectedType !== 'All') params.push(`type=${selectedType}`);
      if (selectedFilter !== 'All') params.push(`status=${selectedFilter}`);
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        setError(data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/unread/count');
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(
          notifications.map((notif) =>
            notif._id === id ? { ...notif, status: 'Read' } : notif
          )
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/notifications/all/read', {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(
          notifications.map((notif) => ({ ...notif, status: 'Read' }))
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleArchive = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/archive`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.filter((notif) => notif._id !== id));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.filter((notif) => notif._id !== id));
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Donation':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'Payment':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'Admission':
        return 'bg-purple-50 border-l-4 border-purple-500';
      case 'Enrollment':
        return 'bg-indigo-50 border-l-4 border-indigo-500';
      case 'Certificate':
        return 'bg-pink-50 border-l-4 border-pink-500';
      case 'System':
        return 'bg-gray-50 border-l-4 border-gray-500';
      default:
        return 'bg-white border-l-4 border-gray-300';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={32} className="text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="flex gap-2 flex-wrap">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedFilter(option)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedFilter === option
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <div className="flex gap-2 flex-wrap">
                {notificationTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedType === type
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {unreadCount > 0 && selectedFilter === 'Unread' && (
            <button
              onClick={handleMarkAllAsRead}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Check size={18} />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-2">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <Bell size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg shadow-md transition hover:shadow-lg ${getTypeColor(
                  notification.type
                )} ${notification.status === 'Unread' ? 'border-t-4 border-t-green-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            notification.status === 'Unread'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {notification.status}
                        </span>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {notification.type}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{notification.message}</p>

                    {notification.details && (
                      <div className="bg-white bg-opacity-70 p-3 rounded mb-3 text-sm text-gray-700">
                        {notification.details.amount && (
                          <p>
                            <strong>Amount:</strong> Rs{' '}
                            {notification.details.amount.toLocaleString()}
                          </p>
                        )}
                        {notification.details.paymentMethod && (
                          <p>
                            <strong>Payment Method:</strong> {notification.details.paymentMethod}
                          </p>
                        )}
                        {notification.details.donorName && (
                          <p>
                            <strong>Donor:</strong> {notification.details.donorName}
                          </p>
                        )}
                        {notification.details.donorEmail && (
                          <p>
                            <strong>Email:</strong> {notification.details.donorEmail}
                          </p>
                        )}
                        {notification.details.courseName && (
                          <p>
                            <strong>Course:</strong> {notification.details.courseName}
                          </p>
                        )}
                        {notification.details.studentName && (
                          <p>
                            <strong>Student:</strong> {notification.details.studentName}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-600">
                      {formatDate(notification.createdAt)}
                      {notification.readAt && (
                        <span> • Read: {formatDate(notification.readAt)}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    {notification.status !== 'Read' && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                        title="Mark as Read"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(notification._id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition"
                      title="Archive"
                    >
                      <Archive size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
