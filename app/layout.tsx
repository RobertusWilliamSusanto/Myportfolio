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
  description: "Computer Engineering Student at Diponegoro University focusing on AI Development (Computer Vision) and Software Engineering.",
  metadataBase: new URL("https://robertuswilliamsusanto.com"),
  keywords: [
    "Robertus William Susanto",
    "Computer Engineering",
    "Diponegoro University",
    "AI Development",
    "Computer Vision",
    "YOLO",
    "Software Engineering",
    "Portfolio"
  ],
  authors: [{ name: "Robertus William Susanto", url: "https://www.linkedin.com/in/robertuswilliamsusanto" }],
  openGraph: {
    title: "Robertus William Susanto | Computer Engineering & AI Portfolio",
    description: "Undergraduate Computer Engineering Student at Diponegoro University focusing on AI Development (Computer Vision) and Software Engineering.",
    type: "website",
    locale: "en_US",
    siteName: "Robertus William Susanto Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robertus William Susanto | Computer Engineering & AI Portfolio",
    description: "Computer Engineering Student at Diponegoro University focusing on AI Development (Computer Vision) and Software Engineering.",
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
  // Schema.org Person Structured Data for High-Authority SEO Indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Robertus William Susanto",
    "jobTitle": "Undergraduate Computer Engineering Student",
    "affiliation": {
      "@type": "EducationalOrganization",
      "name": "Diponegoro University"
    },
    "knowsAbout": [
      "AI Development",
      "Computer Vision",
      "YOLO Framework",
      "Convolutional Neural Networks",
      "Software Engineering",
      "Python",
      "C++"
    ],
    "sameAs": [
      "https://github.com/RobertusWilliamSusanto",
      "https://www.linkedin.com/in/robertuswilliamsusanto"
    ]
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased bg-grid min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-[1320px] mx-auto w-full flex flex-col gap-32">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}