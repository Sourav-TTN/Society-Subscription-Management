"use client";

import { useAppSelector } from "@/store";

export const AdminDashboardClientPage = () => {
  const { admin } = useAppSelector((store) => store.adminReducer);
  const { society } = useAppSelector((store) => store.societyReducer);
  return (
    <div>
      <p className="text-2xl text-rose-600">{admin?.name}</p>
      <p className="text-2xl text-amber-600">{admin?.email}</p>
      <p className="text-2xl text-emerald-600">{society?.name}</p>
    </div>
  );
};
