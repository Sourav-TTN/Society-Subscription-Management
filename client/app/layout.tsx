import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ReduxStoreProvider } from "@/providers/store-provider";
import { Toaster } from "react-hot-toast";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Society Subscription Management",
  description: "Generated at TTN",
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
