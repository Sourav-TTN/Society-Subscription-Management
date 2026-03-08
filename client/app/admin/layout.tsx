import React from "react";
import { FetchAdmin } from "./components/admin-fetch";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <FetchAdmin />
      {children}
    </>
  );
};

export default AdminLayout;
