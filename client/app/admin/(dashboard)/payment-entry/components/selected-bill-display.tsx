"use client";

import { PendingBillType } from "./types";
import { Badge } from "@/components/badge";
import { User, Home, Mail, Calendar, IndianRupee } from "lucide-react";

interface SelectedBillDisplayProps {
  bill: PendingBillType;
  monthNames: string[];
}

export const SelectedBillDisplay = ({
  bill,
  monthNames,
}: SelectedBillDisplayProps) => {
  return (
    <div className="bg-muted/40 border border-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Selected Bill</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{bill.ownerName}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Home className="h-3 w-3 text-muted-foreground" />
                <span>Flat {bill.flat}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>{bill.ownerEmail}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>
                  {monthNames[bill.month - 1]} {bill.year}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">₹{bill.charges}</span>
              </div>
            </div>
          </div>
        </div>
        <Badge variant="warning">Pending</Badge>
      </div>
    </div>
  );
};
