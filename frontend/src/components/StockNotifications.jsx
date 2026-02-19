import React from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

const StockNotifications = () => {
  const { notifications, removeNotification, clearAllNotifications } = useSocket();

  if (notifications.length === 0) return null;

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'critical':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return '🚨';
      case 'critical':
        return '⚠️';
      case 'warning':
        return '📦';
      default:
        return 'ℹ️';
    }
  };

  const getTitleColor = (type) => {
    switch (type) {
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'critical':
        return 'text-orange-800 dark:text-orange-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      default:
        return 'text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 w-96 max-h-screen overflow-y-auto">
      <div className="space-y-2">
        {/* Clear all button */}
        {notifications.length > 1 && (
          <div className="flex justify-end mb-2">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Notifications */}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`rounded border shadow-lg p-3 animate-slide-in-right ${getNotificationStyles(
              notification.type
            )}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-lg flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-semibold ${getTitleColor(notification.type)}`}>
                    {notification.title}
                  </h4>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-0.5">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {notification.productId && (
                      <Link
                        to={`/products/${notification.productId}`}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        View Item
                      </Link>
                    )}
                    <Link
                      to="/inventory/low-stock"
                      className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                    >
                      View All Alerts
                    </Link>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockNotifications;
