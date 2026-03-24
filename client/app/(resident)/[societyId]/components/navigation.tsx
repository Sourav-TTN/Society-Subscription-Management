"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useMedia } from "react-use";
import { NavButton } from "./nav-button";
import { useAppSelector } from "@/store";
import { Button } from "@/components/button";
import { DialogTitle } from "@/components/dialog";
import { usePathname, useRouter } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Sheet, SheetContent, SheetTrigger } from "@/components/sheet";
import { requestPermission } from "@/lib/firebase";

const routes = [
  {
    href: "dashboard",
    label: "Overview",
  },
  {
    href: "subscriptions",
    label: "Subscriptions",
  },
  {
    href: "pay-now",
    label: "Payments",
  },
  {
    href: "notifications",
    label: "Notifications",
  },
];

const Navigation = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMedia("(max-width: 1024px)", false);
  const { society } = useAppSelector((store) => store.societyReducer);

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  useEffect(() => {
    const getPermission = () => {
      if (!society || !user) return;
      const alreadyAsked = localStorage.getItem("already-asked");

      if (!alreadyAsked) {
        requestPermission(society?.societyId, user?.userId);
        localStorage.setItem("already-asked", "true");
      }
    };

    getPermission();
  }, []);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Button
            asChild
            size="md"
            variant={"outline"}
            className="w-full lg:w-auto justify-between bg-white/10 text-white font-normal hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none focus:bg-white/30 transition py-1.5"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side={"left"} className="px-2">
          <VisuallyHidden>
            <DialogTitle>Navigation Menu</DialogTitle>
          </VisuallyHidden>
          <nav className="pt-12 flex flex-col gap-y-3">
            {routes.map((route) => (
              <Button
                key={route.href}
                onClick={() => onClick(route.href)}
                variant={pathname == route.href ? "secondary" : "ghost"}
                className="justify-start"
              >
                {route.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto overflow-y-hidden">
      {routes.map((route) => (
        <NavButton
          key={route.href}
          href={
            user?.email ? `/${user.userId}/${route.href}` : `/${route.href}`
          }
          label={route.label}
          isActive={pathname === `/${user?.userId}/${route.href}`}
        />
      ))}
    </nav>
  );
};

export default Navigation;
