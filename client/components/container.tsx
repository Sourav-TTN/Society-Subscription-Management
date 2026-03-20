import React from "react";

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-screen-2xl mx-auto w-full -mt-24 pb-10 bg-background border-none drop-shadow-sm min-h-[50vh] rounded-lg p-6 mb-20">
      {children}
    </div>
  );
};
