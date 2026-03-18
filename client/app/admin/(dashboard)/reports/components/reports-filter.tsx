"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";
import { CalendarIcon, Filter } from "lucide-react";

interface ReportsFilterProps {
  selectedYear: number;
  selectedMonth: number | undefined;
  onFilterChange: (year: number, month: number | undefined) => void;
}

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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);

export const ReportsFilter = ({
  selectedYear,
  selectedMonth,
  onFilterChange,
}: ReportsFilterProps) => {
  const [year, setYear] = useState(selectedYear.toString());
  const [month, setMonth] = useState<string>(
    selectedMonth?.toString() || "all",
  );

  useEffect(() => {
    setYear(selectedYear.toString());
    setMonth(selectedMonth?.toString() || "all");
  }, [selectedYear, selectedMonth]);

  const yearOptions = years.map((y) => ({
    value: y.toString(),
    label: y.toString(),
  }));

  const monthOptions = [
    { value: "all", label: "All Months" },
    ...monthNames.map((name, index) => ({
      value: (index + 1).toString(),
      label: name,
    })),
  ];

  const handleApplyFilter = () => {
    const monthValue = month === "all" ? undefined : parseInt(month);
    onFilterChange(parseInt(year), monthValue);
  };

  const handleReset = () => {
    const defaultYear = currentYear;
    const defaultMonth = undefined;

    setYear(defaultYear.toString());
    setMonth("all");

    onFilterChange(defaultYear, defaultMonth);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border border-border rounded-lg bg-muted/20">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filter by:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="w-30">
          <Dropdown
            options={yearOptions}
            value={year}
            onChange={setYear}
            placeholder="Select year"
          />
        </div>

        <div className="w-35">
          <Dropdown
            options={monthOptions}
            value={month}
            onChange={setMonth}
            placeholder="Select month"
          />
        </div>

        <Button onClick={handleApplyFilter} className="gap-2">
          <Filter className="h-4 w-4" />
          Apply Filter
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="text-muted-foreground hover:text-foreground"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};
