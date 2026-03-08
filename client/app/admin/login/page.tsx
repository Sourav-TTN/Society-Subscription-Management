"use client";

import { FcGoogle } from "react-icons/fc";
import { AuthSocialButton } from "./components/auth-social-button";
import Link from "next/link";

export default function AdminLoginPage() {
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
            onClick={() => {
              // window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
            }}
          />
        </Link>
      </div>
    </div>
  );
}
