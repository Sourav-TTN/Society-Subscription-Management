"use client";

import { axiosIns } from "@/lib/axios";
import { SocietyType } from "@/types/society";
import { Dropdown } from "@/components/dropdown";
import { Input } from "@/components/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, Loader2 } from "lucide-react";
import { useAppSelector } from "@/store";
import { Button } from "@/components/button";

const AddSocietyPage = () => {
  const router = useRouter();
  const { admin, loading } = useAppSelector((store) => store.adminReducer);
  const [societies, setSocieties] = useState<SocietyType[]>([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const getSocieties = async () => {
      setIsLoading(true);
      try {
        const response = await axiosIns.get("/api/society/all");
        setSocieties(response.data.societies);
      } catch (error) {
        setError("Failed to load societies");
      } finally {
        setIsLoading(false);
      }
    };
    getSocieties();
  }, []);

  useEffect(() => {
    if (admin?.societyId) {
      router.replace("/admin/dashboard");
      router.refresh();
    }
  }, [loading]);

  const dropdownOptions = societies.map((society) => ({
    value: society.societyId,
    label: society.name,
    icon: <Building2 className="h-4 w-4" />,
  }));

  const selectedSociety = societies.find(
    (society) => society.societyId === selectedSocietyId,
  );

  async function addSocietyHandler(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedSocietyId) {
      setError("Please select a society");
      return;
    }

    if (!pin || pin.length !== 6 || !/^\d+$/.test(pin)) {
      setError("Please enter a valid 6-digit PIN");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosIns.patch("/api/admin/add-society", {
        societyId: selectedSocietyId,
        adminId: admin?.adminId,
        pin: parseInt(pin),
      });

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (error: any) {
      console.log(error);
      setError(error.response?.data?.error || "Failed to add society");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-medium tracking-tight">
            Choose Your Society
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a society and enter its PIN to continue
          </p>
        </div>

        <form onSubmit={addSocietyHandler} className="space-y-4">
          <div>
            <label className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select Society
            </label>
            <Dropdown
              options={dropdownOptions}
              value={selectedSocietyId}
              onChange={setSelectedSocietyId}
              placeholder="Choose a society"
              disabled={isLoading || isSubmitting}
              className="mt-1"
            />
          </div>

          {selectedSociety && (
            <Input
              label="Society PIN"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit PIN"
              disabled={isSubmitting}
              autoComplete="off"
              icon={<KeyRound className="h-4 w-4" />}
              helperText={`Enter the 6-digit PIN for ${selectedSociety.name}`}
            />
          )}

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={
              isSubmitting || !selectedSocietyId || !pin || pin.length !== 6
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Society...
              </>
            ) : (
              "Add Society"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddSocietyPage;
