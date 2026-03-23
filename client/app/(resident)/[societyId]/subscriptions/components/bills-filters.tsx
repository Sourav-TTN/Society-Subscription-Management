"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/button";
import { Dropdown } from "@/components/dropdown";
import { Card, CardContent } from "@/components/card";

interface BillsFiltersProps {
  selectedMonth: string;
  selectedYear: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  monthNames: string[];
}

export const BillsFilters = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onApply,
  onReset,
  monthNames,
}: BillsFiltersProps) => {
  const monthOptions = monthNames.map((month, index) => ({
    value: (index + 1).toString(),
    label: month,
    icon: <Calendar className="h-4 w-4" />,
  }));

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push({
        value: i.toString(),
        label: i.toString(),
        icon: <Calendar className="h-4 w-4" />,
      });
    }
    return years;
  };

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Month
              </label>
              <Dropdown
                options={monthOptions}
                value={selectedMonth}
                onChange={onMonthChange}
                placeholder="Select month"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Year
              </label>
              <Dropdown
                options={yearOptions()}
                value={selectedYear}
                onChange={onYearChange}
                placeholder="Select year"
              />
            </div>
          </div>

          <div className="flex gap-2 sm:ml-auto">
            <Button
              variant="outline"
              onClick={onReset}
              className="whitespace-nowrap"
            >
              Reset to Current
            </Button>
            <Button onClick={onApply} className="whitespace-nowrap">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
