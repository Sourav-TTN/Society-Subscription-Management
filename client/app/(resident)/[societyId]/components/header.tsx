"use client";

import Navigation from "./navigation";
import HeaderLogo from "./header-logo";
import { useAppSelector } from "@/store";
import UserAvatar from "@/components/avatar";

export const Header = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  return (
    <header className="bg-linear-to-b from-emerald-700 to-emerald-500 px-3 lg:px-14 pt-8 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <UserAvatar user={user} />
        </div>
      </div>
    </header>
  );
};
