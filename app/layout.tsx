import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import { Alert } from "@/components/Alert";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://stepzen.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "StepZen | Internships for Developers",
    template: "%s | StepZen",
  },
  description:
    "Skip the noise. Find high-quality tech internships, apply instantly, and kickstart your career.",
  keywords: [
    "internships",
    "developer internships",
    "tech internships",
    "software engineering internships",
    "remote internships",
    "junior developer jobs",
    "career",
    "StepZen",
  ],
  authors: [{ name: "StepZen" }],
  creator: "StepZen",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "StepZen",
    title: "StepZen | Internships for Developers",
    description:
      "Skip the noise. Find high-quality tech internships, apply instantly, and kickstart your career.",
    images: [
      {
        url: "/assets/images/og_image/thumbnail_og.webp",
        width: 1200,
        height: 630,
        alt: "StepZen – Internships for Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StepZen | Internships for Developers",
    description:
      "Skip the noise. Find high-quality tech internships, apply instantly, and kickstart your career.",
    images: ["/assets/images/og_image/thumbnail_og.webp"],
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
    <html lang="en">
      <body className={`${inter.variable} ${bricolage.variable} font-sans text-gray-900 antialiased`}>
        <AuthProvider>
          <AlertProvider>
            <Alert />
            {children}
          </AlertProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
