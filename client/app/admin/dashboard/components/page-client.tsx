"use client";

import { useAppSelector } from "@/store";

export const AdminDashboardClientPage = () => {
  const { admin } = useAppSelector((store) => store.adminReducer);
  return (
    <div>
      <p className="text-3xl text-rose-600">{admin?.name}</p>
      <p className="text-3xl text-amber-600">{admin?.email}</p>
    </div>
  );
};
