import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { addMinutes, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/badge";
import { NotificationSkeleton } from "./notification-skeleton";
import { EmptyNotifications } from "./empty-notifications";
import { NotificationRecipientResultsType } from "./use-notifications";

type NotificationListProps = {
  notifications: NotificationRecipientResultsType[];
  loading: boolean;
  onViewNotification: (notification: NotificationRecipientResultsType) => void;
};

export const NotificationList = ({
  notifications,
  loading,
  onViewNotification,
}: NotificationListProps) => {
  if (loading) {
    return <NotificationSkeleton />;
  }

  if (notifications.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Title</TableHead>
            <TableHead className="w-[50%]">Content</TableHead>
            <TableHead className="w-[15%]">Sent</TableHead>
            <TableHead className="w-[5%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.map((notification) => {
            const isUnread =
              !notification.updatedAt ||
              new Date(notification.updatedAt) > new Date(notification.sentAt);

            return (
              <TableRow
                key={notification.notificationRecipientId}
                className={isUnread ? "bg-muted/50" : undefined}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {notification.title}
                    {isUnread && (
                      <Badge variant="secondary" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <p className="line-clamp-2">{notification.content}</p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(
                    addMinutes(new Date(notification.sentAt), 330),
                    { addSuffix: true },
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewNotification(notification)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
