import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";
import { Calendar } from "lucide-react";
import { Button } from "@/components/button";
import { formatDistanceToNow } from "date-fns";
import { NotificationRecipientResultsType } from "./use-notifications";
import { Separator } from "@/components/separator";

type NotificationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: NotificationRecipientResultsType | null;
};

export const NotificationDialog = ({
  open,
  onOpenChange,
  notification,
}: NotificationDialogProps) => {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-2xl">
        <DialogHeader className="flex justify-between items-center flex-row">
          <DialogTitle className="text-xl">{notification.title}</DialogTitle>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {formatDistanceToNow(new Date(notification.sentAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </DialogHeader>
        <Separator />
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {notification.content}
        </p>
        <Separator />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
