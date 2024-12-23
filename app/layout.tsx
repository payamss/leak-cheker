import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "./main/NavBar";
import Footer from "./main/Footer";
import "./globals.css";

import CookieConsent from "./main/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Security Risk Checker",
  description:
    "What is a DNS Leak? A DNS Leak occurs when your DNS queries are sent to unintended DNS servers—often the default servers provided by your ISP—rather than private or VPN-provided servers. This exposes your browsing activity to your ISP or third parties, undermining your online privacy and security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen`}
      >
        <NavBar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
