"use client";

import { Send } from "lucide-react";
import { axiosIns } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { NotificationHistory } from "./notifications-history";
import { SendNotificationDialog } from "./send-notification-dialog";

type FlatRecipientType = {
  flatRecipientId: string;
  flatId: string;
  ownerId: string;
  isCurrentOwner: boolean;
  ownerName: string;
  ownerEmail: string;
  flat: string;
};

type NotificationHistoryType = {
  notificationId: string;
  title: string;
  content: string;
  total: number;
  sentAt: Date;
};

export const NotificationsClientPage = () => {
  const { society } = useAppSelector((store) => store.societyReducer);
  const { admin } = useAppSelector((store) => store.adminReducer);
  const [flatRecipients, setFlatRecipients] = useState<FlatRecipientType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationHistory, setNotificationHistory] = useState<
    NotificationHistoryType[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const getFlatRecipients = async () => {
    if (!society?.societyId) return;

    try {
      const res = await axiosIns(
        `/api/society/${society.societyId}/flat-recipients`,
      );
      setFlatRecipients(res.data.flatRecipients || []);
    } catch (error) {
      console.error("Error fetching flat recipients:", error);
      toast.error("Failed to load recipients");
    }
  };

  const getNotificationHistory = async () => {
    if (!society?.societyId || !admin?.adminId) return;

    setHistoryLoading(true);
    try {
      const res = await axiosIns(
        `/api/society/${society.societyId}/notifications/history?adminId=${admin.adminId}`,
      );
      setNotificationHistory(res.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notification history:", error);
      toast.error("Failed to load notification history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    getFlatRecipients();
    getNotificationHistory();
  }, [society?.societyId, admin?.adminId]);

  const handleSendNotification = async (
    title: string,
    content: string,
    recipientIds: string[],
  ) => {
    setLoading(true);

    try {
      const payload = {
        title,
        content,
        sentBy: admin?.adminId,
        flatRecipientsIds: recipientIds,
      };

      await axiosIns.post(
        `/api/society/${society?.societyId}/notifications/send`,
        payload,
      );

      toast.success(`Notification sent to ${recipientIds.length} resident(s)!`);
      setIsDialogOpen(false);

      getNotificationHistory();
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error(
        error.response?.data?.message || "Failed to send notification",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Send notifications to residents and view history"
      >
        <Button size="lg" onClick={() => setIsDialogOpen(true)}>
          <Send className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </PageHeader>

      <SendNotificationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSend={handleSendNotification}
        recipients={flatRecipients}
        loading={loading}
      />

      <NotificationHistory
        notifications={notificationHistory}
        loading={historyLoading}
        onRefresh={getNotificationHistory}
      />
    </div>
  );
};
