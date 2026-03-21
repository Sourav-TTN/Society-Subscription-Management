import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/badge";

type NotificationHeaderProps = {
  unreadCount: number;
};

export const NotificationHeader = ({
  unreadCount,
}: NotificationHeaderProps) => {
  return (
    <PageHeader
      title="Notifications"
      description="See all of your notifications in one place."
    >
      {unreadCount > 0 && (
        <Badge variant="secondary" className="ml-2">
          {unreadCount} unread
        </Badge>
      )}
    </PageHeader>
  );
};
