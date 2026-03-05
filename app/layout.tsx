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

export const metadata: Metadata = {
  title: "StepZen | Internships for Developers",
  description: "Skip the noise. Find high-quality tech internships, apply instantly, and kickstart your career.",
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
