import React from "react";

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="px-4 md:px-6 py-4">{children}</div>;
};
