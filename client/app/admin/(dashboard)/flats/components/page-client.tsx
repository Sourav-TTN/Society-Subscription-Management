"use client";

import toast from "react-hot-toast";
import { axiosIns } from "@/lib/axios";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAppSelector } from "@/store";

import { FlatModal } from "./flats-modal";
import { FlatsTable } from "./flats-table";
import { AssignOwnerModal } from "./assign-owner-modal";

import { UserType } from "@/types/user";
import { FlatTypesType } from "@/types/flat-type";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";

export type ApiFlatsResponse = {
  flatId: string;
  flatBlock: string;
  flatFloor: number;
  flatNumber: string;
  size: number;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface FlatFormData {
  flatBlock: string;
  flatFloor: number;
  flatNumber: string;
  flatTypeId: string;
}

interface AssignOwnerData {
  flatId: string;
  ownerId: string;
}

export const FlatsClientPage = () => {
  const router = useRouter();

  const { admin } = useAppSelector((store) => store.adminReducer);
  const { society } = useAppSelector((store) => store.societyReducer);

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [flats, setFlats] = useState<ApiFlatsResponse[]>([]);
  const [flatTypesLoading, setFlatTypesLoading] = useState(true);
  const [flatTypes, setFlatTypes] = useState<FlatTypesType[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlat, setEditingFlat] = useState<ApiFlatsResponse | null>(null);

  const [isAssignOwnerModalOpen, setIsAssignOwnerModalOpen] = useState(false);
  const [selectedFlatForOwner, setSelectedFlatForOwner] =
    useState<ApiFlatsResponse | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    flatId: string | null;
    flatNumber: string;
  }>({
    isOpen: false,
    flatId: null,
    flatNumber: "",
  });

  const fetchFlatTypes = async () => {
    if (!society?.societyId) return;

    try {
      setFlatTypesLoading(true);
      const res = await axiosIns.get(
        `/api/society/${society.societyId}/flat-types`,
      );
      console.log(res.data);
      setFlatTypes(res.data.flatTypes);
    } catch (error) {
      console.error("Error fetching flat types:", error);
      toast.error("Failed to load flat types");
    } finally {
      setFlatTypesLoading(false);
    }
  };

  const fetchFlats = async () => {
    if (!society?.societyId) return;

    try {
      setLoading(true);
      const res = await axiosIns.get(`/api/society/${society.societyId}/flats`);
      setFlats(res.data.flats);
    } catch (error: any) {
      console.error("Error fetching flats:", error);
      toast.error(error.response?.data?.error || "Failed to load flats");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!society?.societyId) return;

    try {
      setUsersLoading(true);
      const res = await axiosIns.get(`/api/society/${society.societyId}/users`);
      setUsers(res.data.users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.error || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (society?.societyId) {
      fetchFlatTypes();
      fetchFlats();
      fetchUsers();
    }
  }, [society?.societyId]);

  const handleAdd = () => {
    if (flatTypes.length === 0) {
      toast.error(
        "No flat types found. Please create a subscription first to add flat types.",
        {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5" />,
        },
      );
      return;
    }
    setEditingFlat(null);
    setIsModalOpen(true);
  };

  const handleEdit = (flat: ApiFlatsResponse) => {
    setEditingFlat(flat);
    setIsModalOpen(true);
  };

  const handleOpenAssignOwnerModal = (flat: ApiFlatsResponse) => {
    setSelectedFlatForOwner(flat);
    setIsAssignOwnerModalOpen(true);
  };

  const handleDelete = async (flatId: string) => {
    try {
      await axiosIns.delete(
        `/api/society/${society?.societyId}/flats/${flatId}`,
      );

      toast.success("Flat deleted successfully");
      fetchFlats();
    } catch (error: any) {
      console.error("Error deleting flat:", error);
      toast.error(error.response?.data?.error || "Failed to delete flat");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.flatId) return;

    await handleDelete(deleteConfirm.flatId);

    setDeleteConfirm({
      isOpen: false,
      flatId: null,
      flatNumber: "",
    });
  };

  const handleSubmit = async (formData: FlatFormData) => {
    try {
      const selectedFlatType = flatTypes.find(
        (type) => type.flatTypeId === formData.flatTypeId,
      );

      if (!selectedFlatType) {
        toast.error("Invalid flat type selected");
        return;
      }

      if (editingFlat) {
        const updateData: any = {
          flatBlock: formData.flatBlock,
          flatFloor: formData.flatFloor,
          flatNumber: formData.flatNumber,
          flatTypeId: formData.flatTypeId,
        };

        await axiosIns.patch(
          `/api/society/${society?.societyId}/flats/${editingFlat.flatId}`,
          updateData,
        );

        toast.success("Flat updated successfully");
      } else {
        await axiosIns.post(`/api/society/${society?.societyId}/flats`, {
          flatBlock: formData.flatBlock,
          flatFloor: formData.flatFloor,
          flatNumber: formData.flatNumber,
          societyId: society?.societyId,
          flatTypeId: formData.flatTypeId,
          createdBy: admin?.adminId,
        });

        toast.success("Flat created successfully");
      }

      setIsModalOpen(false);
      fetchFlats();
    } catch (error: any) {
      console.error("Error saving flat:", error);
      toast.error(error.response?.data?.error || "Failed to save flat");
      throw error;
    }
  };

  const handleAssignOwner = async (data: AssignOwnerData) => {
    try {
      await axiosIns.patch(
        `/api/society/${society?.societyId}/flats/${data.flatId}/assign-owner`,
        {
          ownerId: data.ownerId,
        },
      );

      toast.success("Owner assigned successfully");
      setIsAssignOwnerModalOpen(false);
      setSelectedFlatForOwner(null);
      fetchFlats();
    } catch (error: any) {
      console.error("Error assigning owner:", error);
      toast.error(error.response?.data?.error || "Failed to assign owner");
      throw error;
    }
  };

  const handleRemoveOwner = async (flatId: string) => {
    try {
      await axiosIns.patch(
        `/api/society/${society?.societyId}/flats/${flatId}/remove-owner`,
      );

      toast.success("Owner removed successfully");
      fetchFlats();
    } catch (error: any) {
      console.error("Error removing owner:", error);
      toast.error(error.response?.data?.error || "Failed to remove owner");
    }
  };

  if (!society?.societyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No society selected</p>
      </div>
    );
  }

  if (loading || flatTypesLoading || usersLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flats"
        description="Add new flats and manage existing ones in your society."
        actionLabel="Add Flat"
        onAction={handleAdd}
      />

      {flatTypes.length === 0 && (
        <div className="bg-muted border border-border rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />

          <div>
            <h3 className="font-medium text-foreground">No Flat Types Found</h3>

            <p className="text-sm text-muted-foreground mt-1">
              You need to create flat types first before adding flats. Please go
              to the Subscriptions page to create flat types.
            </p>

            <Button
              className="mt-3"
              onClick={() => router.push("/dashboard/subscriptions")}
            >
              Go to Subscriptions
            </Button>
          </div>
        </div>
      )}

      <FlatsTable
        flats={flats}
        flatTypes={flatTypes}
        onEdit={handleEdit}
        onAssignOwner={handleOpenAssignOwnerModal}
        onRemoveOwner={handleRemoveOwner}
        onDelete={(flatId, flatNumber) =>
          setDeleteConfirm({ isOpen: true, flatId, flatNumber })
        }
      />

      <FlatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingFlat={editingFlat}
        flatTypes={flatTypes}
      />

      <AssignOwnerModal
        isOpen={isAssignOwnerModalOpen}
        onClose={() => {
          setIsAssignOwnerModalOpen(false);
          setSelectedFlatForOwner(null);
        }}
        onSubmit={handleAssignOwner}
        flat={selectedFlatForOwner}
        users={users}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, flatId: null, flatNumber: "" })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Flat"
        description={`Are you sure you want to delete flat ${deleteConfirm.flatNumber}? This action cannot be undone.`}
      />
    </div>
  );
};
