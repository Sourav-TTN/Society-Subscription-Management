"use client";

import { PendingBillType } from "./types";
import { Badge } from "@/components/badge";
import { User, Mail, Calendar, IndianRupee } from "lucide-react";

interface BillSearchResultsProps {
  bills: PendingBillType[];
  onSelect: (billId: string) => void;
  monthNames: string[];
}

export const BillSearchResults = ({
  bills,
  onSelect,
  monthNames,
}: BillSearchResultsProps) => {
  if (bills.length === 0) {
    return (
      <div className="border rounded-lg p-4 text-center text-muted-foreground">
        No bills found matching your search
      </div>
    );
  }

  return (
    <div className="border rounded-lg max-h-60 overflow-y-auto">
      <div className="divide-y">
        {bills.map((bill) => (
          <button
            key={bill.billId}
            type="button"
            onClick={() => onSelect(bill.billId)}
            className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex items-start gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{bill.ownerName}</span>
                <Badge variant="outline" className="ml-2">
                  Flat {bill.flat}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {bill.ownerEmail}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {monthNames[bill.month - 1]} {bill.year}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {bill.charges}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
