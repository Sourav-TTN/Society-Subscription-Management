"use client";

import toast from "react-hot-toast";
import { useAppSelector } from "@/store";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { Download, FileText, Loader2 } from "lucide-react";

import { AllBillsTable } from "./all-bills-table";
import { ReportsSkeleton } from "./reports-skeleton";
import { EmptyReportsState } from "./empty-reports-state";
import { ReportsFilter } from "./reports-filter";
import { ReportsSummaryCards } from "./reports-summary-cards";
import { PendingPaymentsTable } from "./pending-payments-table";
import { PaymentMethodBreakdown } from "./payment-method-breakdown";

import { axiosIns } from "@/lib/axios";
import type { ReportsApiResponseType } from "./types";

const monthNames = [
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
];

export const ReportsClientPage = () => {
  const { society } = useAppSelector((store) => store.societyReducer);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [reports, setReports] = useState<ReportsApiResponseType | null>(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
    undefined,
  );

  const getReports = async (
    year: number = selectedYear,
    month: number | undefined = selectedMonth,
  ) => {
    if (!society?.societyId) {
      toast.error("No society selected");
      return;
    }

    try {
      setLoading(true);

      const res = await axiosIns.get<ReportsApiResponseType>(
        `/api/society/${society.societyId}/reports`,
        {
          params: {
            year: year,
            ...(month !== undefined && { month: month }),
          },
        },
      );

      setReports(res.data);

      setSelectedYear(year);
      setSelectedMonth(month);

      const monthText = month ? monthNames[month - 1] : "All";
      // toast.success(`Reports loaded for ${monthText} ${year}`);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (year: number, month: number | undefined) => {
    getReports(year, month);
  };

  useEffect(() => {
    if (society?.societyId) {
      getReports(selectedYear, selectedMonth);
    }
  }, [society?.societyId]);

  const downloadPDF = async () => {
    if (!society?.societyId) {
      toast.error("No society selected");
      return;
    }

    try {
      setDownloadLoading(true);

      const params = new URLSearchParams();
      params.append("year", selectedYear.toString());
      if (selectedMonth !== undefined) {
        params.append("month", selectedMonth.toString());
      }

      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/society/${society.societyId}/reports/generate-report?${params.toString()}`,
      );

      const response = await result.blob();
      const url = URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;

      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);

      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          toast.error(errorData.message || "Failed to download PDF");
        } catch {
          toast.error("Failed to download PDF");
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to download PDF");
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  if (!society?.societyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No society selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View and manage reports for the society"
      >
        <Button
          variant="outline"
          onClick={() => getReports(selectedYear, selectedMonth)}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {loading ? "Loading..." : "Load Reports"}
        </Button>

        <Button
          onClick={downloadPDF}
          disabled={downloadLoading || !reports}
          className="gap-2"
        >
          {downloadLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloadLoading ? "Downloading..." : "Download PDF"}
        </Button>
      </PageHeader>

      {/* <ReportsFilter
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onFilterChange={handleFilterChange}
      /> */}

      {loading && <ReportsSkeleton />}

      {reports && !loading && (
        <>
          <ReportsSummaryCards reports={reports} />
          <PaymentMethodBreakdown reports={reports} />
          <PendingPaymentsTable pendingPayments={reports.pendingPayments} />
          <AllBillsTable bills={reports.bills} />
        </>
      )}

      {!reports && !loading && <EmptyReportsState />}
    </div>
  );
};
