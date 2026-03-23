"use client";

import { cn } from "@/lib/utils";
import { useMedia } from "react-use";
import Navigation from "./navigation";
import HeaderLogo from "./header-logo";
import { useAppSelector } from "@/store";
import UserAvatar from "@/components/avatar";

export const Header = () => {
  const isMobile = useMedia("(max-width: 1150px)", false);
  const { admin } = useAppSelector((store) => store.adminReducer);

  return (
    <header className="bg-linear-to-b from-blue-700 to-blue-500 px-3 lg:px-14 pt-8 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          {/* <div className="flex items-center lg:gap-x-16"> */}
          <div className={cn("flex items-center", !isMobile && "gap-x-16")}>
            <HeaderLogo />
            <Navigation />
          </div>
          <UserAvatar user={admin} />
        </div>
      </div>
    </header>
  );
};
