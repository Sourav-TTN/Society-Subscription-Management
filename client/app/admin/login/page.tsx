"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppSelector } from "@/store";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { AuthSocialButton } from "./components/auth-social-button";

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, loading } = useAppSelector((store) => store.adminReducer);

  useEffect(() => {
    if (admin) router.push("/admin/dashboard");
  }, [loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Admin Sign In
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Continue with Google to access the dashboard
          </p>
        </div>
        <Link href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`}>
          <AuthSocialButton
            Icon={FcGoogle}
            text="Continue with Google"
            onClick={() => {}}
          />
        </Link>
      </div>
    </div>
  );
}
