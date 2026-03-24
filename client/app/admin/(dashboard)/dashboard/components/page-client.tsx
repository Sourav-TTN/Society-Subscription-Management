"use client";

import { useEffect, useState } from "react";
import { axiosIns } from "@/lib/axios";
import { useAppSelector } from "@/store";

import { CollectionTrendsChart } from "./charts/collection-trends-chart";
import { PaymentDistributionChart } from "./charts/payment-distribution-chart";
import { RevenueOutstandingChart } from "./charts/revenue-outstanding-chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Skeleton } from "@/components/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import { Progress } from "@/components/progress";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Home,
  Filter,
  PieChart,
  LineChart,
  CircleDollarSign,
  Target,
  IndianRupee,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Loader } from "@/components/loader";

interface DashboardOverview {
  totalCollected: number;
  totalPending: number;
  pendingBillsCount: number;
  paidBillsCount: number;
  activeFlats: number;
  collectionRate: number;
}

interface MonthlyTrend {
  month: string;
  monthNumber: number;
  collected: number;
  totalBilled: number;
  pendingCount: number;
  paidCount: number;
  collectionRate: number;
}

interface PaymentMethod {
  method: string;
  amount: number;
  count: number;
  percentage?: number;
}

interface TopPendingFlat {
  flat: string;
  flatId: string;
  pendingBillsCount: number;
  totalPendingAmount: number;
  oldestBillDate: string;
}

interface RevenueOutstandingData {
  year: number;
  monthlyData: Array<{
    month: string;
    monthNumber: number;
    revenue: number;
    outstanding: number;
    totalBilled: number;
  }>;
  yearlySummary: {
    totalRevenue: number;
    totalOutstanding: number;
  };
}

interface CompleteDashboardData {
  overview: DashboardOverview;
  monthlyTrends: MonthlyTrend[];
  paymentMethods: PaymentMethod[];
  topPendingFlats: TopPendingFlat[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export const AdminDashboardClientPage = () => {
  const { admin } = useAppSelector((store) => store.adminReducer);
  const { society } = useAppSelector((store) => store.societyReducer);

  const [completeData, setCompleteData] =
    useState<CompleteDashboardData | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[] | null>(
    null,
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(
    null,
  );
  const [revenueOutstanding, setRevenueOutstanding] =
    useState<RevenueOutstandingData | null>(null);

  const [loading, setLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined,
  );

  const fetchCompleteDashboardData = async () => {
    if (!society?.societyId) return;
    try {
      setLoading(true);
      const res = await axiosIns.get<ApiResponse<CompleteDashboardData>>(
        `/api/society/${society.societyId}/dashboard/?year=${selectedYear}${selectedMonth ? `&month=${selectedMonth}` : ""}`,
      );
      if (res.data.success) {
        setCompleteData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch complete dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyTrends = async () => {
    if (!society?.societyId) return;
    try {
      setLoading(true);
      const res = await axiosIns.get<
        ApiResponse<{ year: number; monthlyTrends: MonthlyTrend[] }>
      >(
        `/api/society/${society.societyId}/dashboard/monthly-collection-trend?year=${selectedYear}`,
      );
      if (res.data.success) {
        setMonthlyTrends(res.data.data.monthlyTrends);
      }
    } catch (error) {
      console.error("Failed to fetch monthly trends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    if (!society?.societyId) return;
    try {
      setLoading(true);
      const res = await axiosIns.get<
        ApiResponse<{ distribution: PaymentMethod[]; totalAmount: number }>
      >(
        `/api/society/${society.societyId}/dashboard/payment-method-distribution?year=${selectedYear}${selectedMonth ? `&month=${selectedMonth}` : ""}`,
      );
      if (res.data.success) {
        const methods = res.data.data.distribution;
        const totalAmount = res.data.data.totalAmount;
        const methodsWithPercentage = methods.map((method) => ({
          ...method,
          percentage: totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0,
        }));
        setPaymentMethods(methodsWithPercentage);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueOutstanding = async () => {
    if (!society?.societyId) return;
    try {
      setLoading(true);
      const res = await axiosIns.get<ApiResponse<RevenueOutstandingData>>(
        `/api/society/${society.societyId}/dashboard/revenue-vs-outstanding?year=${selectedYear}${selectedMonth ? `&month=${selectedMonth}` : ""}`,
      );
      if (res.data.success) {
        setRevenueOutstanding(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue vs outstanding:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (society?.societyId) {
      fetchCompleteDashboardData();
      fetchMonthlyTrends();
      fetchPaymentMethods();
      fetchRevenueOutstanding();
    }
  }, [society?.societyId]);

  useEffect(() => {
    if (society?.societyId) {
      fetchCompleteDashboardData();
      fetchMonthlyTrends();
      fetchPaymentMethods();
      fetchRevenueOutstanding();
    }
  }, [selectedYear, selectedMonth]);

  const refreshAllData = () => {
    fetchCompleteDashboardData();
    fetchMonthlyTrends();
    fetchPaymentMethods();
    fetchRevenueOutstanding();
  };

  if (!society) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Society Selected</AlertTitle>
          <AlertDescription>
            Please select a society to view the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return <Loader className="bg-foregroun/10" />;
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${admin?.name || "Admin"}! Here's what's happening with your society today.`}
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
            <SelectContent className="border-2 shadow border-primary/50">
              {[2026, 2025, 2024, 2023].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth?.toString() || "all"}
            onValueChange={(value) =>
              setSelectedMonth(value === "all" ? undefined : parseInt(value))
            }
          >
            <SelectTrigger className="w-36">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, index) => (
                <SelectItem key={month} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="space-y-4 mt-4">
        {completeData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Collected
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {formatCurrency(completeData.overview.totalCollected)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Pending
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      {formatCurrency(completeData.overview.totalPending)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {completeData.overview.pendingBillsCount} pending bills
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Collection Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {completeData.overview.collectionRate.toFixed(1)}%
                    </p>
                    <div className="mt-2">
                      <Progress
                        value={completeData.overview.collectionRate}
                        className="h-2"
                      />
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Active Flats
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {completeData.overview.activeFlats}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {completeData.overview.paidBillsCount} paid /{" "}
                      {completeData.overview.pendingBillsCount} pending
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Home className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Collection Trends
              </CardTitle>
              <CardDescription>
                Monthly collection performance comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CollectionTrendsChart
                data={completeData?.monthlyTrends || monthlyTrends || []}
                variant="area"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Payment Methods Distribution
              </CardTitle>
              <CardDescription>Breakdown by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentDistributionChart
                data={paymentMethods || completeData?.paymentMethods || []}
              />
            </CardContent>
          </Card>
        </div>

        {revenueOutstanding && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5" />
                Revenue vs Outstanding
              </CardTitle>
              <CardDescription>
                Comparison of collected revenue vs pending payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueOutstandingChart data={revenueOutstanding.monthlyData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
