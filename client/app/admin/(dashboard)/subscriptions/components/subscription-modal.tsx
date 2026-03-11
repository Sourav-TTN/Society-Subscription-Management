"use client";

import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/dialog";
import { format } from "date-fns";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { useState, useEffect } from "react";
import { Home, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { ApiSubscriptionResponse } from "./page-client";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  editingSubscription: ApiSubscriptionResponse | null;
}

export const SubscriptionModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingSubscription,
}: SubscriptionModalProps) => {
  const [formData, setFormData] = useState({
    size: "",
    charges: "",
    effectiveFrom: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingSubscription) {
      setFormData({
        size: editingSubscription.size.toString(),
        charges: editingSubscription.charges,
        effectiveFrom: editingSubscription.effectiveFrom
          ? format(new Date(editingSubscription.effectiveFrom), "yyyy-MM")
          : "",
      });
    } else {
      setFormData({
        size: "",
        charges: "",
        effectiveFrom: "",
      });
    }

    setError(null);
  }, [editingSubscription, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const sizeNum = parseInt(formData.size);

    if (isNaN(sizeNum) || sizeNum <= 0) {
      setError("Please enter a valid flat size (positive number)");
      setLoading(false);
      return;
    }

    try {
      await onSubmit({
        ...formData,
        size: sizeNum,
      });

      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Failed to save subscription. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !loading) {
      onClose();
    }
  };

  const title = editingSubscription
    ? "Edit Subscription"
    : "Add New Subscription";

  const description = editingSubscription
    ? "Make changes to the subscription details below."
    : "Fill in the details below to create a new subscription.";

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (loading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingSubscription ? (
            <Input
              label="Flat Size"
              type="number"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              placeholder="Enter flat size in bhk"
              required
              min="1"
              step="1"
              disabled={loading}
              icon={<Home className="h-4 w-4" />}
            />
          ) : (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                Editing subscription for:{" "}
                <span className="font-medium text-foreground">
                  {formData.size} bhk
                </span>
              </p>
            </div>
          )}

          <Input
            label="Charges (₹)"
            type="number"
            name="charges"
            value={formData.charges}
            onChange={handleInputChange}
            placeholder="Enter charges"
            required
            min="0"
            step="0.01"
            disabled={loading}
            icon={<CreditCard className="h-4 w-4" />}
          />

          <Input
            label="Effective From"
            type="month"
            name="effectiveFrom"
            value={formData.effectiveFrom}
            onChange={handleInputChange}
            required
            disabled={loading}
            icon={<Calendar className="h-4 w-4" />}
          />

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editingSubscription
                  ? "Update Subscription"
                  : "Add Subscription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
