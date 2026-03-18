"use client";
import NavButton from "./nav-button";
import { usePathname, useRouter } from "next/navigation";
import { useMedia } from "react-use";
import { useState } from "react";

const routes = [
  {
    href: "/admin/dashboard",
    label: "Overview",
  },
  {
    href: "/admin/flats",
    label: "Flats",
  },
  {
    href: "/admin/subscriptions",
    label: "Subscriptions",
  },
  {
    href: "/admin/monthly-records",
    label: "Records",
  },
  {
    href: "/admin/payment-entry",
    label: "Payments",
  },
  {
    href: "/admin/reports",
    label: "Reports",
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
  },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMedia("(max-width: 1024px)", false);

  const onClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  if (isMobile) {
    return null;
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      {routes.map((route) => (
        <NavButton
          key={route.href}
          href={route.href}
          label={route.label}
          isActive={pathname === route.href}
        />
      ))}
    </nav>
  );
};

export default Navigation;
