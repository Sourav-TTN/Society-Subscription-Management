import { Inbox } from "lucide-react";

export const EmptyNotifications = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="rounded-full bg-muted/50 p-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold text-lg">No notifications</h3>
      <p className="text-sm text-muted-foreground">
        When you receive notifications, they'll appear here
      </p>
    </div>
  );
};
