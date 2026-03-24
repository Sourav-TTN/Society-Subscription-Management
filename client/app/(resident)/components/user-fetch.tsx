"use client";

import { useEffect } from "react";
import { axiosIns } from "@/lib/axios";
import { Loader } from "@/components/loader";
import { getMessagingSafe } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSociety } from "@/store/slices/society-slice";
import { setupForegroundListener } from "@/lib/foreground";
import { updateNotification } from "@/store/slices/notification-slice";
import { clearUser, setLoading, setUser } from "@/store/slices/user-slice";

export const UserFetch = () => {
  const { loading } = useAppSelector((store) => store.userReducer);
  const dispatch = useAppDispatch();
  const { gotNew } = useAppSelector((store) => store.notificationReducer);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axiosIns.get("/api/users/get-user");
        dispatch(setUser({ user: response.data.user }));
        const society = response.data.society;
        dispatch(setSociety({ society: response.data.society }));

        if (pathname == "/sign-in" || pathname == "/sign-up") {
          router.push(`/${society.societyId}/dashboard`);
        }
      } catch (error) {
        dispatch(clearUser());
        router.push("/sign-in");
      } finally {
        dispatch(setLoading(false));
      }
    };

    getUser();
  }, []);

  const updateNotifications = () => {
    dispatch(updateNotification(!gotNew));
  };

  useEffect(() => {
    const initializeForegroundListener = async () => {
      const messaging = await getMessagingSafe();
      if (messaging) {
        setupForegroundListener(messaging, updateNotifications);
      }
    };

    initializeForegroundListener();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return null;
};
