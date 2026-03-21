"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store";
import { getMessagingSafe, requestPermission } from "@/lib/firebase";
import { setupForegroundListener } from "@/lib/foreground";

export const UserDashboardClientPage = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  const { society } = useAppSelector((store) => store.societyReducer);

  useEffect(() => {
    const initNotifications = async () => {
      if (!society || !user) return;

      const messaging = await getMessagingSafe();
      if (messaging) {
        setupForegroundListener(messaging);
      }
      // localStorage.setItem("already-asked", "false");
      const alreadAsked = localStorage.getItem("already-asked");
      if (alreadAsked == "true") return;

      localStorage.setItem("already-asked", "true");
      await requestPermission(society?.societyId, user?.userId);
    };

    initNotifications();
  }, [society?.societyId, user?.userId]);

  return (
    <div>
      <p className="text-2xl text-rose-600">{user?.name}</p>
      <p className="text-2xl text-amber-600">{user?.email}</p>
      <p className="text-2xl text-emerald-600">{society?.name}</p>
    </div>
  );
};
