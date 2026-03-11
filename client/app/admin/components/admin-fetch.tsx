"use client";

import { useEffect } from "react";
import { axiosIns } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/loader";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearAdmin, setAdmin, setLoading } from "@/store/slices/admin-slice";
import { setSociety } from "@/store/slices/society-slice";

export const FetchAdmin = () => {
  const { loading } = useAppSelector((store) => store.adminReducer);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const getAdmin = async () => {
      try {
        dispatch(setLoading(true));
        const response = await axiosIns.get("/api/admin/get-admin");
        dispatch(setAdmin({ admin: response.data.admin }));

        if (!response.data.admin.societyId) {
          router.push("/admin/add-society");
        }

        dispatch(setSociety({ society: response.data.society }));
      } catch (error) {
        dispatch(clearAdmin());
        router.push("/admin/login");
      } finally {
        dispatch(setLoading(false));
      }
    };

    getAdmin();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return null;
};
