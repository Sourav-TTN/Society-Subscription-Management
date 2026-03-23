import Link from "next/link";
import Image from "next/image";

const HeaderLogo = () => {
  return (
    <Link href={"/"}>
      <div className="items-center hidden lg:flex">
        <Image src={"/logo.svg"} width={28} height={28} alt="logo" />
        <p className="font-semibold text-white text-2xl ml-1">SSM Resident</p>
      </div>
    </Link>
  );
};

export default HeaderLogo;
