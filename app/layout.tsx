// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Udyog Mitra – MSME Scheme Navigator",
  description:
    "AI-powered assistant to help Indian MSMEs with schemes, loans, Udyam registration, GST and delayed payments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${geistMono.variable} bg-app-gradient min-h-screen text-slate-900 antialiased`}
      >
        {/* Center the app content; inner pages control their own layout */}
        <div className="flex min-h-screen w-full justify-center">
          {children}
        </div>

        {/* Global notifications */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
