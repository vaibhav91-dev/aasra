import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Aasra · AI Saathi for Gig Workers",
  description:
    "Understand your earnings, documents, and next steps. A supportive companion for Indian gig and informal workers.",
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
