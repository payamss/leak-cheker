import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
import LayoutWrapper from "./components/LayoutWrapper";
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
  title: "Security Suite",
  description:
    "Comprehensive security testing platform featuring DNS leak detection, IP leak testing, WebRTC vulnerability assessment, VPN effectiveness analysis, privacy auditing, and dark web exposure monitoring. Protect your digital privacy and security with our advanced testing tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gray-100`}
      >
        <LayoutWrapper>
          <Sidebar />
          {children}
        </LayoutWrapper>
        <CookieConsent />
      </body>
    </html>
  );
}
