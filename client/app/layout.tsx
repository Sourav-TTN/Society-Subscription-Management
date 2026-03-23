import "./globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ReduxStoreProvider } from "@/providers/store-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Society Subscription Management System",
    template: "%s | Society Management",
  },
  description:
    "Streamline your housing society's subscription management with our all-in-one platform. Admins can manage flats, track payments, generate reports, and send notifications. Residents can view bills, pay online, and download receipts.",
  keywords: [
    "society management",
    "subscription management",
    "housing society",
    "payment tracking",
    "flat management",
    "society accounting",
    "resident portal",
    "maintenance collection",
    "society software",
  ],
  authors: [{ name: "TTN" }],
  creator: "TTN",
  publisher: "TTN",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Society Subscription Management System",
    description:
      "Streamline your housing society's subscription management. Track payments, manage flats, and keep residents informed all in one place.",
    type: "website",
    locale: "en_IN",
    siteName: "Society Management System",
  },
  twitter: {
    card: "summary_large_image",
    title: "Society Subscription Management System",
    description:
      "Streamline your housing society's subscription management. Track payments, manage flats, and keep residents informed all in one place.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  category: "Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background")}>
        <ReduxStoreProvider>{children}</ReduxStoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
