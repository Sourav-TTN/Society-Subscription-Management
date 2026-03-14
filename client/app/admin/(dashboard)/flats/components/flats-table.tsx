"use client";

import { format } from "date-fns";
import { Edit, Trash2, User, UserPlus, UserX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { FlatTypesType } from "@/types/flat-type";
import { ApiFlatsResponse } from "./page-client";

interface FlatsTableProps {
  flats: ApiFlatsResponse[];
  flatTypes: FlatTypesType[];
  onEdit: (flat: any) => void;
  onAssignOwner: (flat: any) => void;
  onRemoveOwner: (flatId: string) => void;
  onDelete: (flatId: string, flatNumber: string) => void;
}

export const FlatsTable = ({
  flats,
  flatTypes,
  onEdit,
  onAssignOwner,
  onRemoveOwner,
  onDelete,
}: FlatsTableProps) => {
  if (flats.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No flats found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click the "Add Flat" button to create your first flat.
        </p>
      </div>
    );
  }

  const getFlatTypeSize = (size: number) => {
    const flatType = flatTypes.find((type) => type.size === size);
    return flatType ? `${size} BHK` : `${size} BHK`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flat Number</TableHead>
            <TableHead>Block</TableHead>
            <TableHead>Floor</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Owner Email</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flats.map((flat) => (
            <TableRow key={flat.flatId}>
              <TableCell className="font-medium">{flat.flatNumber}</TableCell>
              <TableCell>{flat.flatBlock}</TableCell>
              <TableCell>{flat.flatFloor}</TableCell>
              <TableCell>{getFlatTypeSize(flat.size)}</TableCell>
              <TableCell>
                {flat.ownerName ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{flat.ownerName}</span>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Unassigned
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {flat.ownerEmail ? (
                  <span className="text-sm">{flat.ownerEmail}</span>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(flat.createdAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {flat.ownerName ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => onAssignOwner(flat)}
                        title="Change Owner"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onRemoveOwner(flat.flatId)}
                        title="Remove Owner"
                        className="text-destructive hover:text-destructive"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => onAssignOwner(flat)}
                      title="Assign Owner"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => onEdit(flat)}
                    title="Edit Flat"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(flat.flatId, flat.flatNumber)}
                    title="Delete Flat"
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
