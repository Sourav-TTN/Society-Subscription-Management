import React from "react";
import { UserFetch } from "./components/user-fetch";

const ResidentLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <UserFetch />
      {children}
    </>
  );
};

export default ResidentLayout;
