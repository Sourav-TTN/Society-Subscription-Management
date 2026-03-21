"use client";

import { useNotifications } from "./use-notifications";
import { NotificationHeader } from "./notification-header";
import { NotificationList } from "./notification-list";
import { NotificationDialog } from "./notification-dialog";

export const UserNotificationsClientPage = () => {
  const {
    notifications,
    loading,
    selectedNotification,
    dialogOpen,
    unreadCount,
    handleViewNotification,
    handleCloseDialog,
  } = useNotifications();

  return (
    <div className="space-y-6">
      <NotificationHeader unreadCount={unreadCount} />

      <NotificationList
        notifications={notifications}
        loading={loading}
        onViewNotification={handleViewNotification}
      />

      <NotificationDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        notification={selectedNotification}
      />
    </div>
  );
};
