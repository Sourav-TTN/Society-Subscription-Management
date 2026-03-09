"use client";
import Navigation from "./navigation";
import HeaderLogo from "./header-logo";
import UserAvatar from "@/components/avatar";
import { useAppSelector } from "@/store";

export const Header = () => {
  const { admin } = useAppSelector((store) => store.adminReducer);
  return (
    <header className="bg-linear-to-b from-blue-700 to-blue-500 px-3 lg:px-14 pt-8 pb-36">
      <div className="max-w-screen-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-14">
          <div className="flex items-center lg:gap-x-16">
            <HeaderLogo />
            <Navigation />
          </div>
          <UserAvatar user={admin} />
        </div>
      </div>
    </header>
  );
};
