import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Robertus William Susanto | Computer Engineering Student",
  description: "Computer Engineering Student focusing on AI Development (Computer Vision) and Software Engineering.",
  metadataBase: new URL("https://robertuswilliamsusanto.com"),
  openGraph: {
    title: "Robertus William Susanto | Portfolio",
    description: "Computer Engineering Student focusing on AI Development (Computer Vision) and Software Engineering.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased bg-grid min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto w-full flex flex-col gap-32">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}