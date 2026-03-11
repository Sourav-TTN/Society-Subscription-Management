"use client";

import toast from "react-hot-toast";
import { axiosIns } from "@/lib/axios";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { SubscriptionTable } from "./subscription-table";
import { SubscriptionModal } from "./subscription-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";

export interface ApiSubscriptionResponse {
  subscriptionId: string;
  flatTypeId: string;
  size: number;
  charges: string;
  effectiveFrom: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SubscriptionsClientPage = () => {
  const { society } = useAppSelector((store) => store.societyReducer);
  const { admin } = useAppSelector((store) => store.adminReducer);

  const [subscriptions, setSubscriptions] = useState<ApiSubscriptionResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<ApiSubscriptionResponse | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    subscriptionId: string | null;
  }>({
    isOpen: false,
    subscriptionId: null,
  });

  const mapSubscription = (sub: ApiSubscriptionResponse) => ({
    subscriptionId: sub.subscriptionId,
    flatTypeId: sub.flatTypeId,
    size: sub.size,
    charges: sub.charges,
    createdBy: sub.createdBy,
    effectiveFrom: new Date(sub.effectiveFrom),
    createdAt: new Date(sub.createdAt),
    updatedAt: new Date(sub.updatedAt),
  });

  const fetchSubscriptions = async () => {
    if (!society?.societyId) return;

    try {
      setLoading(true);

      const res = await axiosIns.get(
        `/api/society/${society.societyId}/subscriptions`,
      );

      const transformed = res.data.subscriptions.map(mapSubscription);

      setSubscriptions(transformed);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [society?.societyId]);

  const handleAdd = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subscription: ApiSubscriptionResponse) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDelete = async (subscriptionId: string) => {
    try {
      await axiosIns.delete(
        `/api/society/${society?.societyId}/subscriptions/${subscriptionId}`,
      );

      toast.success("Subscription deleted successfully");
      fetchSubscriptions();
    } catch (error: any) {
      console.error("Error deleting subscription:", error);
      toast.error(
        error.response?.data?.error || "Failed to delete subscription",
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.subscriptionId) return;

    await handleDelete(deleteConfirm.subscriptionId);

    setDeleteConfirm({
      isOpen: false,
      subscriptionId: null,
    });
  };

  const handleSubmit = async (formData: any) => {
    try {
      const effectiveFrom = `${formData.effectiveFrom}-01`;

      if (editingSubscription) {
        await axiosIns.patch(
          `/api/society/${society?.societyId}/subscriptions/${editingSubscription.subscriptionId}`,
          {
            charges: formData.charges,
            effectiveFrom,
          },
        );

        toast.success("Subscription updated successfully");
      } else {
        await axiosIns.post(
          `/api/society/${society?.societyId}/subscriptions`,
          {
            size: formData.size,
            charges: formData.charges,
            effectiveFrom,
            createdBy: admin?.adminId,
          },
        );

        toast.success("Subscription created successfully");
      }

      setIsModalOpen(false);
      fetchSubscriptions();
    } catch (error: any) {
      console.error("Error saving subscription:", error);
      toast.error(error.response?.data?.error || "Failed to save subscription");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-75">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Manage subscription charges for different flat types"
        actionLabel="Add Subscription"
        onAction={handleAdd}
      />

      <SubscriptionTable
        subscriptions={subscriptions}
        onEdit={handleEdit}
        onDelete={(id) =>
          setDeleteConfirm({ isOpen: true, subscriptionId: id })
        }
      />

      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        editingSubscription={editingSubscription}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, subscriptionId: null })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Subscription"
        description="Are you sure you want to delete this subscription?"
      />
    </div>
  );
};
