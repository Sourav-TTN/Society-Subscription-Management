import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMedia } from "react-use";
import { Building2 } from "lucide-react";

const HeaderLogo = () => {
  const isMobile = useMedia("(max-width: 1150px)", false);
  return (
    <Link href={"/"}>
      <div className={cn("items-center", isMobile ? "hidden" : "flex")}>
        {/* <Image src={"/logo.svg"} width={28} height={28} alt="logo" /> */}
        <Building2 className="size-7 text-primary-foreground" />
        <p className="font-semibold text-white text-2xl ml-2">SSM Admin</p>
      </div>
    </Link>
  );
};

export default HeaderLogo;
