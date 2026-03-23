"use client";

import { axiosIns } from "@/lib/axios";
import { Calendar } from "lucide-react";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";

import { AlertCircle } from "lucide-react";
import { Loader } from "@/components/loader";
import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/select";

import { StatsCards } from "./stats-cards";
import { ChartsSection } from "./charts-section";
import { PropertiesSection } from "./properties-section";
import { PaymentOverviewCard } from "./payment-overview-card";

import { ResidentDashboardData, ApiResponse } from "./types";

export const UserDashboardClientPage = () => {
  const { user } = useAppSelector((store) => store.userReducer);
  const { society } = useAppSelector((store) => store.societyReducer);

  const [dashboardData, setDashboardData] =
    useState<ResidentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchDashboardData = async () => {
    if (!society?.societyId || !user?.userId) return;

    try {
      setLoading(true);
      const res = await axiosIns.get<ApiResponse<ResidentDashboardData>>(
        `/api/society/${society.societyId}/dashboard/users/${user.userId}/complete?year=${selectedYear}`,
      );
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch resident dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (society?.societyId && user?.userId) {
      fetchDashboardData();
    }
  }, [society?.societyId, user?.userId, selectedYear]);

  const getPaymentMethodDistribution = () => {
    if (!dashboardData?.paymentMethods) return [];
    const total = dashboardData.paymentMethods.reduce(
      (sum, method) => sum + method.amount,
      0,
    );
    return dashboardData.paymentMethods.map((method) => ({
      ...method,
      percentage: total > 0 ? (method.amount / total) * 100 : 0,
    }));
  };

  if (!society || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            Please ensure you're logged in and have a society assigned.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <Loader className="bg-background" />;
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Unable to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const paymentMethodsWithPercentage = getPaymentMethodDistribution();

  return (
    <div className="min-h-screen">
      <PageHeader
        title="My Dashboard"
        description={`Welcome back, ${dashboardData.user.name}! Here's your payment summary and billing history.`}
      >
        <div className="flex gap-3">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                new Date().getFullYear(),
                new Date().getFullYear() - 1,
                new Date().getFullYear() - 2,
              ].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="space-y-6 mt-4">
        <PropertiesSection flats={dashboardData.flats} />

        <StatsCards overview={dashboardData.overview} />

        <ChartsSection
          monthlyTrends={dashboardData.monthlyTrends}
          paymentMethods={paymentMethodsWithPercentage}
          selectedYear={selectedYear}
        />

        <PaymentOverviewCard monthlyTrends={dashboardData.monthlyTrends} />
      </div>
    </div>
  );
};
