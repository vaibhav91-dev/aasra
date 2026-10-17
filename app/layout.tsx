import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Aasra · AI Saathi for Gig Workers",
  description:
    "A multilingual AI companion that helps gig workers understand their earnings and take their next step.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
