import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import {
  Building2,
  ShieldCheck,
  Home as LHome,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Society Management System
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Streamline your housing society's subscription management, payments,
            and communication in one place.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto">
          <Card className="flex-1 hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Admin Portal</CardTitle>
              </div>
              <CardDescription className="text-base">
                Manage flats, subscriptions, payments, and send notifications to
                residents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Flat & resident management</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Track monthly records</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Generate financial reports</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Push notifications to residents</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/admin/login" className="w-full">
                <Button className="w-full group">
                  Login as Admin
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="flex-1 hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-emerald-500">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <LHome className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-2xl">Resident Portal</CardTitle>
              </div>
              <CardDescription className="text-base">
                View your subscription status, payment history, and pay your
                monthly dues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>View monthly bills & status</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Multiple Flats</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Interactive Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Receive notifications</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/sign-in" className="w-full">
                <Button
                  variant="outline"
                  className="w-full group bg-linear-to-b from-emerald-500 to-emerald-700 text-primary-foreground hover:text-primary-foreground hover:opacity-80"
                >
                  Login as Resident
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
