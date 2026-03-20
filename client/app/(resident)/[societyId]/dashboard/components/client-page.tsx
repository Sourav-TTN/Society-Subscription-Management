"use client";

import { useAppSelector } from "@/store";

export const UserDashboardClientPage = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  const { society } = useAppSelector((store) => store.societyReducer);
  return (
    <div>
      <p className="text-2xl text-rose-600">{user?.name}</p>
      <p className="text-2xl text-amber-600">{user?.email}</p>
      <p className="text-2xl text-emerald-600">{society?.name}</p>
    </div>
  );
};
