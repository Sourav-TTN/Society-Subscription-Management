"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "@/store";
import { Button } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { Download, FileText, Loader2 } from "lucide-react";

import { AllBillsTable } from "./all-bills-table";
import { ReportsSkeleton } from "./reports-skeleton";
import { EmptyReportsState } from "./empty-reports-state";
import { ReportsSummaryCards } from "./reports-summary-cards";
import { PendingPaymentsTable } from "./pending-payments-table";
import { PaymentMethodBreakdown } from "./payment-method-breakdown";

import { axiosIns } from "@/lib/axios";
import type { ReportsApiResponseType } from "./types";

export const ReportsClientPage = () => {
  const { society } = useAppSelector((store) => store.societyReducer);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [reports, setReports] = useState<ReportsApiResponseType | null>(null);

  const getReports = async () => {
    if (!society?.societyId) {
      toast.error("No society selected");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosIns.get<ReportsApiResponseType>(
        `/api/society/${society.societyId}/reports`,
      );
      setReports(res.data);
      toast.success("Reports loaded successfully");
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!society?.societyId) {
      toast.error("No society selected");
      return;
    }

    try {
      setDownloadLoading(true);
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/society/${society.societyId}/reports/generate-report`,
      );

      const response = await result.blob();

      console.log(response);

      // const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(response);
      const link = document.createElement("a");
      link.href = url;

      // const currentDate = new Date().toISOString().split("T")[0];
      // link.download = `society-report-${currentDate}.pdf`;

      document.body.appendChild(link);
      link.target = "_blank";
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
          onClick={getReports}
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
