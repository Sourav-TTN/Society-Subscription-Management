"use client";

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@/components/table";
import { format } from "date-fns";
import { Button } from "@/components/button";
import { Edit2, Trash2, Home, Calendar, CreditCard, User } from "lucide-react";
import { ApiSubscriptionResponse } from "./page-client";

interface SubscriptionTableProps {
  subscriptions: (ApiSubscriptionResponse & { size: number })[];
  onEdit: (subscription: ApiSubscriptionResponse) => void;
  onDelete: (subscriptionId: string) => void;
}

export const SubscriptionTable = ({
  subscriptions,
  onEdit,
  onDelete,
}: SubscriptionTableProps) => {
  if (subscriptions.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center">
        <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No subscriptions found
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Get started by adding your first subscription
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flat Type</TableHead>
            <TableHead>Charges</TableHead>
            <TableHead>Effective From</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.subscriptionId}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  {subscription.size}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />₹
                  {subscription.charges}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(subscription.effectiveFrom), "dd MMM yyyy")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {subscription.createdBy}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(subscription.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="px-3 py-1"
                    onClick={() => onEdit(subscription)}
                    title="Edit subscription"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    className="px-3 py-1"
                    onClick={() => onDelete(subscription.subscriptionId)}
                    title="Delete subscription"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
