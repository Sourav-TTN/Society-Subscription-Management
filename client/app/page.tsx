import { Button } from "@/components/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6 flex flex-col">
      <Link href={"/admin/login"}>
        <Button>Admin Login</Button>
      </Link>
      <Link href={"/sign-in"}>
        <Button>Sign-In</Button>
      </Link>
      <Link href={"/sign-up"}>
        <Button>Sign-Up</Button>
      </Link>
    </div>
  );
}
