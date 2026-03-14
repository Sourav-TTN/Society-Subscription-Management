"use client";

import z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";
import { UserType } from "@/types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";

const assignOwnerSchema = z.object({
  ownerId: z.string().min(1, "Please select an owner"),
});

type AssignOwnerFormData = z.infer<typeof assignOwnerSchema>;

interface AssignOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { flatId: string; ownerId: string }) => Promise<void>;
  flat: {
    flatId: string;
    flatNumber: string;
    ownerName?: string | null;
    ownerEmail?: string | null;
  } | null;
  users: UserType[];
}

export const AssignOwnerModal = ({
  isOpen,
  onClose,
  onSubmit,
  flat,
  users,
}: AssignOwnerModalProps) => {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignOwnerFormData>({
    resolver: zodResolver(assignOwnerSchema),
    defaultValues: {
      ownerId: "",
    },
  });

  const selectedOwnerId = watch("ownerId");

  useEffect(() => {
    if (flat?.ownerEmail) {
      const existingOwner = users.find(
        (user) => user.email === flat.ownerEmail,
      );
      if (existingOwner) {
        setValue("ownerId", existingOwner.userId);
      }
    } else {
      reset({ ownerId: "" });
    }
  }, [flat, users, setValue, reset]);

  const handleFormSubmit = async (data: AssignOwnerFormData) => {
    if (!flat) return;
    await onSubmit({
      flatId: flat.flatId,
      ownerId: data.ownerId,
    });
  };

  const userOptions = users.map((user) => ({
    value: user.userId,
    label: `${user.name} (${user.email})`,
    icon: <User className="h-4 w-4" />,
  }));

  const currentOwner = flat?.ownerEmail
    ? users.find((user) => user.email === flat.ownerEmail)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {flat?.ownerName ? "Change Owner" : "Assign Owner"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="bg-muted/40 border border-border rounded-lg p-3">
            <p className="text-sm text-foreground">
              <span className="font-medium">Flat:</span> {flat?.flatNumber}
            </p>
            {currentOwner && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Current Owner:</span>{" "}
                {currentOwner.name} ({currentOwner.email})
              </p>
            )}
          </div>

          {users.length === 0 ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-medium text-destructive">No Users Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  There are no registered users in this society yet. Request
                  residents to create their accounts first.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Select Owner
              </label>
              <Dropdown
                options={userOptions}
                value={selectedOwnerId}
                onChange={(value) => setValue("ownerId", value)}
                placeholder="Choose a user as owner"
                className={errors.ownerId ? "border-destructive" : ""}
              />
              {errors.ownerId && (
                <p className="text-xs text-destructive">
                  {errors.ownerId.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                If the required user is not in the list, request them to create
                their account first.
              </p>
            </div>
          )}

          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {users.length > 0 && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Assigning..."
                  : flat?.ownerName
                    ? "Update Owner"
                    : "Assign Owner"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
