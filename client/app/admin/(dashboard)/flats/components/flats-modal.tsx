"use client";

import z from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";
import { FlatTypesType } from "@/types/flat-type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, MapPin, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dialog";

const flatSchema = z.object({
  flatBlock: z.string().min(1, "Block is required"),
  flatFloor: z.number().min(0, "Floor must be 0 or greater"),
  flatNumber: z.string().min(1, "Flat number is required"),
  flatTypeId: z.string().min(1, "Flat type is required"),
});

type FlatFormData = z.infer<typeof flatSchema>;

interface FlatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FlatFormData) => Promise<void>;
  editingFlat: any | null;
  flatTypes: FlatTypesType[];
}

export const FlatModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingFlat,
  flatTypes,
}: FlatModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FlatFormData>({
    resolver: zodResolver(flatSchema),
    defaultValues: {
      flatBlock: "",
      flatFloor: 0,
      flatNumber: "",
      flatTypeId: "",
    },
  });

  const selectedFlatTypeId = watch("flatTypeId");

  useEffect(() => {
    if (editingFlat) {
      const flatType = flatTypes.find((type) => type.size === editingFlat.size);

      reset({
        flatBlock: editingFlat.flatBlock,
        flatFloor: editingFlat.flatFloor,
        flatNumber: editingFlat.flatNumber,
        flatTypeId: flatType?.flatTypeId || "",
      });
    } else {
      reset({
        flatBlock: "",
        flatFloor: 0,
        flatNumber: "",
        flatTypeId: "",
      });
    }
  }, [editingFlat, flatTypes, reset]);

  const handleFormSubmit = async (data: FlatFormData) => {
    await onSubmit(data);
  };

  const flatTypeOptions = flatTypes.map((type) => ({
    value: type.flatTypeId,
    label: `${type.size} BHK`,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {editingFlat ? "Edit Flat" : "Add New Flat"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Flat Number"
              placeholder="e.g., 101"
              icon={<Hash className="h-4 w-4" />}
              error={errors.flatNumber?.message}
              {...register("flatNumber")}
            />

            <Input
              label="Block"
              placeholder="e.g., A"
              icon={<MapPin className="h-4 w-4" />}
              error={errors.flatBlock?.message}
              {...register("flatBlock")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Floor"
              type="number"
              placeholder="e.g., 1"
              icon={<Home className="h-4 w-4" />}
              error={errors.flatFloor?.message}
              {...register("flatFloor", { valueAsNumber: true })}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                Flat Size
              </label>
              <Dropdown
                options={flatTypeOptions}
                value={selectedFlatTypeId}
                onChange={(value) => setValue("flatTypeId", value)}
                placeholder="Select size"
                className={errors.flatTypeId ? "border-destructive" : ""}
              />
              {errors.flatTypeId && (
                <p className="text-xs text-destructive">
                  {errors.flatTypeId.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? editingFlat
                  ? "Updating..."
                  : "Creating..."
                : editingFlat
                  ? "Update Flat"
                  : "Create Flat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
