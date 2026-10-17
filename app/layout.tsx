import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aasra · AI Saathi for Gig Workers",
  description:
    "A multilingual AI companion that helps gig workers understand their earnings, navigate safety and welfare schemes, and draft dispute grievances.",
  applicationName: "Aasra",
  keywords: [
    "gig workers",
    "delivery partners",
    "earnings tracker",
    "welfare schemes",
    "rights",
    "safety",
    "grievance draft",
    "India",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1b4332",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
