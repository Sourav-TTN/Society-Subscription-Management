"use client";

import { z } from "zod";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";
import Link from "next/link";
import toast from "react-hot-toast";
import { axiosIns } from "@/lib/axios";
import { Input } from "@/components/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { SocietyType } from "@/types/society";
import { Dropdown } from "@/components/dropdown";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { Building2, Loader2, Mail, User, Lock } from "lucide-react";

const AuthForm = () => {
  const router = useRouter();
  const [fetchError, setFetchError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [societies, setSocieties] = useState<SocietyType[]>([]);
  const [isFetchingSocieties, setIsFetchingSocieties] = useState(false);

  useEffect(() => {
    const getSocieties = async () => {
      setIsFetchingSocieties(true);
      setFetchError("");
      try {
        const response = await axiosIns.get("/api/society/all");
        setSocieties(response.data.societies);
      } catch (error) {
        setFetchError("Failed to load societies. Please try again.");
        toast.error("Failed to fetch societies.");
      } finally {
        setIsFetchingSocieties(false);
      }
    };
    getSocieties();
  }, []);

  const signupSchema = z.object({
    societyId: z
      .string("Please select a society")
      .min(1, "Society selection is required"),
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name is too long")
      .trim(),
    email: z.email("Please enter a valid email address").toLowerCase().trim(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password is too long")
      .trim(),
  });

  type SignupFormValues = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormValues>({
    defaultValues: {
      societyId: "",
      name: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const onSignupSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const { societyId, ...userData } = data;
      const response = await axiosIns.post(
        `/api/society/${societyId}/users/sign-up`,
        userData,
      );
      toast.success(response.data.message || "Account created successfully!");
      router.push("/sign-in");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error || "An error occurred during signup";
        toast.error(errorMessage);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dropdownOptions = societies.map((society) => ({
    value: society.societyId,
    label: society.name,
    icon: <Building2 className="h-4 w-4" />,
  }));

  const selectedSocietyId = form.watch("societyId");
  const selectedSociety = societies.find(
    (society) => society.societyId === selectedSocietyId,
  );

  return (
    <div className="w-full max-w-137.5 rounded-xl border bg-background p-6 mt-5 shadow-sm mx-3">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSignupSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="societyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Society</FormLabel>
                <FormControl>
                  {isFetchingSocieties ? (
                    <div className="flex h-10 items-center justify-center rounded-md border bg-muted/20">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Loading societies...
                      </span>
                    </div>
                  ) : fetchError ? (
                    <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                      {fetchError}
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="ml-2 underline"
                      >
                        Retry
                      </button>
                    </div>
                  ) : (
                    <Dropdown
                      options={dropdownOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choose your society"
                      disabled={isLoading || isFetchingSocieties}
                      className="mt-1"
                    />
                  )}
                </FormControl>
                <FormMessage />
                {selectedSociety && (
                  <p className="text-xs text-muted-foreground mt-1">
                    You're creating an account for {selectedSociety.name}
                  </p>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Enter your full name"
                    icon={<User className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    type="email"
                    placeholder="Enter your email"
                    icon={<Mail className="h-4 w-4" />}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    type="password"
                    placeholder="Create a password"
                    icon={<Lock className="h-4 w-4" />}
                    helperText="Must be at least 6 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={
              isLoading || isFetchingSocieties || societies.length === 0
            }
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>

          {societies.length === 0 && !isFetchingSocieties && !fetchError && (
            <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
              No societies available at the moment. Please check back later.
            </div>
          )}
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium underline underline-offset-4"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default AuthForm;
