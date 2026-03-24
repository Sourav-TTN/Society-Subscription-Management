"use client";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import { UserType } from "@/types/user";
import { AdminType } from "@/types/admin";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { useEffect, useRef, useState } from "react";
import { axiosIns } from "@/lib/axios";

interface UserAvatarProps {
  user?: UserType | AdminType | null;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const logoutbtnref = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        logoutbtnref.current &&
        !logoutbtnref.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.documentElement.addEventListener("click", handleClickOutside);
    return () => {
      document.documentElement.removeEventListener("click", handleClickOutside);
    };
  }, [logoutbtnref, setIsOpen]);

  if (!user) {
    return <Skeleton className="w-36 h-10" />;
  }

  const handleLogout = async () => {
    try {
      if (pathname.startsWith("/admin")) {
        const res = await axiosIns.get("/api/admin/logout");
        console.log(res.data);
      } else {
        const res = await axiosIns.get("/api/users/logout");
        console.log(res.data);
      }
      toast.success("Logged out successfully");
      if (pathname.startsWith("/admin")) {
        router.push("/admin/login");
      } else router.push("/sign-in");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative flex w-36 flex-col">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant={"outline"}
        className="transition truncate focus-visible:bg-white"
      >
        {user?.name}
      </Button>
      {isOpen && (
        <Button
          onClick={handleLogout}
          ref={logoutbtnref}
          className="absolute top-12 inset-x-0 text-black bg-background hover:bg-muted/90"
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      )}
    </div>
  );
};

export default UserAvatar;
