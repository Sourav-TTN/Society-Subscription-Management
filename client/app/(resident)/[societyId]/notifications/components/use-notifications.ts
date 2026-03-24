import { useEffect, useState } from "react";
import { axiosIns } from "@/lib/axios";
import { useAppSelector } from "@/store";

export type NotificationRecipientResultsType = {
  notificationRecipientId: string;
  notificationId: string;
  createdAt: Date;
  updatedAt: Date;
  flatRecipientId: string;
  title: string;
  content: string;
  sentAt: Date;
};

export const useNotifications = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  const { society } = useAppSelector((store) => store.societyReducer);
  const { gotNew } = useAppSelector((store) => store.notificationReducer);

  const [notifications, setNotifications] = useState<
    NotificationRecipientResultsType[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationRecipientResultsType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!society || !user) return;

    setLoading(true);

    try {
      const res = await axiosIns.get(
        `/api/society/${society?.societyId}/notifications/users/${user?.userId}`,
      );
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [society, user, gotNew]);

  const getUnreadCount = () => {
    return notifications.filter(
      (n) => !n.updatedAt || new Date(n.updatedAt) > new Date(n.sentAt),
    ).length;
  };

  const handleViewNotification = (
    notification: NotificationRecipientResultsType,
  ) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedNotification(null);
  };

  return {
    notifications,
    loading,
    selectedNotification,
    dialogOpen,
    unreadCount: getUnreadCount(),
    handleViewNotification,
    handleCloseDialog,
  };
};
