"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { History, Users, Eye } from "lucide-react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";

type NotificationHistoryType = {
  notificationId: string;
  title: string;
  content: string;
  total: number;
  sentAt: Date;
};

interface NotificationHistoryProps {
  notifications: NotificationHistoryType[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const NotificationHistory = ({
  notifications,
  loading = false,
}: NotificationHistoryProps) => {
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationHistoryType | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
        <p className="text-sm text-muted-foreground">
          When you send notifications, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-75">Title</TableHead>
              <TableHead className="w-100">Content</TableHead>
              <TableHead className="w-30">Recipients</TableHead>
              <TableHead className="w-45">Sent At</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow
                key={notification.notificationId}
                className="hover:bg-muted/30"
              >
                <TableCell className="font-medium">
                  <div className="truncate max-w-70" title={notification.title}>
                    {notification.title}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className="truncate max-w-95 text-muted-foreground"
                    title={notification.content}
                  >
                    {notification.content}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 w-fit"
                  >
                    <Users className="h-3 w-3" />
                    {notification.total}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(notification.sentAt), "MMM d, yyyy")}
                    <br />
                    <span className="text-xs">
                      {format(new Date(notification.sentAt), "h:mm a")}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedNotification(notification)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={() => setSelectedNotification(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Notification Details
            </DialogTitle>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Title
                </h4>
                <p className="text-base font-semibold">
                  {selectedNotification.title}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Content
                </h4>
                <p className="text-sm bg-muted/30 p-3 rounded-lg">
                  {selectedNotification.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Recipients
                  </h4>
                  <Badge
                    variant="default"
                    className="flex items-center gap-1 w-fit"
                  >
                    <Users className="h-3 w-3" />
                    {selectedNotification.total}{" "}
                    {selectedNotification.total === 1 ? "person" : "people"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Sent At
                  </h4>
                  <p className="text-sm">
                    {format(new Date(selectedNotification.sentAt), "PPP")}
                    <br />
                    <span className="text-muted-foreground">
                      {format(new Date(selectedNotification.sentAt), "p")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
