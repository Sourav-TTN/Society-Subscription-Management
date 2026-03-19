"use client";

import { z } from "zod";
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
import { Building2, Loader2, Mail, Lock } from "lucide-react";

const AuthForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [societies, setSocieties] = useState<SocietyType[]>([]);
  const [isFetchingSocieties, setIsFetchingSocieties] = useState(false);
  const [fetchError, setFetchError] = useState("");

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

  const formSchema = z.object({
    societyId: z
      .string("Please select a society")
      .min(1, "Society selection is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .trim(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    defaultValues: {
      societyId: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    try {
      const { societyId, ...credentials } = data;
      const response = await axiosIns.post(
        `/api/society/${societyId}/users/sign-in`,
        credentials,
      );

      toast.success(response.data.message || "Signed in successfully!");
      let society = response.data.society;
      router.push(`${society.societyId}/dashboard`);
      router.refresh();
    } catch (error: any) {
      console.error("Sign-in error:", error);

      if (error.response?.status === 401) {
        toast.error("Invalid email or password");
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
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
    <div className="w-full max-w-137.5 rounded-xl border bg-background mt-5 p-8 shadow-sm mx-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    Signing in to {selectedSociety.name}
                  </p>
                )}
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
                    placeholder="Enter your password"
                    icon={<Lock className="h-4 w-4" />}
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
                Signing In...
              </>
            ) : (
              "Sign In"
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
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-medium underline underline-offset-4"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default AuthForm;
