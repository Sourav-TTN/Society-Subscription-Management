import { Button } from "@/components/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link href={"/admin/login"}>
        <Button>Admin Login</Button>
      </Link>
    </div>
  );
}
