import { createContext, useCallback, useEffect, useState } from "react";
import {
  deleteNotification as deleteNotificationRequest,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationRead,
  markNotificationRead,
} from "../api/notification";
import { useAuth } from "../hooks/useAuth";

const NotificationContext = createContext(null);
export default NotificationContext;

export function NotificationProvider({ children }) {
  const { accessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data?.count || 0);
    } catch {
      // The notification page will surface request failures; the badge can stay stale.
    }
  }, [accessToken]);

  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const response = await getNotifications(page);
      const result = response.data || {};
      setNotifications((current) =>
        append ? [...current, ...(result.notifications || [])] : result.notifications || [],
      );
      setPagination(result.pagination || null);
      setUnreadCount(result.unreadCount || 0);
    } catch {
      setError("Could not load your notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }

    const initialLoadId = window.setTimeout(fetchNotifications, 0);
    const refresh = () => {
      fetchNotifications();
      refreshUnreadCount();
    };
    const intervalId = window.setInterval(refresh, 30 * 1000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
  }, [accessToken, fetchNotifications, refreshUnreadCount]);

  const markRead = async (id) => {
    const target = notifications.find((notification) => notification.id === id);
    if (!target || target.isRead) return;
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification,
      ),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await markNotificationRead(id);
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationRead();
    } catch {
      fetchNotifications();
    }
  };

  const removeNotification = async (id) => {
    const target = notifications.find((notification) => notification.id === id);
    setNotifications((current) => current.filter((notification) => notification.id !== id));
    if (target && !target.isRead) setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await deleteNotificationRequest(id);
    } catch {
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        pagination,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markRead,
        markAllRead,
        removeNotification,
        refreshUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
