"use client";

import { useEffect } from "react";
import { axiosIns } from "@/lib/axios";
import { Loader } from "@/components/loader";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSociety } from "@/store/slices/society-slice";
import { clearUser, setLoading, setUser } from "@/store/slices/user-slice";

export const UserFetch = () => {
  const { loading } = useAppSelector((store) => store.userReducer);
  const dispatch = useAppDispatch();
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

  if (loading) {
    return <Loader />;
  }

  return null;
};
