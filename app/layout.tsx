import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import { Alert } from "@/components/Alert";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-gray-900 antialiased">
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
